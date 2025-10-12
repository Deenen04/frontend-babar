import { axiosInstance } from '../axios';

// Types for Calls (API format)
export interface Call {
  id: string;
  patient_id?: string;
  patient_name?: string;
  phone_number: string;
  call_type: string;
  call_status: string;
  call_outcome?: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  recording_url?: string;
  transcript?: string;
  ai_summary?: string;
  notes?: string;
  language: string;
  created_at: string;
}

export interface CreateCallRequest {
  patient_id?: string;
  phone_number: string;
  call_type: string;
  call_status: string;
  call_outcome?: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  recording_url?: string;
  transcript?: string;
  ai_summary?: string;
  notes?: string;
  language: string;
}

export interface UpdateCallRequest {
  call_status?: string;
  call_outcome?: string;
  end_time?: string;
  transcript?: string;
  ai_summary?: string;
  notes?: string;
}

export interface CallResponse {
  page: number;
  limit: number;
  count: number;
  results: Call[];
}

// Calls API functions
export const callsApi = {
  // Get all calls (API returns array directly)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    start_date?: string;
  }): Promise<Call[]> => {
    const response = await axiosInstance.get('/calls', { params });
    return response.data as Call[];
  },

  // Get calls data (alias for getAll)
  getCalls: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    start_date?: string;
  }): Promise<Call[]> => {
    return await callsApi.getAll(params);
  },

  // Get single call
  getById: async (callId: string): Promise<Call> => {
    const response = await axiosInstance.get(`/calls/${callId}`);
    return response.data as Call;
  },

  // Create new call
  create: async (data: CreateCallRequest): Promise<Call> => {
    const response = await axiosInstance.post('/calls', data);
    return response.data as Call;
  },

  // Update call
  update: async (callId: string, data: UpdateCallRequest): Promise<Call> => {
    const response = await axiosInstance.put(`/calls/${callId}`, data);
    return response.data as Call;
  },

  // Delete call
  delete: async (callId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/calls/${callId}`);
    return response.data as { message: string };
  },

  // Get calls by status
  getByStatus: async (status: string, params?: { page?: number; limit?: number; search?: string; start_date?: string }): Promise<Call[]> => {
    const calls = await callsApi.getCalls({ ...params, status });
    return calls.filter(call => call.call_status === status);
  },

  // Get calls by type
  getByType: async (type: string, params?: { page?: number; limit?: number }): Promise<Call[]> => {
    const calls = await callsApi.getCalls(params);
    return calls.filter(call => call.call_type === type);
  },

  // Get calls by patient phone
  getByPatientPhone: async (phoneNumber: string, params?: { page?: number; limit?: number }): Promise<Call[]> => {
    const calls = await callsApi.getCalls(params);
    return calls.filter(call => call.phone_number === phoneNumber);
  },

  // Get recent calls (last 30 days)
  getRecentCalls: async (days: number = 30, params?: { page?: number; limit?: number }): Promise<Call[]> => {
    const calls = await callsApi.getCalls(params);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return calls.filter(call =>
      new Date(call.created_at) >= cutoffDate
    );
  },
};

// Utility functions for calls operations
export const callsUtils = {
  // Get calls for current user (based on user role and permissions)
  getUserCalls: async (userId: string, userRole?: string) => {
    try {
      const allCalls = await callsApi.getCalls();

      // If user is admin or practitioner, return all calls
      if (userRole === 'admin' || userRole === 'practitioner') {
        return allCalls;
      }

      // For other users, filter by created calls or accessible calls
      // In a real app, you might filter by specific permissions
      return allCalls;
    } catch (error) {
      console.error('Error fetching user calls:', error);
      throw error;
    }
  },

  // Format call data for display (converting API format to UI format)
  formatForDisplay: (call: Call) => {
    const startTime = new Date(call.start_time);
    const endTime = call.end_time ? new Date(call.end_time) : null;

    // Calculate duration in minutes:seconds format
    const durationMinutes = Math.floor(call.duration_seconds / 60);
    const durationSeconds = call.duration_seconds % 60;
    const duration = durationMinutes > 0
      ? `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`
      : `${durationSeconds}s`;

    // Format date
    const date = startTime.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Map API call type to UI call type
    const mapCallType = (apiCallType: string): 'Incoming call' | 'Outgoing call' | 'View Chat' => {
      switch (apiCallType.toLowerCase()) {
        case 'incoming':
          return 'Incoming call';
        case 'outgoing':
          return 'Outgoing call';
        case 'chat':
        case 'whatsapp':
          return 'View Chat';
        default:
          return 'Incoming call'; // Default fallback
      }
    };

    return {
      id: call.id,
      patientName: call.patient_name || (call.patient_id ? `Patient ${call.patient_id}` : 'Unknown Patient'),
      status: call.call_status as 'Live' | 'Answered' | 'Missed',
      phoneNo: call.phone_number,
      callType: mapCallType(call.call_type),
      duration: duration,
      date: date,
      hasTranscript: !!call.transcript,
      isChat: call.call_type === 'Chat' || call.call_type === 'WhatsApp',
      transcript: call.transcript,
      aiSummary: call.ai_summary,
      notes: call.notes,
      startTime: startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      endTime: endTime ? endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : undefined,
      recording_url: call.recording_url,
    };
  },

  // Create call record from call data
  createCallRecord: async (callData: any, userId: string) => {
    try {
      // Calculate duration in seconds
      const startTime = new Date(callData.startTime);
      const endTime = new Date(callData.endTime);
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      return await callsApi.create({
        patient_id: callData.patientId,
        phone_number: callData.phoneNumber,
        call_type: callData.callType,
        call_status: callData.callStatus,
        call_outcome: callData.callOutcome,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        transcript: callData.transcript,
        ai_summary: callData.aiSummary,
        notes: callData.notes,
        language: callData.language || 'en',
      });
    } catch (error) {
      console.error('Error creating call record:', error);
      throw error;
    }
  },

  // Update call status
  updateCallStatus: async (callId: string, status: string, outcome?: string) => {
    try {
      return await callsApi.update(callId, {
        call_status: status,
        call_outcome: outcome,
      });
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  },

  // Search calls by patient name or phone number
  searchCalls: async (searchTerm: string, calls: Call[]): Promise<Call[]> => {
    if (!searchTerm) return calls;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return calls.filter(call =>
      (call.patient_id && call.patient_id.toLowerCase().includes(lowerSearchTerm)) ||
      call.phone_number.toLowerCase().includes(lowerSearchTerm)
    );
  },

  // Filter calls by date
  filterCallsByDate: async (startDate: string, calls: Call[]): Promise<Call[]> => {
    if (!startDate) return calls;

    const filterDate = new Date(startDate);
    filterDate.setHours(0, 0, 0, 0);

    return calls.filter(call => {
      const callDate = new Date(call.created_at);
      callDate.setHours(0, 0, 0, 0);
      return callDate >= filterDate;
    });
  },

  // Get call statistics
  getCallStatistics: async (calls: Call[]) => {
    const total = calls.length;
    const live = calls.filter(c => c.call_status === 'Live').length;
    const answered = calls.filter(c => c.call_status === 'Answered').length;
    const missed = calls.filter(c => c.call_status === 'Missed').length;

    const totalDuration = calls.reduce((sum, call) => sum + call.duration_seconds, 0);
    const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    return {
      total,
      live,
      answered,
      missed,
      averageDuration,
    };
  },
};

export default {
  callsApi,
  callsUtils,
};
