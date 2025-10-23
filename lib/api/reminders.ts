import { axiosInstance } from '../axios';

// Display types (from page component)
export type ReminderStatus = 'pending' | 'completed';
export type ReminderPriority = 'Low' | 'Medium' | 'High';
export type ReminderType = 'Prescription' | 'Callback' | 'Follow-up';

// Types for Reminders (API format)
export interface Reminder {
  id: string;
  patient_id: string | null;
  patient_name: string | null;
  appointment_id: string | null;
  call_id: string | null;
  reminder_type: string;
  title: string;
  task_description: string;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  status: string;
  reminder_method: string;
  source: string;
  patient_phone: string;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderRequest {
  patient_id: string | null;
  appointment_id?: string | null;
  call_id?: string | null;
  reminder_type: string;
  title: string;
  task_description: string;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  status: string;
  reminder_method: string;
  source: string;
  patient_phone: string;
  created_by: string;
}

export interface UpdateReminderRequest {
  title?: string;
  task_description?: string;
  status?: string;
}

export interface ReminderResponse {
  page: number;
  limit: number;
  count: number;
  results: Reminder[];
}

// Reminders API functions
export const remindersApi = {
  // Get all reminders (API returns array directly)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    start_date?: string;
  }): Promise<Reminder[]> => {
    const response = await axiosInstance.get('/reminders', { params });
    return response.data as Reminder[];
  },

  // Get reminders data (alias for getAll)
  getReminders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    start_date?: string;
  }): Promise<Reminder[]> => {
    const response = await axiosInstance.get('/reminders', { params });
    return response.data as Reminder[];
  },

  // Get single reminder
  getById: async (reminderId: string): Promise<Reminder> => {
    const response = await axiosInstance.get(`/reminders/${reminderId}`);
    return response.data as any;
  },

  // Create new reminder
  create: async (data: CreateReminderRequest): Promise<Reminder> => {
    const response = await axiosInstance.post('/reminders', data);
    return response.data as any;
  },

  // Update reminder
  update: async (reminderId: string, data: UpdateReminderRequest): Promise<Reminder> => {
    const response = await axiosInstance.put(`/reminders/${reminderId}`, data);
    return response.data as any;
  },

  // Delete reminder
  delete: async (reminderId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/reminders/${reminderId}`);
    return response.data as any;
  },

  // Get reminders by status
  getByStatus: async (status: string, params?: { page?: number; limit?: number }): Promise<Reminder[]> => {
    try {
      const reminders = await remindersApi.getReminders(params);
      return reminders.filter(reminder => reminder.status === status);
    } catch (error) {
      console.error('Error fetching reminders by status:', error);
      return [];
    }
  },

  // Get reminders by priority
  getByPriority: async (priority: string, params?: { page?: number; limit?: number }): Promise<Reminder[]> => {
    try {
      const reminders = await remindersApi.getReminders(params);
      return reminders.filter(reminder => reminder.priority === priority);
    } catch (error) {
      console.error('Error fetching reminders by priority:', error);
      return [];
    }
  },

  // Get reminders by patient phone
  getByPatientPhone: async (phoneNumber: string, params?: { page?: number; limit?: number }): Promise<Reminder[]> => {
    try {
      const reminders = await remindersApi.getReminders(params);
      return reminders.filter(reminder => reminder.patient_phone === phoneNumber);
    } catch (error) {
      console.error('Error fetching reminders by patient phone:', error);
      return [];
    }
  },

  // Get reminders by date range
  getByDateRange: async (startDate: string, endDate?: string, params?: { page?: number; limit?: number }): Promise<Reminder[]> => {
    try {
      const reminders = await remindersApi.getReminders(params);
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();

      return reminders.filter(reminder => {
        if (!reminder.due_date) return false;
        const reminderDate = new Date(reminder.due_date);
        return reminderDate >= start && reminderDate <= end;
      });
    } catch (error) {
      console.error('Error fetching reminders by date range:', error);
      return [];
    }
  },
};

// Utility functions for reminders operations
export const remindersUtils = {
  // Get reminders for current user (based on user role and permissions)
  getUserReminders: async (userId: string, userRole?: string) => {
    try {
      const allReminders = await remindersApi.getReminders();

      // If user is admin or practitioner, return all reminders
      if (userRole === 'admin' || userRole === 'practitioner') {
        return allReminders;
      }

      // For other users, filter by created_by field
      return allReminders.filter(reminder => reminder.created_by === userId);
    } catch (error) {
      console.error('Error fetching user reminders:', error);
      throw error;
    }
  },

  // Update reminder status
  updateReminderStatus: async (reminderId: string, status: string, updatedBy: string) => {
    try {
      return await remindersApi.update(reminderId, {
        status,
      });
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
  },

  // Create reminder from patient data
  createFromPatient: async (patientData: any, taskDescription: string, dueDate: string, priority = 'Medium') => {
    try {
      // This would need patient_id from the patient data
      // For now, using a placeholder - in real implementation, get from patient selection
      const patientId = patientData.id || 'placeholder-patient-id';

      return await remindersApi.create({
        patient_id: patientId,
        reminder_type: 'General',
        title: `Reminder for ${patientData.first_name} ${patientData.last_name}`,
        task_description: taskDescription,
        due_date: dueDate,
        due_time: '09:00', // Default time
        priority,
        status: 'pending',
        reminder_method: 'System',
        source: 'Manual Entry',
        patient_phone: patientData.phone_number || '',
        created_by: 'user-123', // Default user ID
      });
    } catch (error) {
      console.error('Error creating reminder from patient:', error);
      throw error;
    }
  },

  // Search reminders by patient name or phone number
  searchReminders: async (searchTerm: string, reminders: Reminder[]): Promise<Reminder[]> => {
    if (!searchTerm) return reminders;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return reminders.filter(reminder =>
      (reminder.patient_id && reminder.patient_id.toLowerCase().includes(lowerSearchTerm)) ||
      reminder.patient_phone.toLowerCase().includes(lowerSearchTerm) ||
      reminder.task_description.toLowerCase().includes(lowerSearchTerm)
    );
  },

  // Filter reminders by date
  filterRemindersByDate: async (startDate: string, reminders: Reminder[]): Promise<Reminder[]> => {
    if (!startDate) return reminders;

    const filterDate = new Date(startDate);
    filterDate.setHours(0, 0, 0, 0);

    return reminders.filter(reminder => {
      if (!reminder.due_date) return false;
      const reminderDate = new Date(reminder.due_date);
      reminderDate.setHours(0, 0, 0, 0);
      return reminderDate >= filterDate;
    });
  },

  // Format reminder data for display
  formatForDisplay: (reminder: Reminder) => {
    // Map API reminder_type to UI type
    const mapReminderType = (apiType: string): ReminderType => {
      switch (apiType.toLowerCase()) {
        case 'prescription':
        case 'renewal_prescription':
          return 'Prescription';
        case 'callback':
          return 'Callback';
        case 'followup':
        case 'follow-up':
          return 'Follow-up';
        default:
          return 'Callback'; // Default fallback
      }
    };

    // Map API priority to UI priority (capitalize first letter)
    const mapPriority = (apiPriority: string): ReminderPriority => {
      switch (apiPriority.toLowerCase()) {
        case 'low':
          return 'Low';
        case 'medium':
          return 'Medium';
        case 'high':
          return 'High';
        default:
          return 'Medium'; // Default fallback
      }
    };

    // Handle patient name - prioritize patient_name from API, then patient_id, then phone
    const getPatientName = (): string => {
      if (reminder.patient_name) {
        return reminder.patient_name;
      }
      if (reminder.patient_id) {
        return `Patient ${reminder.patient_id}`;
      }
      return reminder.patient_phone ? `Phone: ${reminder.patient_phone}` : 'Unknown Patient';
    };

    // Handle due date - when null, show appropriate message
    const getDueDate = (): string => {
      if (reminder.due_date) {
        const date = new Date(reminder.due_date);
        const timeStr = reminder.due_time ? ` ${reminder.due_time}` : '';
        return date.toLocaleDateString() + timeStr;
      }
      return 'No due date set';
    };

    return {
      id: reminder.id,
      patientName: getPatientName(),
      priority: mapPriority(reminder.priority),
      type: mapReminderType(reminder.reminder_type),
      phoneNumber: reminder.patient_phone,
      dueDate: getDueDate(),
      source: reminder.source,
      taskDescription: reminder.task_description,
      status: reminder.status as ReminderStatus,
    };
  },
};

export default {
  remindersApi,
  remindersUtils,
};
