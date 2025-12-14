import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../services/apiClient';
import { deleteEntity, fetchOwnerPets, scheduleReminder, updateEntity } from '../services/entityApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useOwnerSearch, type OwnerOption } from '../hooks/useOwnerSearch';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { ApiResponse, PaginatedResponse, Pet, Reminder } from '../types/api';
import {
  DEFAULT_REMINDER_STATUS,
  REMINDER_STATUS_OPTIONS,
  normalizeReminderStatus,
  reminderStatusClass,
  reminderStatusLabel
} from '../constants/reminderStatus';
import { useCalendar } from './hooks/useCalendar';
import { formatDateKey } from './utils/dateUtils';
import { coerceTimeInputValue } from './utils/timeUtils';
import {
  reminderDateKey,
  getReminderTitle,
  formatOwnerDisplay,
  formatReminderTime,
  getPetNamesFromIds
} from './utils/reminderUtils';
import { extractErrorMessage } from './utils/errorUtils';
import { DAY_NAMES, DEFAULT_CALENDAR_FORM_VALUES, AUTO_REFRESH_INTERVAL, PETS_CACHE_STALE_TIME } from './constants';
import type { CalendarFormValues, Notification } from './types';
import './styles/calendar.css';

const fetchReminders = async (): Promise<Reminder[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Reminder>>>('/reminders', {
    params: { page: 1, perPage: 500 }
  });
  return response.data.data.items ?? [];
};

const fetchAllPets = async (): Promise<Pet[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Pet>>>('/pets', {
    params: { page: 1, perPage: 1000 }
  });
  return response.data.data.items ?? [];
};

