import { axiosInstance } from '../axios';

// Types for Users (API format)
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface UserResponse {
  page: number;
  limit: number;
  count: number;
  results: User[];
}

// Users API functions
export const usersApi = {
  // Get all users with pagination
  getAll: async (params?: { page?: number; limit?: number }): Promise<UserResponse> => {
    const response = await axiosInstance.get('/users', { params });
    return response.data as UserResponse;
  },

  // Get users data (extract results from paginated response)
  getUsers: async (params?: { page?: number; limit?: number }): Promise<User[]> => {
    const response = await usersApi.getAll(params);
    return response.results;
  },

  // Get single user
  getById: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data as any;
  },

  // Create new user
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await axiosInstance.post('/users', data);
    return response.data as any;
  },

  // Update user
  update: async (userId: string, data: UpdateUserRequest): Promise<User> => {
    const response = await axiosInstance.put(`/users/${userId}`, data);
    return response.data as any;
  },

  // Delete user (soft delete)
  delete: async (userId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data as any;
  },

  // Get users by role
  getByRole: async (role: string, params?: { page?: number; limit?: number }): Promise<User[]> => {
    const users = await usersApi.getUsers(params);
    return users.filter(user => user.role === role);
  },

  // Get active users only
  getActiveUsers: async (params?: { page?: number; limit?: number }): Promise<User[]> => {
    const users = await usersApi.getUsers(params);
    return users.filter(user => user.is_active);
  },
};

// Utility functions for users operations
export const usersUtils = {
  // Get users for current user (based on user role and permissions)
  getUserUsers: async (userId: string, userRole?: string) => {
    try {
      const allUsers = await usersApi.getUsers();

      // If user is admin, return all users
      if (userRole === 'admin') {
        return allUsers;
      }

      // For other users, return only their own profile
      return allUsers.filter(user => user.id === userId);
    } catch (error) {
      console.error('Error fetching user users:', error);
      throw error;
    }
  },

  // Format user data for display (converting API format to UI format)
  formatForDisplay: (user: User) => {
    return {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: new Date(user.created_at).toLocaleDateString(),
      updatedAt: new Date(user.updated_at).toLocaleDateString(),
    };
  },

  // Create user from form data
  createFromForm: async (formData: any, createdBy: string) => {
    try {
      return await usersApi.create({
        email: formData.email,
        password_hash: formData.password, // In real app, hash the password
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        is_active: true,
      });
    } catch (error) {
      console.error('Error creating user from form:', error);
      throw error;
    }
  },

  // Update user from form data
  updateFromForm: async (userId: string, formData: any) => {
    try {
      return await usersApi.update(userId, {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        is_active: formData.isActive,
      });
    } catch (error) {
      console.error('Error updating user from form:', error);
      throw error;
    }
  },
};

export default {
  usersApi,
  usersUtils,
};
