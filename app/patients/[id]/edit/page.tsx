'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AddPatientForm from '@/components/AddPatientForm';
import { ToastProvider, useToast } from '@/lib/toast-context';
import { patientsApi, patientsUtils } from '@/lib/api';

// Patient type definition
export type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  dateOfBirth: string;
  phoneNo: string;
  insuranceProvider: string | null;
  insuranceId: string | null;
  email?: string;
  address?: string;
  gender?: string;
  age?: number;
  contactNumber?: string;
  providerName?: string | null;
  note?: string;
};

function PatientEditContent() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const patientId = params.id as string;

  // Load patient details for editing
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      
      setLoading(true);
      setError(null);

      try {
        // Fetch patient from API
        const apiPatient = await patientsApi.getById(patientId);

        // Convert API format to UI format
        const uiPatient = patientsUtils.formatForDisplay(apiPatient);
        setPatient(uiPatient);
      } catch (err) {
        console.error('Error loading patient:', err);
        setError('Failed to load patient details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  // Update existing patient using API
  const handleEditPatient = async (updatedPatient: Patient | Omit<Patient, 'id'>) => {
    if (!patientId) return;

    setSubmitting(true);
    try {
      setError(null);

      // Update patient using API
      const apiPatient = await patientsUtils.updateFromForm(patientId, updatedPatient);

      // Show success message
      showSuccess('Patient updated successfully', 'Patient details have been saved.');

      // Navigate back to patient view
      router.push(`/patients/${patientId}`);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
      showError('Failed to update patient', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/patients/${patientId}`);
  };

  return (
    <DashboardLayout title="Edit Patient">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading patient details...</p>
            </div>
          </div>
        ) : patient ? (
          <AddPatientForm
            onCancel={handleCancel}
            onSubmit={handleEditPatient}
            patient={patient}
            isEdit={true}
            isLoading={submitting}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Patient not found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PatientEdit() {
  return (
    <ToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <PatientEditContent />
      </Suspense>
    </ToastProvider>
  );
}
