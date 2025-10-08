'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PatientsList from '@/components/PatientsList';
import AddPatientForm from '@/components/AddPatientForm';
import PatientDetails from '@/components/PatientDetails';
import { patientsApi, patientsUtils, Patient as APIPatient } from '@/lib/api';

// Patients page with real API integration

export type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  dateOfBirth: string;
  ext: string;
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

export type ViewType = 'list' | 'add' | 'edit' | 'details';

function PatientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Add new patient using API
  const handleAddPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      setError(null);

      // Create patient using API
      const apiPatient = await patientsUtils.createFromForm(patient, 'user-123');

      // Convert to UI format and add to local state
      const uiPatient = patientsUtils.formatForDisplay(apiPatient);
      setPatients([...patients, uiPatient]);

      setCurrentView('list');
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient. Please try again.');
    }
  };

  // Update existing patient using API
  const handleEditPatient = async (updatedPatient: Patient | Omit<Patient, 'id'>) => {
    try {
      setError(null);

      if ('id' in updatedPatient && updatedPatient.id) {
        // Update patient using API
        const apiPatient = await patientsUtils.updateFromForm(updatedPatient.id, updatedPatient);

        // Convert to UI format and update local state
        const uiPatient = patientsUtils.formatForDisplay(apiPatient);
        const updatedPatients = patients.map(patient =>
          patient.id === updatedPatient.id ? uiPatient : patient
        );
        setPatients(updatedPatients);
      }

      setCurrentView('list');
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('details');
  };

  const handleEditPatientForm = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPatient(null);
  };

  // Delete patient using API
  const handleDeletePatient = async (patientId: string) => {
    try {
      setError(null);

      // Delete patient using API (soft delete)
      await patientsApi.delete(patientId);

      // Remove from local state
      const updatedPatients = patients.filter(patient => patient.id !== patientId);
      setPatients(updatedPatients);

    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient. Please try again.');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return (
          <AddPatientForm
            onCancel={handleBackToList}
            onSubmit={handleAddPatient}
          />
        );
      case 'edit':
        return selectedPatient ? (
          <AddPatientForm
            onCancel={handleBackToList}
            onSubmit={handleEditPatient}
            patient={selectedPatient}
            isEdit={true}
          />
        ) : null;
      case 'details':
        return selectedPatient ? (
          <PatientDetails
            patient={selectedPatient}
            onBack={handleBackToList}
          />
        ) : null;
      default:
        return (
          <PatientsList
            patients={patients}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddPatient={() => setCurrentView('add')}
            onViewPatient={handleViewPatient}
            onEditPatient={handleEditPatientForm}
            onDeletePatient={handleDeletePatient}
          />
        );
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

        {/* Content based on current view */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading patients...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Patients() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientsContent />
    </Suspense>
  );
}
