'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDetails from '@/components/PatientDetails';
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

function PatientViewContent() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const patientId = params.id as string;

  // Load patient details
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
        setNotesValue(apiPatient.medical_notes || '');
      } catch (err) {
        console.error('Error loading patient:', err);
        setError('Failed to load patient details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const handleBackToList = () => {
    router.push('/patients');
  };

  const handleEditPatient = () => {
    router.push(`/patients/${patientId}/edit`);
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!patientId) return;

    setSavingNotes(true);
    try {
      // Update medical notes using PATCH API
      await patientsApi.patch(patientId, {
        medical_notes: notesValue
      });

      // Update local patient state
      if (patient) {
        setPatient({
          ...patient,
          note: notesValue
        });
      }

      setIsEditingNotes(false);
      showSuccess('Notes updated successfully', 'Medical notes have been saved.');
    } catch (err) {
      console.error('Error updating notes:', err);
      showError('Failed to update notes', 'Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelNotes = () => {
    setIsEditingNotes(false);
    // Reset notes value to original
    if (patient) {
      setNotesValue(patient.note || '');
    }
  };

  return (
    <DashboardLayout title="Patient Details">
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
          <PatientDetails
            patient={patient}
            onBack={handleBackToList}
            onEdit={handleEditPatient}
            notesValue={notesValue}
            isEditingNotes={isEditingNotes}
            savingNotes={savingNotes}
            onEditNotes={handleEditNotes}
            onSaveNotes={handleSaveNotes}
            onCancelNotes={handleCancelNotes}
            onNotesChange={setNotesValue}
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

export default function PatientView() {
  return (
    <ToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <PatientViewContent />
      </Suspense>
    </ToastProvider>
  );
}
