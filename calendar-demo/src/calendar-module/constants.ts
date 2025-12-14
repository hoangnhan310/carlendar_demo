/**
 * Calendar Constants
 * Các hằng số sử dụng trong calendar module
 */

import { DEFAULT_REMINDER_STATUS } from '../constants/reminderStatus';
import type { CalendarFormValues } from './types';

/**
 * Tên các ngày trong tuần (tiếng Việt, viết tắt)
 */
export const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Default form values cho calendar reminder form
 */
export const DEFAULT_CALENDAR_FORM_VALUES: CalendarFormValues = {
  OwnerId: '',
  OwnerName: '',
  OwnerPhone: '',
  PetIds: [],
  PetNames: [],
  ReminderDate: '',
  ReminderTime: '',
  ReminderType: '',
  Message: '',
  Status: DEFAULT_REMINDER_STATUS
};

/**
 * Auto-refresh interval (milliseconds)
 */
export const AUTO_REFRESH_INTERVAL = 15000; // 15 seconds

/**
 * Stale time cho cache queries (milliseconds)
 */
export const PETS_CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes
