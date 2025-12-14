/**
 * Calendar Time Utilities
 * Các hàm tiện ích để xử lý thời gian trong calendar module
 */

/**
 * Chuyển đổi value thành time string (HH:MM)
 */
export const toTimeString = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  // Xử lý format ISO datetime
  const isoMatch = raw.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }

  // Xử lý format HH:MM
  const timeMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const hours = Number.parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    if (hours >= 0 && hours <= 23 && /^\d{2}$/.test(minutes)) {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }

  // Xử lý format HH:MM:SS
  const timeWithSecondsMatch = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (timeWithSecondsMatch) {
    const hours = Number.parseInt(timeWithSecondsMatch[1], 10);
    const minutes = timeWithSecondsMatch[2];
    if (hours >= 0 && hours <= 23 && /^\d{2}$/.test(minutes)) {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }

  return null;
};

/**
 * Coerce time input value
 */
export const coerceTimeInputValue = (value: unknown): string => toTimeString(value) ?? '';

/**
 * Convert time string to minutes
 */
export const timeToMinutes = (timeString: string | null): number | null => {
  if (!timeString) {
    return null;
  }
  const [hours, minutes] = timeString.split(':').map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
};
