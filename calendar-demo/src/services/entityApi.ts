/**
 * Entity API - CRUD operations
 */

import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

export const deleteEntity = async <T>(entityType: string, id: string): Promise<T> => {
  const response = await apiClient.delete<ApiResponse<T>>(`/${entityType}/${id}`);
  return response.data.data;
};

export const updateEntity = async <T>(entityType: string, id: string, data: any): Promise<T> => {
  const response = await apiClient.put<ApiResponse<T>>(`/${entityType}/${id}`, data);
  return response.data.data;
};

export const scheduleReminder = async (data: any) => {
  const response = await apiClient.post('/reminders', data);
  return response.data.data;
};

export const updateReminder = async (id: string, data: any) => {
  const response = await apiClient.put(`/reminders/${id}`, data);
  return response.data.data;
};

export const fetchOwnerPets = async (ownerId: string) => {
  const response = await apiClient.get('/pets', {
    params: { OwnerId: ownerId, page: 1, perPage: 100 }
  });
  return response.data.data.items ?? [];
};
