import { axiosInstance } from '../axios';

// Types for Practitioners (API format)
export interface Practitioner {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  title: string;
  specialization: string;
  license_number?: string;
  phone_number?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePractitionerRequest {
  user_id: string;
  first_name: string;
  last_name: string;
  title: string;
  specialization: string;
  is_active: boolean;
}

export interface UpdatePractitionerRequest {
  first_name?: string;
  last_name?: string;
  title?: string;
  specialization?: string;
  is_active?: boolean;
}

export interface PractitionerResponse {
  page: number;
  limit: number;
  count: number;
  results: Practitioner[];
}

// Practitioners API functions
export const practitionersApi = {
  // Get all practitioners (API returns array directly)
  getAll: async (params?: { page?: number; limit?: number }): Promise<Practitioner[]> => {
    const response = await axiosInstance.get('/practitioners', { params });
    return response.data as Practitioner[];
  },

  // Get practitioners data (alias for getAll)
  getPractitioners: async (params?: { page?: number; limit?: number }): Promise<Practitioner[]> => {
    return await practitionersApi.getAll(params);
  },

  // Get single practitioner
  getById: async (practitionerId: string): Promise<Practitioner> => {
    const response = await axiosInstance.get(`/practitioners/${practitionerId}`);
    return response.data as any;
  },

  // Create new practitioner
  create: async (data: CreatePractitionerRequest): Promise<Practitioner> => {
    const response = await axiosInstance.post('/practitioners', data);
    return response.data as any;
  },

  // Update practitioner
  update: async (practitionerId: string, data: UpdatePractitionerRequest): Promise<Practitioner> => {
    const response = await axiosInstance.put(`/practitioners/${practitionerId}`, data);
    return response.data as any;
  },

  // Delete practitioner (soft delete)
  delete: async (practitionerId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/practitioners/${practitionerId}`);
    return response.data as any;
  },

  // Get practitioners by specialization
  getBySpecialization: async (specialization: string, params?: { page?: number; limit?: number }): Promise<Practitioner[]> => {
    try {
      const practitioners = await practitionersApi.getPractitioners(params);
      return practitioners.filter(practitioner => practitioner.specialization === specialization);
    } catch (error) {
      console.error('Error fetching practitioners by specialization:', error);
      return [];
    }
  },

  // Get active practitioners only
  getActivePractitioners: async (params?: { page?: number; limit?: number }): Promise<Practitioner[]> => {
    try {
      const practitioners = await practitionersApi.getPractitioners(params);
      return practitioners.filter(practitioner => practitioner.is_active);
    } catch (error) {
      console.error('Error fetching active practitioners:', error);
      return [];
    }
  },
};

// Utility functions for practitioners operations
export const practitionersUtils = {
  // Get practitioners for current user (based on user role and permissions)
  getUserPractitioners: async (userId: string, userRole?: string) => {
    try {
      const allPractitioners = await practitionersApi.getPractitioners();

      // If user is admin, return all practitioners
      if (userRole === 'admin') {
        return allPractitioners;
      }

      // If user is practitioner, return their own profile plus others they can access
      if (userRole === 'practitioner') {
        return allPractitioners.filter(practitioner => practitioner.is_active);
      }

      // For other users, return active practitioners (for appointment booking, etc.)
      return allPractitioners.filter(practitioner => practitioner.is_active);
    } catch (error) {
      console.error('Error fetching user practitioners:', error);
      throw error;
    }
  },

  // Format practitioner data for display (converting API format to UI format)
  formatForDisplay: (practitioner: Practitioner) => {
    return {
      id: practitioner.id,
      name: `${practitioner.title} ${practitioner.first_name} ${practitioner.last_name}`,
      title: practitioner.title,
      specialization: practitioner.specialization,
      licenseNumber: practitioner.license_number,
      phoneNumber: practitioner.phone_number,
      email: practitioner.email,
      isActive: practitioner.is_active,
      createdAt: new Date(practitioner.created_at).toLocaleDateString(),
      updatedAt: new Date(practitioner.updated_at).toLocaleDateString(),
    };
  },

  // Create practitioner from form data
  createFromForm: async (formData: any, userId: string) => {
    try {
      return await practitionersApi.create({
        user_id: formData.userId || userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        title: formData.title,
        specialization: formData.specialization,
        is_active: true,
      });
    } catch (error) {
      console.error('Error creating practitioner from form:', error);
      throw error;
    }
  },

  // Update practitioner from form data
  updateFromForm: async (practitionerId: string, formData: any) => {
    try {
      return await practitionersApi.update(practitionerId, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        title: formData.title,
        specialization: formData.specialization,
        is_active: formData.isActive,
      });
    } catch (error) {
      console.error('Error updating practitioner from form:', error);
      throw error;
    }
  },
};

export default {
  practitionersApi,
  practitionersUtils,
};
