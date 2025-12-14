/**
 * Reminder Utilities
 * Các hàm tiện ích để xử lý reminder data
 */

import type { Reminder, Pet } from '../../types/api';
import { coerceDateKey } from './dateUtils';
import { toTimeString, timeToMinutes } from './timeUtils';

/**
 * Get date key từ reminder
 */
export const reminderDateKey = (reminder: Reminder): string => coerceDateKey(reminder.ReminderDate);

/**
 * Get reminder title
 */
export const getReminderTitle = (reminder: Reminder): string => {
  const type = reminder.ReminderType ? String(reminder.ReminderType).trim() : '';
  if (type) {
    return type;
  }

  const message = reminder.Message ? String(reminder.Message).trim() : '';
  if (message) {
    return message;
  }

  return 'Nhắc hẹn';
};

/**
 * Get reminder subtitle
 */
export const getReminderSubtitle = (reminder: Reminder, title: string): string | null => {
  const message = reminder.Message ? String(reminder.Message).trim() : '';
  if (message && message !== title) {
    return message;
  }

  return null;
};

/**
 * Format owner display
 */
export const formatOwnerDisplay = (reminder: Reminder): string | null => {
  const name = reminder.OwnerName ? String(reminder.OwnerName).trim() : '';
  const phone = reminder.OwnerPhone ? String(reminder.OwnerPhone).trim() : '';

  if (name && phone) {
    return `${name} · ${phone}`;
  }

  if (name) {
    return name;
  }

  if (phone) {
    return phone;
  }

  return null;
};

/**
 * Format reminder time
 */
export const formatReminderTime = (reminder: Reminder): string | null => toTimeString(reminder.ReminderTime);

/**
 * Get reminder minutes
 */
export const reminderMinutes = (reminder: Reminder): number | null => {
  const time = formatReminderTime(reminder);
  return timeToMinutes(time);
};

/**
 * Get pet names from comma-separated IDs
 */
export const getPetNamesFromIds = (petIdString: string | undefined, petsList: Pet[]): string[] => {
  if (!petIdString || typeof petIdString !== 'string') return [];
  
  const petIds = petIdString.split(',').map(id => id.trim()).filter(Boolean);
  const petMap = new Map(petsList.map(pet => [String(pet.ID), pet.Name || `Pet #${pet.ID}`]));
  
  return petIds.map(id => petMap.get(id) || `Pet #${id}`);
};
