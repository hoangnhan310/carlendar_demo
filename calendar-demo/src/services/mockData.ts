/**
 * Mock Data for Calendar Demo
 */

import type { Reminder, Pet, Owner } from '../types/api';

// Mock Owners
export const mockOwners: Owner[] = [
  { _id: '1', Name: 'Nguyễn Văn A', Phone: '0901234567', Email: 'a@example.com' },
  { _id: '2', Name: 'Trần Thị B', Phone: '0912345678', Email: 'b@example.com' },
  { _id: '3', Name: 'Lê Văn C', Phone: '0923456789', Email: 'c@example.com' },
];

// Mock Pets
export const mockPets: Pet[] = [
  { _id: 'p1', Name: 'Lucky', Species: 'Dog', Breed: 'Golden Retriever', Age: 3, OwnerId: '1' },
  { _id: 'p2', Name: 'Mimi', Species: 'Cat', Breed: 'Persian', Age: 2, OwnerId: '1' },
  { _id: 'p3', Name: 'Max', Species: 'Dog', Breed: 'Poodle', Age: 1, OwnerId: '2' },
  { _id: 'p4', Name: 'Bella', Species: 'Cat', Breed: 'Siamese', Age: 4, OwnerId: '3' },
];

// Mock Reminders
export const mockReminders: Reminder[] = [
  {
    _id: 'r1',
    OwnerId: '1',
    OwnerName: 'Nguyễn Văn A',
    OwnerPhone: '0901234567',
    PetIds: ['p1'],
    PetNames: ['Lucky'],
    ReminderDate: '2025-12-09',
    ReminderTime: '10:00',
    ReminderType: 'Vaccination',
    Message: 'Tiêm phòng định kỳ cho Lucky',
    Status: 'Pending',
  },
  {
    _id: 'r2',
    OwnerId: '2',
    OwnerName: 'Trần Thị B',
    OwnerPhone: '0912345678',
    PetIds: ['p3'],
    PetNames: ['Max'],
    ReminderDate: '2025-12-10',
    ReminderTime: '14:30',
    ReminderType: 'Checkup',
    Message: 'Khám sức khỏe tổng quát cho Max',
    Status: 'Pending',
  },
  {
    _id: 'r3',
    OwnerId: '1',
    OwnerName: 'Nguyễn Văn A',
    OwnerPhone: '0901234567',
    PetIds: ['p2'],
    PetNames: ['Mimi'],
    ReminderDate: '2025-12-12',
    ReminderTime: '09:00',
    ReminderType: 'Grooming',
    Message: 'Tắm và cắt lông cho Mimi',
    Status: 'Pending',
  },
];

// In-memory storage
let remindersStore = [...mockReminders];
let petsStore = [...mockPets];
let ownersStore = [...mockOwners];

export const getMockReminders = () => [...remindersStore];
export const getMockPets = () => [...petsStore];
export const getMockOwners = () => [...ownersStore];

export const addMockReminder = (reminder: Reminder) => {
  remindersStore.push(reminder);
};

export const updateMockReminder = (id: string, updates: Partial<Reminder>) => {
  const index = remindersStore.findIndex(r => r._id === id);
  if (index !== -1) {
    remindersStore[index] = { ...remindersStore[index], ...updates };
  }
};

export const deleteMockReminder = (id: string) => {
  remindersStore = remindersStore.filter(r => r._id !== id);
};

export const resetMockData = () => {
  remindersStore = [...mockReminders];
  petsStore = [...mockPets];
  ownersStore = [...mockOwners];
};
