import { axiosInstance } from '../axios';

// Types for Patients (API format)
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone_number: string;
  city?: string;
  state?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  date_of_birth?: string;
  address?: string;
  is_active: boolean;
}

export interface UpdatePatientRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active?: boolean;
}

export interface PatientResponse {
  page: number;
  limit: number;
  count: number;
  results: Patient[];
}

// Patients API functions
export const patientsApi = {
  // Get all patients with pagination
  getAll: async (params?: { page?: number; limit?: number }): Promise<PatientResponse> => {
    const response = await axiosInstance.get('/patients', { params });
    return response.data as PatientResponse;
  },

  // Get patients data (API returns array directly)
  getPatients: async (params?: { page?: number; limit?: number }): Promise<Patient[]> => {
    const response = await axiosInstance.get('/patients', { params });
    return response.data as Patient[];
  },

  // Get single patient
  getById: async (patientId: string): Promise<Patient> => {
    const response = await axiosInstance.get(`/patients/${patientId}`);
    return response.data as any;
  },

  // Create new patient
  create: async (data: CreatePatientRequest): Promise<Patient> => {
    const response = await axiosInstance.post('/patients', data);
    return response.data as any;
  },

  // Update patient
  update: async (patientId: string, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await axiosInstance.put(`/patients/${patientId}`, data);
    return response.data as any;
  },

  // Delete patient (soft delete)
  delete: async (patientId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/patients/${patientId}`);
    return response.data as any;
  },

  // Search patients by phone number
  searchByPhone: async (phoneNumber: string, params?: { page?: number; limit?: number }): Promise<Patient[]> => {
    const patients = await patientsApi.getPatients(params);
    return patients.filter(patient =>
      patient.phone_number.includes(phoneNumber)
    );
  },

  // Get active patients only
  getActivePatients: async (params?: { page?: number; limit?: number }): Promise<Patient[]> => {
    const patients = await patientsApi.getPatients(params);
    return patients.filter(patient => patient.is_active);
  },
};

// Utility functions for patients operations
export const patientsUtils = {
  // Get patients for current user (based on user role and permissions)
  getUserPatients: async (userId: string, userRole?: string) => {
    try {
      const allPatients = await patientsApi.getPatients();

      // If user is admin or practitioner, return all active patients
      if (userRole === 'admin' || userRole === 'practitioner') {
        return allPatients.filter(patient => patient.is_active);
      }

      // For other users, return all patients (assuming they have access)
      // In a real app, you might filter by created_by or specific permissions
      return allPatients.filter(patient => patient.is_active);
    } catch (error) {
      console.error('Error fetching user patients:', error);
      throw error;
    }
  },

  // Format patient data for display (converting API format to UI format)
  formatForDisplay: (patient: Patient) => {
    return {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      dateOfBirth: patient.date_of_birth || '',
      ext: '+1', // Default country code, could be derived from phone
      phoneNo: patient.phone_number,
      insuranceProvider: '-', // Not in API, would need separate endpoint
      insuranceId: '-', // Not in API, would need separate endpoint
      email: patient.email || '',
      address: `${patient.city || ''} ${patient.state || ''} ${patient.country || ''}`.trim() || '',
      gender: '', // Not in API
      age: patient.date_of_birth ? calculateAge(patient.date_of_birth) : undefined,
      contactNumber: patient.phone_number,
      providerName: '-', // Not in API
      note: '', // Not in API
    };
  },

  // Create patient from form data
  createFromForm: async (formData: any, userId: string) => {
    try {
      // Split name into first and last name
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return await patientsApi.create({
        first_name: firstName,
        last_name: lastName,
        email: formData.email || '',
        phone_number: formData.phoneNo,
        date_of_birth: formData.dateOfBirth || '',
        address: formData.address || '',
        is_active: true,
      });
    } catch (error) {
      console.error('Error creating patient from form:', error);
      throw error;
    }
  },

  // Update patient from form data
  updateFromForm: async (patientId: string, formData: any) => {
    try {
      // Split name into first and last name
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return await patientsApi.update(patientId, {
        first_name: firstName,
        last_name: lastName,
        email: formData.email || '',
        phone_number: formData.phoneNo,
        date_of_birth: formData.dateOfBirth || '',
      });
    } catch (error) {
      console.error('Error updating patient from form:', error);
      throw error;
    }
  },
};

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default {
  patientsApi,
  patientsUtils,
};