const clearCache = async (): Promise<void> => {
  try {
    await apiClient.post('/cache/clear/reminders');
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

const CalendarPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerOption | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const formId = 'calendar-reminder-form';

  const confirmDialog = useConfirmDialog();

  // Auto-refresh functionality
  const { isRefreshing: isAutoRefreshing, setRefetchCallback } = useAutoRefresh('reminders', AUTO_REFRESH_INTERVAL);

  const queryClient = useQueryClient();

  // Fetch all pets for name lookup
  const { data: allPets = [] } = useQuery({
    queryKey: ['pets', 'all'],
    queryFn: fetchAllPets,
    staleTime: PETS_CACHE_STALE_TIME
  });

  const { register, handleSubmit, reset, setValue, formState, watch } = useForm<CalendarFormValues>({
    defaultValues: DEFAULT_CALENDAR_FORM_VALUES
  });

  const {
    term: ownerTerm,
    setTerm: setOwnerTerm,
    results: ownerResults,
    isFetching: isOwnerFetching,
    hasQuery
  } = useOwnerSearch();

  const ownerIdForPets = watch('OwnerId');
  const petIdsValue = watch('PetIds');
  const petNamesValue = watch('PetNames');

  const {
    data: reminders = [],
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery<Reminder[]>({
    queryKey: ['calendar-reminders'],
    queryFn: fetchReminders
  });

  const handleRefresh = async () => {
    await clearCache();
    refetch();
  };

  // Set up auto-refresh callback
  useEffect(() => {
    setRefetchCallback(() => refetch);
  }, [setRefetchCallback, refetch]);

  const { data: ownerPets = [], isFetching: isPetsFetching } = useQuery<Pet[]>({
    queryKey: ['owner-pets', ownerIdForPets],
    queryFn: () => fetchOwnerPets(ownerIdForPets),
    enabled: isFormOpen && Boolean(ownerIdForPets)
  });

  // Use calendar hook
  const {
    selectedDateKey,
    setSelectedDateKey,
    monthEvents,
    calendarDays,
    selectedDay,
    selectedDayEvents,
    monthLabel,
    selectedDayLabel,
    changeMonth,
    goToToday
  } = useCalendar(reminders);

  useEffect(() => {
    if (calendarDays.length === 0) {
      return;
    }

    const hasSelected = calendarDays.some((day) => day.dateKey === selectedDateKey);

    if (!hasSelected) {
      const fallbackDay = calendarDays.find((day) => day.isCurrentMonth) ?? calendarDays[0];
      if (fallbackDay) {
        setSelectedDateKey(fallbackDay.dateKey);
      }
    }
  }, [calendarDays, selectedDateKey, setSelectedDateKey]);

  const scheduleMutation = useMutation({
    mutationFn: async (values: CalendarFormValues) => {
      // Xử lý ngày tháng để đảm bảo format đúng
      let reminderDate = values.ReminderDate?.trim() ?? '';
      if (reminderDate) {
        const dateMatch = reminderDate.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          reminderDate = dateMatch[1];
        } else {
          const parsedDate = new Date(reminderDate);
          if (!Number.isNaN(parsedDate.getTime())) {
            reminderDate = formatDateKey(parsedDate);
          }
        }
      }

      // Xử lý thời gian để đảm bảo format đúng
      const reminderTime = coerceTimeInputValue(values.ReminderTime);
      if (!reminderTime) {
        throw new Error('Thời gian không hợp lệ');
      }

      const reminderType = values.ReminderType ? String(values.ReminderType).trim() : '';
      const message = values.Message ? String(values.Message).trim() : '';
      const ownerId = String(values.OwnerId ?? '').trim();
      const ownerName = values.OwnerName ? String(values.OwnerName).trim() : '';
      const ownerPhone = values.OwnerPhone ? String(values.OwnerPhone).trim() : undefined;
      const petIds = values.PetIds || [];
      const petNames = values.PetNames || [];
      const status = normalizeReminderStatus(values.Status);

      // Validate required fields
      if (!reminderDate || !reminderTime || !reminderType || !message || !ownerId || petIds.length === 0) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Validation 1: Kiểm tra không cho tạo lịch hẹn trong quá khứ
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
      const now = new Date();
      if (reminderDateTime < now) {
        throw new Error('Không thể tạo lịch hẹn trong quá khứ. Vui lòng chọn ngày giờ trong tương lai.');
      }

      // Validation 2: Kiểm tra trùng lịch (cùng owner, cùng ngày giờ)
      const duplicateReminder = reminders.find((r) => {
        if (String(r.OwnerId) !== ownerId) return false;
        if (reminderDateKey(r) !== reminderDate) return false;
        const existingTime = formatReminderTime(r);
        if (existingTime !== reminderTime) return false;
        return true;
      });

      if (duplicateReminder) {
        throw new Error(
          `Trùng lịch hẹn! Khách hàng "${ownerName}" đã có lịch hẹn "${duplicateReminder.ReminderType}" vào ${reminderDate} lúc ${reminderTime}. Vui lòng chọn thời gian khác.`
        );
      }

      const result = await scheduleReminder({
        ownerId,
        ownerName,
        ownerPhone,
        petIds,
        petNames,
        reminderDate,
        reminderTime,
        reminderType,
        message,
        status,
        createCalendarEvent: false
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-reminders'] });
      setNotification({ type: 'success', message: 'Đã lưu nhắc hẹn thành công.' });
      closeForm();
    },
    onError: (error) => {
      setNotification({ type: 'error', message: extractErrorMessage(error) });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ values, id }: { values: CalendarFormValues; id: string }) => {
      // Xử lý ngày tháng để đảm bảo format đúng
      let reminderDate = values.ReminderDate?.trim() ?? '';
      if (reminderDate) {
        const dateMatch = reminderDate.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          reminderDate = dateMatch[1];
        } else {
          const parsedDate = new Date(reminderDate);
          if (!Number.isNaN(parsedDate.getTime())) {
            reminderDate = formatDateKey(parsedDate);
          }
        }
      }

      // Xử lý thời gian để đảm bảo format đúng
      const reminderTime = coerceTimeInputValue(values.ReminderTime);
      if (!reminderTime) {
        throw new Error('Thời gian không hợp lệ');
      }

      const petIds = values.PetIds || [];
      const petId = petIds.length > 0 ? petIds[0] : '';
      const ownerId = String(values.OwnerId ?? '').trim();
      const ownerName = values.OwnerName ? String(values.OwnerName).trim() : '';

      // Validation 1: Kiểm tra không cho sửa thành lịch hẹn trong quá khứ
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
      const now = new Date();
      if (reminderDateTime < now) {
        throw new Error('Không thể đặt lịch hẹn trong quá khứ. Vui lòng chọn ngày giờ trong tương lai.');
      }

      // Validation 2: Kiểm tra trùng lịch (không tính chính nó)
      const duplicateReminder = reminders.find((r) => {
        if (String(r.ID) === String(id)) return false;
        if (String(r.OwnerId) !== ownerId) return false;
        if (reminderDateKey(r) !== reminderDate) return false;
        const existingTime = formatReminderTime(r);
        if (existingTime !== reminderTime) return false;
        return true;
      });

      if (duplicateReminder) {
        throw new Error(
          `Trùng lịch hẹn! Khách hàng "${ownerName}" đã có lịch hẹn "${duplicateReminder.ReminderType}" vào ${reminderDate} lúc ${reminderTime}. Vui lòng chọn thời gian khác.`
        );
      }

      return updateEntity<Reminder>('reminders', id, {
        OwnerId: String(values.OwnerId ?? '').trim(),
        OwnerName: values.OwnerName ? String(values.OwnerName).trim() : '',
        OwnerPhone: values.OwnerPhone ? String(values.OwnerPhone).trim() : '',
        PetId: String(petId).trim(),
        ReminderDate: reminderDate,
        ReminderTime: reminderTime,
        ReminderType: values.ReminderType ? String(values.ReminderType).trim() : '',
        Message: values.Message ? String(values.Message).trim() : '',
        Status: normalizeReminderStatus(values.Status)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-reminders'] });
      setNotification({ type: 'success', message: 'Đã cập nhật nhắc hẹn.' });
      closeForm();
    },
    onError: (error) => {
      setNotification({ type: 'error', message: extractErrorMessage(error) });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEntity<Reminder>('reminders', id),
    onSuccess: (_, id) => {
      const normalizedId = String(id);
      queryClient.setQueryData<Reminder[]>(['calendar-reminders'], (previous) =>
        (previous ?? []).filter((reminder) => String(reminder.ID) !== normalizedId)
      );
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-reminders'] });
      setNotification({ type: 'success', message: 'Đã xóa nhắc hẹn.' });
    },
    onError: (error) => {
      setNotification({ type: 'error', message: extractErrorMessage(error) });
    }
  });

  const resetOwnerState = () => {
    setSelectedOwner(null);
    setOwnerTerm('');
    setShowOwnerSuggestions(false);
    setValue('OwnerId', '', { shouldValidate: true });
    setValue('OwnerName', '');
    setValue('OwnerPhone', '');
    setValue('PetIds', [], { shouldValidate: true });
    setValue('PetNames', []);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReminder(null);
    reset(DEFAULT_CALENDAR_FORM_VALUES);
    resetOwnerState();
  };

  const openCreateForm = (date?: Date) => {
    setEditingReminder(null);
    const targetDateKey = date ? formatDateKey(date) : selectedDateKey;
    reset({
      ...DEFAULT_CALENDAR_FORM_VALUES,
      ReminderDate: targetDateKey
    });
    resetOwnerState();
    setIsFormOpen(true);
    setNotification(null);
  };

  const openEditForm = async (reminder: Reminder) => {
    setEditingReminder(reminder);
    
    const petIdString = reminder.PetId && typeof reminder.PetId === 'string' ? reminder.PetId : '';
    const petIds = petIdString 
      ? petIdString.split(',').map(id => id.trim()).filter(Boolean)
      : [];
    
    const petNames = petIds.map(id => {
      const pet = allPets.find(p => String(p.ID) === id);
      return pet?.Name || `Pet #${id}`;
    });
    
    reset({
      OwnerId: reminder.OwnerId ?? '',
      OwnerName: reminder.OwnerName ?? '',
      OwnerPhone: reminder.OwnerPhone ?? '',
      PetIds: petIds,
      PetNames: petNames,
      ReminderDate: reminderDateKey(reminder),
      ReminderTime: coerceTimeInputValue(reminder.ReminderTime),
      ReminderType: reminder.ReminderType ?? '',
      Message: reminder.Message ?? '',
      Status: normalizeReminderStatus(reminder.Status)
    });
    if (reminder.OwnerId) {
      setSelectedOwner({
        ID: reminder.OwnerId,
        FullName: reminder.OwnerName ?? '',
        Phone: reminder.OwnerPhone,
        Email: ''
      });
      setOwnerTerm(reminder.OwnerName ?? reminder.OwnerPhone ?? '');
    } else {
      resetOwnerState();
    }
    setShowOwnerSuggestions(false);
    setIsFormOpen(true);
    setNotification(null);
  };

  const onSubmit = handleSubmit((values) => {
    const trimmedDate = values.ReminderDate?.slice(0, 10);
    if (trimmedDate) {
      setSelectedDateKey(trimmedDate);
    }

    if (!values.PetIds || values.PetIds.length === 0) {
      setNotification({ type: 'error', message: 'Vui lòng chọn ít nhất một thú cưng.' });
      return;
    }

    setNotification(null);
    if (editingReminder) {
      updateMutation.mutate({ values, id: editingReminder.ID });
    } else {
      scheduleMutation.mutate(values);
    }
  });

  const handleDelete = (reminder: Reminder) => {
    confirmDialog.showConfirm(
      'Xóa nhắc hẹn',
      `Bạn có chắc chắn muốn xóa nhắc hẹn "${reminder.ReminderType}"?`,
      () => deleteMutation.mutate(String(reminder.ID)),
      {
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'danger'
      }
    );
  };

  const handleOwnerInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOwnerTerm(value);
    setShowOwnerSuggestions(true);

    if (selectedOwner && value !== (selectedOwner.FullName || selectedOwner.Phone || '')) {
      setSelectedOwner(null);
      setValue('OwnerId', '', { shouldValidate: true });
      setValue('OwnerName', '');
      setValue('OwnerPhone', '');
      setValue('PetIds', [], { shouldValidate: true });
      setValue('PetNames', []);
    }
  };

  const handleOwnerSelect = (owner: OwnerOption) => {
    setSelectedOwner(owner);
    setOwnerTerm(owner.FullName || owner.Phone || '');
    setShowOwnerSuggestions(false);
    setValue('OwnerId', String(owner.ID), { shouldValidate: true });
    setValue('OwnerName', owner.FullName ?? '');
    setValue('OwnerPhone', owner.Phone ?? '');
    setValue('PetIds', [], { shouldValidate: true });
    setValue('PetNames', []);
  };

  const clearSelectedOwner = () => {
    resetOwnerState();
  };

  const handlePetSelect = (pet: Pet) => {
    const petId = String(pet.ID);
    const petName = pet.Name ?? '';

    const currentPetIds = petIdsValue || [];
    const currentPetNames = petNamesValue || [];

    if (currentPetIds.includes(petId)) {
      const newPetIds = currentPetIds.filter((id) => id !== petId);
      const newPetNames = currentPetNames.filter((_, index) => currentPetIds[index] !== petId);
      setValue('PetIds', newPetIds, { shouldValidate: true });
      setValue('PetNames', newPetNames, { shouldValidate: true });
    } else {
      const newPetIds = [...currentPetIds, petId];
      const newPetNames = [...currentPetNames, petName];
      setValue('PetIds', newPetIds, { shouldValidate: true });
      setValue('PetNames', newPetNames, { shouldValidate: true });
    }
  };

  const removePet = (petId: string) => {
    const currentPetIds = petIdsValue || [];
    const currentPetNames = petNamesValue || [];

    const petIndex = currentPetIds.indexOf(petId);
    if (petIndex !== -1) {
      const newPetIds = currentPetIds.filter((id) => id !== petId);
      const newPetNames = currentPetNames.filter((_, index) => index !== petIndex);
      setValue('PetIds', newPetIds, { shouldValidate: true });
      setValue('PetNames', newPetNames, { shouldValidate: true });
    }
  };

  return (
    <section className="panel entity-panel">
      <header className="panel-header">
        <div>
          <h2 className="panel-title">Lịch nhắc hẹn</h2>
          <p className="panel-description">Hiển thị các cuộc hẹn trong bảng nhắc hẹn theo dạng lịch</p>
          <div className="panel-meta">
            Tháng này có {monthEvents.length} cuộc hẹn
            {isFetching && <span> · Đang đồng bộ...</span>}
            {isAutoRefreshing && <span> · Đang cập nhật tự động...</span>}
          </div>
        </div>
        <div className="action-bar">
          <button className="button-secondary" type="button" onClick={handleRefresh} disabled={isFetching}>
            Làm mới
          </button>
          <button className="button-primary" type="button" onClick={() => openCreateForm()}>
            Tạo nhắc hẹn
          </button>
        </div>
      </header>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingReminder ? 'Cập nhật nhắc hẹn' : 'Tạo nhắc hẹn mới'}
        description="Điền thông tin khách hàng và lịch hẹn để hiển thị trên lịch."
        size="lg"
        footer={
          <div className="modal-actions">
            <button className="button-muted" type="button" onClick={closeForm}>
              Hủy
            </button>
            <button
              className="button-primary"
              type="submit"
              form={formId}
              disabled={scheduleMutation.isPending || updateMutation.isPending}
            >
              {editingReminder
                ? updateMutation.isPending
                  ? 'Đang cập nhật...'
                  : 'Cập nhật'
                : scheduleMutation.isPending
                  ? 'Đang tạo...'
                  : 'Lưu nhắc hẹn'}
            </button>
          </div>
        }
      >
        {notification && (
          <div className={`inline-notification ${notification.type}`} role="alert">
            <span>{notification.message}</span>
            <button type="button" aria-label="Đóng thông báo" onClick={() => setNotification(null)}>
              ×
            </button>
          </div>
        )}
        
        <form id={formId} className="modal-form" onSubmit={onSubmit}>
          <input type="hidden" {...register('OwnerId', { required: true })} />
          <input type="hidden" {...register('OwnerName')} />
          <input type="hidden" {...register('OwnerPhone')} />
          <div className="form-sections">
            <section className="form-section">
              <h4 className="form-section-title">Khách hàng & Thú cưng</h4>
              <div className="form-grid two">
                <div className="form-field lookup-field">
                  <span>Khách hàng *</span>
                  <div className="lookup-input">
                    <input
                      type="text"
                      value={ownerTerm}
                      onChange={handleOwnerInputChange}
                      onFocus={() => setShowOwnerSuggestions(true)}
                      placeholder="Nhập tên hoặc số điện thoại..."
                      autoComplete="off"
                    />
                    {showOwnerSuggestions && hasQuery && (
                      <div className="lookup-dropdown">
                        {isOwnerFetching && <div className="lookup-empty">Đang tìm kiếm...</div>}
                        {!isOwnerFetching && ownerResults.length === 0 && (
                          <div className="lookup-empty">Không tìm thấy khách hàng phù hợp</div>
                        )}
                        {!isOwnerFetching &&
                          ownerResults.map((owner) => (
                            <button
                              key={owner.ID}
                              type="button"
                              className="lookup-option"
                              onClick={() => handleOwnerSelect(owner)}
                            >
                              <strong>{owner.FullName}</strong>
                              <span>{owner.Phone || owner.Email || 'Chưa có thông tin liên hệ'}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  {selectedOwner && (
                    <div className="lookup-selected">
                      <div>
                        <strong>{selectedOwner.FullName}</strong>
                        <small>{selectedOwner.Phone || selectedOwner.Email || 'Chưa có liên hệ'}</small>
                      </div>
                      <button type="button" onClick={clearSelectedOwner}>
                        Đổi
                      </button>
                    </div>
                  )}
                  {formState.errors.OwnerId && <div className="form-error">Vui lòng chọn khách hàng.</div>}
                </div>
                <label className="form-field">
                  <span>Thú cưng *</span>
                  {selectedOwner && (
                    <div className="lookup-pet-suggestions">
                      {isPetsFetching && <div className="lookup-empty inline">Đang tải thú cưng...</div>}
                      {!isPetsFetching && ownerPets.length === 0 && (
                        <div className="lookup-empty inline">Khách hàng này chưa có thú cưng.</div>
                      )}
                      {!isPetsFetching && ownerPets.length > 0 && (
                        <div className="lookup-chip-list">
                          {ownerPets.map((pet) => {
                            const isSelected = petIdsValue?.includes(String(pet.ID)) || false;
                            return (
                              <button
                                key={pet.ID}
                                type="button"
                                className={`lookup-chip${isSelected ? ' active' : ''}`}
                                onClick={() => handlePetSelect(pet)}
                              >
                                <strong>{pet.Name}</strong>
                                <span>#{pet.ID}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {petIdsValue && petIdsValue.length > 0 && (
                    <div className="selected-pets">
                      <div className="selected-pets-label">Thú cưng đã chọn:</div>
                      <div className="selected-pets-list">
                        {petIdsValue.map((petId, index) => {
                          const petName = petNamesValue?.[index] || '';
                          return (
                            <div key={petId} className="selected-pet-chip">
                              <span>{petName}</span>
                              <button type="button" onClick={() => removePet(petId!)} className="remove-pet-btn">
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {(!petIdsValue || petIdsValue.length === 0) && (
                    <div className="form-error">Vui lòng chọn ít nhất một thú cưng.</div>
                  )}
                </label>
              </div>
            </section>

            <section className="form-section">
              <h4 className="form-section-title">Chi tiết lịch hẹn</h4>
              <div className="form-grid two">
                <label className="form-field">
                  <span>Ngày hẹn *</span>
                  <input type="date" {...register('ReminderDate', { required: true })} />
                  {formState.errors.ReminderDate && <div className="form-error">Chọn ngày hẹn hợp lệ.</div>}
                </label>
                <label className="form-field">
                  <span>Giờ hẹn *</span>
                  <input type="time" step={60} {...register('ReminderTime', { required: true })} />
                  {formState.errors.ReminderTime && <div className="form-error">Chọn giờ hẹn hợp lệ.</div>}
                </label>
                <label className="form-field">
                  <span>Loại nhắc hẹn *</span>
                  <input type="text" {...register('ReminderType', { required: true })} />
                  {formState.errors.ReminderType && <div className="form-error">Vui lòng nhập loại nhắc hẹn.</div>}
                </label>
                <label className="form-field wide">
                  <span>Nội dung *</span>
                  <input type="text" {...register('Message', { required: true })} />
                  {formState.errors.Message && <div className="form-error">Vui lòng nhập nội dung.</div>}
                </label>
                {editingReminder && (
                  <label className="form-field">
                    <span>Trạng thái</span>
                    <select {...register('Status')}>
                      {REMINDER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </section>
          </div>
        </form>
      </Modal>

      {(isLoading || isFetching) && reminders.length === 0 && (
        <div className="panel-message">Đang tải dữ liệu nhắc hẹn...</div>
      )}
      {error && <div className="panel-message">Lỗi tải dữ liệu: {(error as Error).message}</div>}
      {(scheduleMutation.isError || updateMutation.isError) && !notification && (
        <div className="panel-message">
          Lỗi lưu nhắc hẹn: {((scheduleMutation.error || updateMutation.error) as Error).message}
        </div>
      )}
      {deleteMutation.isError && !notification && (
        <div className="panel-message">Lỗi xóa nhắc hẹn: {(deleteMutation.error as Error).message}</div>
      )}

      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-toolbar">
            <div className="calendar-toolbar-controls">
              <button type="button" className="button-muted" onClick={() => changeMonth(-1)}>
                Tháng trước
              </button>
              <button type="button" className="button-muted" onClick={goToToday}>
                Hôm nay
              </button>
              <button type="button" className="button-muted" onClick={() => changeMonth(1)}>
                Tháng sau
              </button>
            </div>
            <h3 className="calendar-month-label">{monthLabel}</h3>
            <div className="calendar-toolbar-status">
              <span>{monthEvents.length} nhắc hẹn</span>
            </div>
          </div>

          <div className="calendar-grid">
            {DAY_NAMES.map((dayName, index) => (
              <div key={dayName} className={`calendar-day-name${index >= 5 ? ' weekend' : ''}`}>
                {dayName}
              </div>
            ))}
            {calendarDays.map((day) => {
              const cellClasses = [
                'calendar-cell',
                day.isCurrentMonth ? '' : 'outside',
                day.dateKey === selectedDateKey ? 'selected' : '',
                day.isToday ? 'today' : '',
                day.isWeekend ? 'weekend' : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={day.dateKey}
                  className={cellClasses}
                  onClick={() => setSelectedDateKey(day.dateKey)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedDateKey(day.dateKey);
                    }
                  }}
                >
                  <div className="calendar-cell-header">
                    <span className="calendar-date">{day.date.getDate()}</span>
                  </div>
                  <div className="calendar-events">
                    {day.events.slice(0, 2).map((event) => {
                      const ownerDisplay = formatOwnerDisplay(event);
                      const fallbackTitle = getReminderTitle(event);
                      const reminderTime = formatReminderTime(event);

                      return (
                        <div
                          key={event.ID}
                          className={`calendar-event-chip ${reminderStatusClass(event.Status)}`}
                          role="button"
                          tabIndex={0}
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            openEditForm(event);
                          }}
                          onKeyDown={(keyEvent) => {
                            if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                              keyEvent.preventDefault();
                              keyEvent.stopPropagation();
                              openEditForm(event);
                            }
                          }}
                        >
                          {reminderTime && <span className="calendar-event-time">{reminderTime}</span>}
                          <span className="calendar-event-owner">
                            {ownerDisplay ?? fallbackTitle}
                          </span>
                        </div>
                      );
                    })}
                    {day.events.length > 2 && (
                      <span className="calendar-more">+{day.events.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="calendar-sidebar">
          <div className="calendar-sidebar-header">
            <div>
              <h3 className="calendar-sidebar-title">Chi tiết trong ngày</h3>
              <p className="calendar-sidebar-date">{selectedDayLabel}</p>
            </div>
            <button
              type="button"
              className="button-secondary"
              onClick={() => selectedDay && openCreateForm(selectedDay.date)}
            >
              + Tạo mới
            </button>
          </div>

          <div className="calendar-sidebar-body">
            {selectedDayEvents.length === 0 && (
              <div className="empty-state subtle">Không có nhắc hẹn nào trong ngày.</div>
            )}

            {selectedDayEvents.map((event) => {
              const title = getReminderTitle(event);
              const message = event.Message ? String(event.Message).trim() : undefined;
              const ownerName = event.OwnerName ? String(event.OwnerName).trim() : undefined;
              const ownerPhone = event.OwnerPhone ? String(event.OwnerPhone).trim() : undefined;
              const reminderTime = formatReminderTime(event);
              const petNames = getPetNamesFromIds(event.PetId, allPets);

              return (
                <div key={event.ID} className="calendar-sidebar-event">
                  <div className="calendar-sidebar-event-header">
                    <h4>{title}</h4>
                    <span className={`status-chip ${reminderStatusClass(event.Status)}`}>
                      {reminderStatusLabel(event.Status)}
                    </span>
                  </div>
                  {message && message !== title && <p>{message}</p>}
                  <div className="calendar-sidebar-meta">
                    {reminderTime && <span>⏰ {reminderTime}</span>}
                    {ownerName && <span>👤 {ownerName}</span>}
                    {ownerPhone && <span>📞 {ownerPhone}</span>}
                    {petNames.length > 0 && (
                      <span>🐾 Thú cưng: {petNames.join(', ')}</span>
                    )}
                  </div>
                  <div className="calendar-sidebar-actions">
                    <button type="button" className="button-link" onClick={() => openEditForm(event)}>
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="button-link danger"
                      onClick={() => handleDelete(event)}
                      disabled={deleteMutation.isPending}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
        type={confirmDialog.type}
      />
    </section>
  );
};

export default CalendarPage;
