import { axiosInstance } from '../axios';

// Types for Appointments (API format)
export interface Appointment {
  id: string;
  patient_phone?: string;
  patient_name?: string;
  practitioner_id: string;
  appointment_type_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  call_id?: string;
  working_hours_id?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateAppointmentRequest {
  patient_phone?: string;
  patient_name?: string;
  practitioner_id: string;
  appointment_type_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_by: string;
}

export interface UpdateAppointmentRequest {
  patient_phone?: string;
  patient_name?: string;
  practitioner_id?: string;
  appointment_type_id?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: string;
}

export interface AppointmentResponse {
  page: number;
  limit: number;
  count: number;
  results: Appointment[];
}

export interface AppointmentQueryParams {
  status?: string;
  patient_phone?: string;
  practitioner_id?: string;
  appointment_type_id?: string;
  date?: string;
  page?: number;
  limit?: number;
}

// Appointments API functions
export const appointmentsApi = {
  // Get all appointments with pagination and filters
  getAll: async (params?: AppointmentQueryParams): Promise<AppointmentResponse> => {
    const response = await axiosInstance.get('/appointments', { params });
    const data = response.data;
    
    // Handle both paginated response and direct array response
    if (Array.isArray(data)) {
      return {
        page: 1,
        limit: data.length,
        count: data.length,
        results: data
      };
    }
    
    return data as AppointmentResponse;
  },

  // Get appointments data (extract results from paginated response)
  getAppointments: async (params?: AppointmentQueryParams): Promise<Appointment[]> => {
    const response = await appointmentsApi.getAll(params);
    // Handle both paginated response and direct array response
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  },

  // Get single appointment
  getById: async (appointmentId: string): Promise<Appointment> => {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data as Appointment;
  },

  // Create new appointment
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await axiosInstance.post('/appointments', data);
    return response.data as Appointment;
  },

  // Update appointment
  update: async (appointmentId: string, data: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await axiosInstance.put(`/appointments/${appointmentId}`, data);
    return response.data as Appointment;
  },

  // Update appointment status
  updateStatus: async (appointmentId: string, data: UpdateAppointmentStatusRequest): Promise<Appointment> => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, data);
    return response.data as Appointment;
  },

  // Delete appointment
  delete: async (appointmentId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/appointments/${appointmentId}`);
    return response.data as { message: string };
  },

  // Get appointments by status
  getByStatus: async (status: string, params?: Omit<AppointmentQueryParams, 'status'>): Promise<Appointment[]> => {
    return await appointmentsApi.getAppointments({ ...params, status });
  },

  // Get appointments by date
  getByDate: async (date: string, params?: Omit<AppointmentQueryParams, 'date'>): Promise<Appointment[]> => {
    return await appointmentsApi.getAppointments({ ...params, date, status: 'confirmed' });
  },

  // Get appointments by practitioner
  getByPractitioner: async (practitionerId: string, params?: Omit<AppointmentQueryParams, 'practitioner_id'>): Promise<Appointment[]> => {
    return await appointmentsApi.getAppointments({ ...params, practitioner_id: practitionerId });
  },

  // Get appointments by patient phone
  getByPatientPhone: async (phoneNumber: string, params?: Omit<AppointmentQueryParams, 'patient_phone'>): Promise<Appointment[]> => {
    return await appointmentsApi.getAppointments({ ...params, patient_phone: phoneNumber });
  },

  // Get available slots for a specific practitioner and date
  getAvailableSlots: async (practitionerId: string, appointmentDate: string, appointmentTypeId?: string): Promise<Appointment[]> => {
    const params: AppointmentQueryParams = {
      status: 'available',
      practitioner_id: practitionerId,
      date: appointmentDate
    };
    
    return await appointmentsApi.getAppointments(params);
  },

  // Get upcoming appointments
  getUpcoming: async (days: number = 7, params?: AppointmentQueryParams): Promise<Appointment[]> => {
    try {
      const appointments = await appointmentsApi.getAppointments(params);
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      return appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        return appointmentDate >= today && appointmentDate <= futureDate;
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  },
};

export interface AppointmentTypeResponse {
  page: number;
  limit: number;
  count: number;
  results: AppointmentType[];
}

// Appointment Types API functions
export const appointmentTypesApi = {
  // Get all appointment types (API returns array directly)
  getAll: async (params?: { page?: number; limit?: number }): Promise<AppointmentType[]> => {
    const response = await axiosInstance.get('/appointment-types', { params });
    return response.data as AppointmentType[];
  },

  // Get appointment types data (alias for getAll)
  getAppointmentTypes: async (params?: { page?: number; limit?: number }): Promise<AppointmentType[]> => {
    return await appointmentTypesApi.getAll(params);
  },

  // Get single appointment type
  getById: async (typeId: string): Promise<AppointmentType> => {
    const response = await axiosInstance.get(`/appointment-types/${typeId}`);
    return response.data as any;
  },

  // Create new appointment type
  create: async (data: Omit<AppointmentType, 'id' | 'created_at'>): Promise<AppointmentType> => {
    const response = await axiosInstance.post('/appointment-types', data);
    return response.data as any;
  },

  // Update appointment type
  update: async (typeId: string, data: Partial<Omit<AppointmentType, 'id' | 'created_at'>>): Promise<AppointmentType> => {
    const response = await axiosInstance.put(`/appointment-types/${typeId}`, data);
    return response.data as any;
  },

  // Delete appointment type
  delete: async (typeId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/appointment-types/${typeId}`);
    return response.data as any;
  },
};

