import { axiosInstance } from '../axios';

// Types for Dashboard API response
export interface DashboardOverview {
  total_calling_minutes: string;
  appointments_booked_by_ai: number;
}

export interface TodayAppointment {
  date: string;
  practitioner_name: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface DashboardReminder {
  patient_phone: string;
  reminder_type: string;
  priority: string;
  status: string;
  due_date: string;
  due_time: string;
}

export interface LiveCall {
  patient_id: string | null;
  phone_number: string;
  call_type: string;
  transcript_snippet: string;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  today_appointments: TodayAppointment[];
  reminders: DashboardReminder[];
  live_calls: LiveCall[];
}

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard data
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await axiosInstance.get('/dashboard');
    return response.data as DashboardResponse;
  },
};

export default dashboardApi;
