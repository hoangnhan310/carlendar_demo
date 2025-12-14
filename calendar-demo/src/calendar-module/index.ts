/**
 * Calendar Module - Index
 * Export tất cả các thành phần của calendar module
 */

// Main component
export { default as CalendarPage } from './CalendarPage';

// Hooks
export { useCalendar } from './hooks/useCalendar';

// Types
export type { CalendarDay, CalendarFormValues, Notification } from './types';

// Constants
export {
  DAY_NAMES,
  DEFAULT_CALENDAR_FORM_VALUES,
  AUTO_REFRESH_INTERVAL,
  PETS_CACHE_STALE_TIME
} from './constants';

// Utilities - Date
export { formatDateKey, getMonthKey, coerceDateKey } from './utils/dateUtils';

// Utilities - Time
export { toTimeString, coerceTimeInputValue, timeToMinutes } from './utils/timeUtils';

// Utilities - Reminder
export {
  reminderDateKey,
  getReminderTitle,
  getReminderSubtitle,
  formatOwnerDisplay,
  formatReminderTime,
  reminderMinutes,
  getPetNamesFromIds
} from './utils/reminderUtils';

// Utilities - Error
export { extractErrorMessage } from './utils/errorUtils';
