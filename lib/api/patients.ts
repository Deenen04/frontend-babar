import { axiosInstance } from '../axios';

// Types for Patients (API format)
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  email: string | null;
  phone_number: string;
  phone_extension: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  insurance_provider: string | null;
  insurance_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  email?: string | null;
  phone_number: string;
  phone_extension?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string;
  insurance_provider?: string | null;
  insurance_id?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  medical_notes?: string | null;
  is_active: boolean;
}

export interface UpdatePatientRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  email?: string | null;
  phone_number?: string;
  phone_extension?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string;
  insurance_provider?: string | null;
  insurance_id?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  medical_notes?: string | null;
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
      ext: patient.phone_extension || '+1', // Use phone_extension from API
      phoneNo: patient.phone_number,
      insuranceProvider: patient.insurance_provider || '-',
      insuranceId: patient.insurance_id || '-',
      email: patient.email || '',
      address: patient.address || `${patient.city || ''} ${patient.state || ''} ${patient.country || ''}`.trim() || '',
      gender: '', // Not in API
      age: patient.date_of_birth ? calculateAge(patient.date_of_birth) : undefined,
      contactNumber: patient.phone_number,
      providerName: patient.insurance_provider || '-',
      note: patient.medical_notes || '',
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
        date_of_birth: formData.dateOfBirth || null,
        email: formData.email || null,
        phone_number: formData.phoneNo,
        phone_extension: formData.ext || null,
        address: formData.address || null,
        city: null,
        state: null,
        zip_code: null,
        country: "US", // Default country
        insurance_provider: formData.insuranceProvider || null,
        insurance_id: formData.insuranceId || null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        medical_notes: null,
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
        date_of_birth: formData.dateOfBirth || null,
        email: formData.email || null,
        phone_number: formData.phoneNo,
        phone_extension: formData.ext || null,
        address: formData.address || null,
        city: null,
        state: null,
        zip_code: null,
        country: "US",
        insurance_provider: formData.insuranceProvider || null,
        insurance_id: formData.insuranceId || null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        medical_notes: null,
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
