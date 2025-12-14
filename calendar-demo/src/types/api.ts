/**
 * API Types - Mock types for calendar demo
 */

export type Reminder = {
  _id: string;
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
  createdAt?: string;
  updatedAt?: string;
};

export type Pet = {
  _id: string;
  Name: string;
  Species: string;
  Breed?: string;
  Age?: number;
  Weight?: number;
  OwnerId: string;
};

export type Owner = {
  _id: string;
  Name: string;
  Phone: string;
  Email?: string;
  Address?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
};

export type OwnerOption = {
  _id: string;
  Name: string;
  Phone: string;
};
