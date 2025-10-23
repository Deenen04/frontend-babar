'use client';

import { useState } from 'react';
import { Patient } from '@/app/patients/page';

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onEdit?: () => void;
  notesValue?: string;
  isEditingNotes?: boolean;
  savingNotes?: boolean;
  onEditNotes?: () => void;
  onSaveNotes?: () => void;
  onCancelNotes?: () => void;
  onNotesChange?: (value: string) => void;
}

type TabType = 'general' | 'appointments';
type AppointmentType = 'upcoming' | 'previous';

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
}

const sampleAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Esther Howard',
    date: 'Sep 11 2025',
    time: '7:00am - 8:00am',
  },
  {
    id: '2',
    doctorName: 'Dr. Esther Howard',
    date: 'Sep 11 2025',
    time: '7:00am - 8:00am',
  },
  {
    id: '3',
    doctorName: 'Dr. Esther Howard',
    date: 'Sep 11 2025',
    time: '7:00am - 8:00am',
  },
  {
    id: '4',
    doctorName: 'Dr. Esther Howard',
    date: 'Sep 11 2025',
    time: '7:00am - 8:00am',
  },
  {
    id: '5',
    doctorName: 'Dr. Esther Howard',
    date: 'Sep 11 2025',
    time: '7:00am - 8:00am',
  },
  {
    id: '6',
    doctorName: 'Dr. Esther Howard',
    date: 'Sep 11 2025',
    time: '7:00am - 8:00am',
  },
];

export default function PatientDetails({ 
  patient, 
  onBack, 
  onEdit, 
  notesValue = '', 
  isEditingNotes = false, 
  savingNotes = false, 
  onEditNotes, 
  onSaveNotes, 
  onCancelNotes, 
  onNotesChange 
}: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('upcoming');
  const [selectedDate, setSelectedDate] = useState('Sep 11 2025');

  const renderGeneralInformation = () => (
    <div className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Edit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-medium text-gray-900">{`${patient.first_name} ${patient.last_name}`}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Date Of Birth</label>
            <p className="font-medium text-gray-900">07/01/1997</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Age</label>
            <p className="font-medium text-gray-900">26</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Contact Number</label>
            <p className="font-medium text-gray-900">{patient.contactNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email Address</label>
            <p className="font-medium text-gray-900">{patient.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Address</label>
            <p className="font-medium text-gray-900">{patient.address}</p>
          </div>
        </div>
      </div>

      {/* Insurance Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Insurance Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Provider Name</label>
            <p className="font-medium text-gray-900">{patient.providerName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Insurance Id</label>
            <p className="font-medium text-gray-900">077653</p>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Notes</h3>
          {!isEditingNotes && onEditNotes && (
            <button 
              onClick={onEditNotes}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Edit Notes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
        
        {isEditingNotes ? (
          <div className="space-y-4">
            <textarea
              value={notesValue}
              onChange={(e) => onNotesChange?.(e.target.value)}
              rows={4}
              placeholder="Enter medical notes..."
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={onSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNotes ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Notes'
                )}
              </button>
              <button
                onClick={onCancelNotes}
                disabled={savingNotes}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px] p-3 border border-gray-200 rounded-md bg-gray-50">
            {notesValue ? (
              <p className="text-gray-900 text-sm whitespace-pre-wrap">{notesValue}</p>
            ) : (
              <p className="text-gray-500 text-sm">No medical notes available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Appointment Type Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAppointmentType('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              appointmentType === 'upcoming'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Upcoming Appointments
          </button>
          <button
            onClick={() => setAppointmentType('previous')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              appointmentType === 'previous'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Previous Appointments
          </button>
        </div>

        {appointmentType === 'previous' && (
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-900">{selectedDate}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Appointments Grid */}
      {appointmentType === 'upcoming' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Dr. Esther Howard</p>
                <p className="text-sm text-gray-500">Sep 11 2025</p>
              </div>
            </div>
            <div className="mt-3 px-3 py-2 bg-primary text-white rounded-md text-sm font-medium">
              7:00am - 8:00am
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                  <p className="text-sm text-gray-500">{appointment.date}</p>
                </div>
              </div>
              <div className="px-3 py-2 bg-primary text-white rounded-md text-sm font-medium">
                {appointment.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General Information
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appointments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Appointments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? renderGeneralInformation() : renderAppointments()}
    </div>
  );
}
