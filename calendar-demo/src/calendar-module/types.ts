/**
 * Calendar Module Types
 * Type definitions cho calendar module
 */

import type { Reminder } from '../types/api';

/**
 * Calendar Day representation
 */
export type CalendarDay = {
  date: Date;
  dateKey: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  events: Reminder[];
};

/**
 * Calendar Form Values
 */
export type CalendarFormValues = {
  OwnerId: string;
  OwnerName: string;
  OwnerPhone?: string;
  PetIds: string[];
  PetNames: string[];
  ReminderDate: string;
  ReminderTime: string;
  ReminderType: string;
  Message: string;
  Status: string;
};

/**
 * Notification type
 */
export type Notification = {
  type: 'error' | 'success';
  message: string;
};
