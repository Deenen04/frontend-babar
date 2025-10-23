'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AddPatientForm from '@/components/AddPatientForm';
import { ToastProvider, useToast } from '@/lib/toast-context';
import { patientsUtils } from '@/lib/api';

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

function PatientAddContent() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add new patient using API
  const handleAddPatient = async (patient: Omit<Patient, 'id'>) => {
    setSubmitting(true);
    try {
      setError(null);

      // Create patient using API
      const apiPatient = await patientsUtils.createFromForm(patient, 'user-123');

      // Show success message
      showSuccess('Patient added successfully', `${patient.first_name} ${patient.last_name} has been added to the system.`);

      // Navigate back to patients list
      router.push('/patients');
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient. Please try again.');
      showError('Failed to add patient', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/patients');
  };

  return (
    <DashboardLayout title="Add New Patient">
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
        <AddPatientForm
          onCancel={handleCancel}
          onSubmit={handleAddPatient}
          isLoading={submitting}
        />
      </div>
    </DashboardLayout>
  );
}

export default function PatientAdd() {
  return (
    <ToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <PatientAddContent />
      </Suspense>
    </ToastProvider>
  );
}
