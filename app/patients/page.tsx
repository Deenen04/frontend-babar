'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PatientsList from '@/components/PatientsList';
import AddPatientForm from '@/components/AddPatientForm';
import PatientDetails from '@/components/PatientDetails';

export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  ext: string;
  phoneNo: string;
  insuranceProvider: string;
  insuranceId: string;
  email?: string;
  address?: string;
  gender?: string;
  age?: number;
  contactNumber?: string;
  providerName?: string;
  note?: string;
};

const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    dateOfBirth: '29/03/2003',
    ext: '+91',
    phoneNo: '8096676654',
    insuranceProvider: '-',
    insuranceId: '-',
    email: 'martha.johnson@gmail.com',
    address: '0410 Witting Overpass,California',
    gender: 'Male',
    age: 26,
    contactNumber: '+ 1 345 346 347',
    providerName: 'Company Name',
    note: '',
  },
  {
    id: '2',
    name: 'John Doe',
    dateOfBirth: 'Designer',
    ext: '+91',
    phoneNo: '8096676654',
    insuranceProvider: 'Provider Name',
    insuranceId: '12345',
    email: 'martha.johnson@gmail.com',
    address: '0410 Witting Overpass,California',
    gender: 'Male',
    age: 26,
    contactNumber: '+ 1 345 346 347',
    providerName: 'Company Name',
    note: '',
  },
];

export type ViewType = 'list' | 'add' | 'edit' | 'details';

export default function Patients() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>(samplePatients);

  const handleAddPatient = (patient: Omit<Patient, 'id'>) => {
    const newPatient = {
      ...patient,
      id: (patients.length + 1).toString(),
    };
    setPatients([...patients, newPatient]);
    setCurrentView('list');
  };

  const handleEditPatient = (updatedPatient: Patient | Omit<Patient, 'id'>) => {
    if ('id' in updatedPatient) {
      setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    }
    setCurrentView('list');
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
            onAddPatient={() => setCurrentView('add')}
            onViewPatient={handleViewPatient}
            onEditPatient={handleEditPatientForm}
          />
        );
    }
  };

  return (
    <DashboardLayout title="Patients">
      {renderContent()}
    </DashboardLayout>
  );
}