// Utility functions for appointments operations
export const appointmentsUtils = {
  // Get appointments for current user (based on user role and permissions)
  getUserAppointments: async (userId: string, userRole?: string) => {
    try {
      const allAppointments = await appointmentsApi.getAppointments();

      // If user is admin or practitioner, return all appointments
      if (userRole === 'admin' || userRole === 'practitioner') {
        return allAppointments;
      }

      // For other users, filter by created_by field
      return allAppointments.filter(appointment => appointment.created_by === userId);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw error;
    }
  },

  // Format appointment data for display (converting API format to UI format)
  formatForDisplay: (appointment: Appointment): {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    patient: string;
    type: string;
    day?: number;
  } => {
    // Format time to 12-hour format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm.toLowerCase()}`;
    };

    // Extract date and calculate day for week view
    const appointmentDate = new Date(appointment.appointment_date);
    const dayOfMonth = appointmentDate.getDate();

    return {
      id: appointment.id,
      title: `Appointment`, // Would need to fetch appointment type name
      startTime: formatTime(appointment.start_time),
      endTime: formatTime(appointment.end_time),
      patient: appointment.patient_name && appointment.patient_name.trim() 
        ? appointment.patient_name 
        : appointment.patient_phone 
        ? `Patient ${appointment.patient_phone}` 
        : 'No Patient',
      type: 'Doctor', // Would need to map from appointment_type_id
      day: dayOfMonth,
    };
  },

  // Create appointment from form data
  createFromForm: async (formData: any, userId: string) => {
    try {
      // Parse date and time
      const appointmentDate = new Date(formData.date);
      const startTime = formData.startTime;
      const endTime = formData.endTime;

      // Calculate duration in minutes (default to 30 if not provided)
      const duration = formData.duration || 30;

      return await appointmentsApi.create({
        patient_phone: formData.patientPhone,
        patient_name: formData.patientName,
        practitioner_id: formData.practitionerId || userId,
        appointment_type_id: formData.appointmentTypeId || 'default-type-id',
        appointment_date: appointmentDate.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        status: 'scheduled',
        notes: formData.notes,
        created_by: userId,
      });
    } catch (error) {
      console.error('Error creating appointment from form:', error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      return await appointmentsApi.updateStatus(appointmentId, { status });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Get appointments for a specific date range (for calendar view)
  getAppointmentsForDateRange: async (startDate: string, endDate: string) => {
    try {
      const allAppointments = await appointmentsApi.getAppointments();

      return allAppointments.filter(appointment => {
        const appointmentDate = appointment.appointment_date;
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    } catch (error) {
      console.error('Error fetching appointments for date range:', error);
      throw error;
    }
  },

  // Get appointment statistics
  getAppointmentStatistics: async (appointments: Appointment[]) => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
    };
  },
};

export default {
  appointmentsApi,
  appointmentTypesApi,
  appointmentsUtils,
};

