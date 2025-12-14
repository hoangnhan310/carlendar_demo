/**
 * Mock API Client for Calendar Demo
 */

import axios from 'axios';
import type { ApiResponse, PaginatedResponse, Reminder, Pet, Owner } from '../types/api';
import {
  getMockReminders,
  getMockPets,
  getMockOwners,
  addMockReminder,
  updateMockReminder,
  deleteMockReminder
} from './mockData';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Mock interceptor to simulate API responses
apiClient.interceptors.request.use((config) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(config), 300);
  });
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle mock API errors
    if (error.config && error.config.url) {
      const url = error.config.url;
      const method = error.config.method?.toUpperCase();

      // Mock responses based on URL patterns
      if (url.includes('/reminders')) {
        if (method === 'GET') {
          const reminders = getMockReminders();
          return Promise.resolve({
            data: {
              success: true,
              data: {
                items: reminders,
                total: reminders.length,
                page: 1,
                perPage: 500
              }
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        }
        
        if (method === 'POST') {
          const newReminder: Reminder = {
            _id: `r${Date.now()}`,
            ...error.config.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          addMockReminder(newReminder);
          return Promise.resolve({
            data: {
              success: true,
              data: newReminder
            },
            status: 201,
            statusText: 'Created',
            headers: {},
            config: error.config
          });
        }
        
        if (method === 'PUT') {
          const id = url.split('/').pop();
          if (id) {
            updateMockReminder(id, error.config.data);
            const reminders = getMockReminders();
            const updated = reminders.find(r => r._id === id);
            return Promise.resolve({
              data: {
                success: true,
                data: updated
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config
            });
          }
        }
        
        if (method === 'DELETE') {
          const id = url.split('/').pop();
          if (id) {
            deleteMockReminder(id);
            return Promise.resolve({
              data: {
                success: true,
                data: { message: 'Deleted successfully' }
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config
            });
          }
        }
      }

      if (url.includes('/pets')) {
        const pets = getMockPets();
        const ownerId = error.config.params?.OwnerId;
        const filteredPets = ownerId ? pets.filter(p => p.OwnerId === ownerId) : pets;
        
        return Promise.resolve({
          data: {
            success: true,
            data: {
              items: filteredPets,
              total: filteredPets.length,
              page: 1,
              perPage: 1000
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }

      if (url.includes('/owners/search')) {
        const owners = getMockOwners();
        const term = error.config.params?.term?.toLowerCase() || '';
        const filtered = term 
          ? owners.filter(o => 
              o.Name.toLowerCase().includes(term) || 
              o.Phone.includes(term)
            )
          : owners;
        
        return Promise.resolve({
          data: {
            success: true,
            data: filtered
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }

      if (url.includes('/cache/clear')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { message: 'Cache cleared' }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
