/**
 * Error Handling Utilities
 * Các hàm tiện ích để xử lý lỗi
 */

import type { AxiosError } from 'axios';

/**
 * Extract error message từ các loại error khác nhau
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'Đã xảy ra lỗi không xác định.';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const responseMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
    if (responseMessage) {
      return responseMessage;
    }
    if (axiosError.response?.status && axiosError.response.status >= 400) {
      return error.message || `Yêu cầu thất bại với mã ${axiosError.response.status}.`;
    }
    return error.message || 'Đã xảy ra lỗi không xác định.';
  }

  if (typeof (error as { message?: string }).message === 'string') {
    return (error as { message?: string }).message as string;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Đã xảy ra lỗi không xác định.';
  }
};
