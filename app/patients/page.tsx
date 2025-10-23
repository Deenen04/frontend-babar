'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PatientsList from '@/components/PatientsList';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { ToastProvider, useToast } from '@/lib/toast-context';
import { patientsApi, patientsUtils, Patient as APIPatient } from '@/lib/api';

// Patients page with real API integration

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

function PatientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get search term from URL
  const searchTerm = searchParams.get('search') || '';

  // Update URL when search term changes
  const handleSearchChange = (newSearchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch patients from API
        const apiPatients = await patientsApi.getPatients();

        // Convert API format to UI format
        const uiPatients = apiPatients.map(patientsUtils.formatForDisplay);

        setPatients(uiPatients);
      } catch (err) {
        console.error('Error loading patients:', err);
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleViewPatient = (patient: Patient) => {
    router.push(`/patients/${patient.id}`);
  };

  const handleEditPatientForm = (patient: Patient) => {
    router.push(`/patients/${patient.id}/edit`);
  };

  const handleAddPatient = () => {
    router.push('/patients/add');
  };

  // Open delete confirmation modal
  const handleDeletePatientClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  // Delete patient using API
  const handleDeletePatientConfirm = async () => {
    if (!patientToDelete) return;

    setDeleteLoading(true);
    try {
      setError(null);

      // Delete patient using API (soft delete)
      await patientsApi.delete(patientToDelete.id);

      // Remove from local state
      const updatedPatients = patients.filter(patient => patient.id !== patientToDelete.id);
      setPatients(updatedPatients);

      // Show success toast
      showSuccess('Patient deleted successfully', `${patientToDelete.first_name} ${patientToDelete.last_name} has been removed.`);

      // Close modal and reset state
      setDeleteModalOpen(false);
      setPatientToDelete(null);

    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient. Please try again.');
      showError('Failed to delete patient', 'Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <DashboardLayout title="Patients">
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
              <p className="text-gray-600">Loading patients...</p>
            </div>
          </div>
        ) : (
          <>
            <PatientsList
              patients={patients}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onAddPatient={handleAddPatient}
              onViewPatient={handleViewPatient}
              onEditPatient={handleEditPatientForm}
              onDeletePatient={handleDeletePatientClick}
            />

            <DeleteConfirmationModal
              isOpen={deleteModalOpen}
              onClose={() => {
                setDeleteModalOpen(false);
                setPatientToDelete(null);
              }}
              onConfirm={handleDeletePatientConfirm}
              title="Delete Patient"
              description={`Are you sure you want to delete ${patientToDelete?.first_name} ${patientToDelete?.last_name}? This action cannot be undone.`}
              isLoading={deleteLoading}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Patients() {
  return (
    <ToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <PatientsContent />
      </Suspense>
    </ToastProvider>
  );
}
