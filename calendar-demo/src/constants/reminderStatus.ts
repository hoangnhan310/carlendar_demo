/**
 * Reminder Status Constants
 */

export const REMINDER_STATUS_PENDING = 'Pending';
export const REMINDER_STATUS_COMPLETED = 'Completed';
export const REMINDER_STATUS_CANCELLED = 'Cancelled';

export const DEFAULT_REMINDER_STATUS = REMINDER_STATUS_PENDING;

export const REMINDER_STATUS_OPTIONS = [
  { value: REMINDER_STATUS_PENDING, label: 'Pending' },
  { value: REMINDER_STATUS_COMPLETED, label: 'Completed' },
  { value: REMINDER_STATUS_CANCELLED, label: 'Cancelled' }
];

export const normalizeReminderStatus = (status?: string): string => {
  if (!status) return DEFAULT_REMINDER_STATUS;
  const normalized = status.trim();
  if ([REMINDER_STATUS_PENDING, REMINDER_STATUS_COMPLETED, REMINDER_STATUS_CANCELLED].includes(normalized)) {
    return normalized;
  }
  return DEFAULT_REMINDER_STATUS;
};

export const reminderStatusLabel = (status: string): string => {
  const option = REMINDER_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

export const reminderStatusClass = (status: string): string => {
  switch (status) {
    case REMINDER_STATUS_COMPLETED:
      return 'status-completed';
    case REMINDER_STATUS_CANCELLED:
      return 'status-cancelled';
    case REMINDER_STATUS_PENDING:
    default:
      return 'status-pending';
  }
};
