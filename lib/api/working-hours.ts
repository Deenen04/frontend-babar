import { axiosInstance } from '../axios';

// Types for Working Hours (API format)
export interface WorkingHour {
  id: string;
  practitioner_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkingHourRequest {
  practitioner_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface UpdateWorkingHourRequest {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface WorkingHourResponse {
  page: number;
  limit: number;
  count: number;
  results: WorkingHour[];
}

// Working Hours API functions
export const workingHoursApi = {
  // Get all working hours with pagination
  getAll: async (params?: { page?: number; limit?: number }): Promise<WorkingHourResponse> => {
    const response = await axiosInstance.get('/working-hours', { params });
    return response.data as WorkingHourResponse;
  },

  // Get working hours data (extract results from paginated response)
  getWorkingHours: async (params?: { page?: number; limit?: number }): Promise<WorkingHour[]> => {
    const response = await workingHoursApi.getAll(params);
    return response.results;
  },

  // Get single working hour
  getById: async (whId: string): Promise<WorkingHour> => {
    const response = await axiosInstance.get(`/working-hours/${whId}`);
    return response.data as any;
  },

  // Create new working hour
  create: async (data: CreateWorkingHourRequest): Promise<WorkingHour> => {
    const response = await axiosInstance.post('/working-hours', data);
    return response.data as any;
  },

  // Update working hour
  update: async (whId: string, data: UpdateWorkingHourRequest): Promise<WorkingHour> => {
    const response = await axiosInstance.put(`/working-hours/${whId}`, data);
    return response.data as any;
  },

  // Delete working hour
  delete: async (whId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/working-hours/${whId}`);
    return response.data as any;
  },

  // Get working hours by practitioner
  getByPractitioner: async (practitionerId: string, params?: { page?: number; limit?: number }): Promise<WorkingHour[]> => {
    const workingHours = await workingHoursApi.getWorkingHours(params);
    return workingHours.filter(wh => wh.practitioner_id === practitionerId);
  },

  // Get working hours by day of week
  getByDayOfWeek: async (dayOfWeek: string, params?: { page?: number; limit?: number }): Promise<WorkingHour[]> => {
    const workingHours = await workingHoursApi.getWorkingHours(params);
    return workingHours.filter(wh => wh.day_of_week === dayOfWeek);
  },

  // Get active working hours only
  getActiveWorkingHours: async (params?: { page?: number; limit?: number }): Promise<WorkingHour[]> => {
    const workingHours = await workingHoursApi.getWorkingHours(params);
    return workingHours.filter(wh => wh.is_active);
  },
};

// Utility functions for working hours operations
export const workingHoursUtils = {
  // Get working hours for current user (based on user role and permissions)
  getUserWorkingHours: async (userId: string, userRole?: string) => {
    try {
      const allWorkingHours = await workingHoursApi.getWorkingHours();

      // If user is admin, return all working hours
      if (userRole === 'admin') {
        return allWorkingHours;
      }

      // If user is practitioner, return their own working hours
      if (userRole === 'practitioner') {
        return allWorkingHours.filter(wh => wh.practitioner_id === userId);
      }

      // For other users, return empty array (no access)
      return [];
    } catch (error) {
      console.error('Error fetching user working hours:', error);
      throw error;
    }
  },

  // Format working hour data for display (converting API format to UI format)
  formatForDisplay: (workingHour: WorkingHour) => {
    const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ];

    // Convert day_of_week number to name (assuming 0 = Sunday, 1 = Monday, etc.)
    const dayName = typeof workingHour.day_of_week === 'string'
      ? workingHour.day_of_week
      : dayNames[parseInt(workingHour.day_of_week)];

    // Format time to 12-hour format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return {
      id: workingHour.id,
      practitionerId: workingHour.practitioner_id,
      dayOfWeek: dayName,
      startTime: formatTime(workingHour.start_time),
      endTime: formatTime(workingHour.end_time),
      isActive: workingHour.is_active,
      createdAt: new Date(workingHour.created_at).toLocaleDateString(),
      updatedAt: new Date(workingHour.updated_at).toLocaleDateString(),
    };
  },

  // Create working hour from form data
  createFromForm: async (formData: any, practitionerId: string) => {
    try {
      return await workingHoursApi.create({
        practitioner_id: formData.practitionerId || practitionerId,
        day_of_week: formData.dayOfWeek,
        start_time: formData.startTime,
        end_time: formData.endTime,
        is_active: true,
      });
    } catch (error) {
      console.error('Error creating working hour from form:', error);
      throw error;
    }
  },

  // Update working hour from form data
  updateFromForm: async (whId: string, formData: any) => {
    try {
      return await workingHoursApi.update(whId, {
        day_of_week: formData.dayOfWeek,
        start_time: formData.startTime,
        end_time: formData.endTime,
        is_active: formData.isActive,
      });
    } catch (error) {
      console.error('Error updating working hour from form:', error);
      throw error;
    }
  },

  // Check if a practitioner is available at a specific time
  isAvailableAt: async (practitionerId: string, dateTime: Date): Promise<boolean> => {
    try {
      const workingHours = await workingHoursApi.getByPractitioner(practitionerId);
      const activeHours = workingHours.filter(wh => wh.is_active);

      const dayOfWeek = dateTime.getDay().toString(); // 0 = Sunday, 1 = Monday, etc.
      const timeString = dateTime.toTimeString().slice(0, 5); // HH:MM format

      const daySchedule = activeHours.find(wh => wh.day_of_week === dayOfWeek);

      if (!daySchedule) {
        return false; // No schedule for this day
      }

      return timeString >= daySchedule.start_time && timeString <= daySchedule.end_time;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  },
};

export default {
  workingHoursApi,
  workingHoursUtils,
};
