/**
 * Calendar Date Utilities
 * Các hàm tiện ích để xử lý ngày tháng trong calendar module
 */

/**
 * Format date thành key string (YYYY-MM-DD)
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get month key (YYYY-MM)
 */
export const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Chuyển đổi input thành date key format
 */
export const coerceDateKey = (input: unknown): string => {
  if (!input) {
    return '';
  }

  if (typeof input === 'string') {
    const isoMatch = input.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      return isoMatch[1];
    }
  }

  // Xử lý ngày tháng với timezone local để tránh lỗi hiển thị
  let dateValue: Date;
  if (input instanceof Date) {
    dateValue = input;
  } else {
    const inputStr = String(input);
    // Nếu là format YYYY-MM-DD, tạo date với timezone local
    if (inputStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = inputStr.split('-').map(Number);
      dateValue = new Date(year, month - 1, day);
    } else {
      dateValue = new Date(input as string | number);
    }
  }

  if (Number.isNaN(dateValue.getTime())) {
    return '';
  }

  return formatDateKey(dateValue);
};
