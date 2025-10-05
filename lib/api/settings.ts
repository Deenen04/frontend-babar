import { axiosInstance } from '../axios';

// Types for System Settings
export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_user_configurable: boolean;
  updated_by: string;
  updated_at: string;
}

export interface CreateSystemSettingRequest {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_user_configurable: boolean;
  updated_by: string;
}

export interface UpdateSystemSettingRequest {
  setting_value: string;
  description?: string;
  is_user_configurable?: boolean;
  updated_by: string;
}

export interface SystemSettingResponse {
  page: number;
  limit: number;
  count: number;
  results: SystemSetting[];
}

export interface UserSettingResponse {
  page: number;
  limit: number;
  count: number;
  results: UserSetting[];
}

// Types for User Settings
export interface UserSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface CreateUserSettingRequest {
  user_id: string;
  setting_key: string;
  setting_value: string;
}

export interface UpdateUserSettingRequest {
  setting_value: string;
}

// System Settings API functions
export const systemSettingsApi = {
  // Get all system settings with pagination
  getAll: async (params?: { page?: number; limit?: number }): Promise<SystemSettingResponse> => {
    const response = await axiosInstance.get('/system-settings', { params });
    return response.data as SystemSettingResponse;
  },

  // Get system settings data (API returns array directly)
  getSystemSettings: async (params?: { page?: number; limit?: number }): Promise<SystemSetting[]> => {
    const response = await axiosInstance.get('/system-settings', { params });
    return response.data as SystemSetting[];
  },

  // Get single system setting
  getById: async (settingId: string): Promise<SystemSetting> => {
    const response = await axiosInstance.get(`/system-settings/${settingId}`);
    return response.data as any;
  },

  // Create new system setting
  create: async (data: CreateSystemSettingRequest): Promise<SystemSetting> => {
    const response = await axiosInstance.post('/system-settings', data);
    return response.data as any;
  },

  // Update system setting
  update: async (settingId: string, data: UpdateSystemSettingRequest): Promise<SystemSetting> => {
    const response = await axiosInstance.put(`/system-settings/${settingId}`, data);
    return response.data as any;
  },

  // Delete system setting
  delete: async (settingId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/system-settings/${settingId}`);
    return response.data as any;
  },
};

// User Settings API functions
export const userSettingsApi = {
  // Get all user settings with pagination
  getAll: async (params?: { page?: number; limit?: number }): Promise<UserSettingResponse> => {
    const response = await axiosInstance.get('/user-settings', { params });
    return response.data as UserSettingResponse;
  },

  // Get user settings data (API returns array directly)
  getUserSettings: async (params?: { page?: number; limit?: number }): Promise<UserSetting[]> => {
    const response = await axiosInstance.get('/user-settings', { params });
    return response.data as UserSetting[];
  },

  // Get single user setting
  getById: async (settingId: string): Promise<UserSetting> => {
    const response = await axiosInstance.get(`/user-settings/${settingId}`);
    return response.data as any;
  },

  // Create new user setting
  create: async (data: CreateUserSettingRequest): Promise<UserSetting> => {
    const response = await axiosInstance.post('/user-settings', data);
    return response.data as any;
  },

  // Update user setting
  update: async (settingId: string, data: UpdateUserSettingRequest): Promise<UserSetting> => {
    const response = await axiosInstance.put(`/user-settings/${settingId}`, data);
    return response.data as any;
  },

  // Delete user setting
  delete: async (settingId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/user-settings/${settingId}`);
    return response.data as any;
  },
};

// Utility functions for common settings operations
export const settingsApi = {
  // Get user profile settings
  getUserProfile: async (userId: string) => {
    try {
      const userSettings = await userSettingsApi.getUserSettings();
      return userSettings.filter(setting => setting.user_id === userId);
    } catch (error) {
      console.error('Error fetching user profile settings:', error);
      throw error;
    }
  },

  // Update user profile settings
  updateUserProfile: async (userId: string, settings: Record<string, string>) => {
    try {
      const updatePromises = Object.entries(settings).map(([key, value]) =>
        userSettingsApi.create({
          user_id: userId,
          setting_key: key,
          setting_value: value,
        })
      );
      return Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating user profile settings:', error);
      throw error;
    }
  },

  // Get system configuration
  getSystemConfig: async () => {
    try {
      return await systemSettingsApi.getSystemSettings();
    } catch (error) {
      console.error('Error fetching system configuration:', error);
      throw error;
    }
  },

  // Update system configuration
  updateSystemConfig: async (settingId: string, value: string, updatedBy: string) => {
    try {
      return await systemSettingsApi.update(settingId, {
        setting_value: value,
        updated_by: updatedBy,
      });
    } catch (error) {
      console.error('Error updating system configuration:', error);
      throw error;
    }
  },
};
