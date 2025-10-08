'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { appointmentsApi, Appointment } from '../lib/api/appointments';
import { practitionersApi, Practitioner } from '../lib/api/practitioners';
import { settingsApi } from '../lib/api/settings';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  // State for appointments and practitioners
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [clinicName, setClinicName] = useState<string>('CiniBot Clinic');
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [isLoadingPractitioners, setIsLoadingPractitioners] = useState(false);

  // Fetch today's appointments and practitioners
  useEffect(() => {
    const fetchTodayData = async () => {
      if (!isDashboard) return;

      try {
        setIsLoadingAppointments(true);
        setIsLoadingPractitioners(true);
        setAppointmentError(null);

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Fetch appointments for today, practitioners, and clinic name in parallel
        const [todayAppointments, allPractitioners, systemSettings] = await Promise.all([
          appointmentsApi.getByDate(today),
          practitionersApi.getPractitioners(),
          settingsApi.getSystemConfig().catch(() => []) // Fallback to empty array if settings fail
        ]);

        setAppointments(todayAppointments);
        setPractitioners(allPractitioners);

        // Set clinic name from system settings or use default
        const clinicSetting = systemSettings.find(setting => setting.setting_key === 'clinic_name');
        if (clinicSetting) {
          setClinicName(clinicSetting.setting_value);
        }
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        setAppointmentError('Failed to load today\'s appointments');
      } finally {
        setIsLoadingAppointments(false);
        setIsLoadingPractitioners(false);
      }
    };

    fetchTodayData();
  }, [isDashboard]);

  // Helper function to get practitioner name by ID
  const getPractitionerName = (practitionerId: string) => {
    const practitioner = practitioners.find(p => p.id === practitionerId);
    return practitioner ? `${practitioner.title} ${practitioner.first_name} ${practitioner.last_name}` : 'Unknown Doctor';
  };

  // Helper function to format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title={title} />
      
      <main className={`pl-64 pt-16 ${isDashboard ? 'pr-80' : ''}`}>
        <div className="h-screen overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>

      {/* Today's Appointments Sidebar - Only on Dashboard */}
      {isDashboard && (
        <div className="fixed top-16 right-0 w-80 h-screen bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
              <button className="text-primary text-sm font-medium hover:text-primary-hover">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {isLoadingAppointments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading appointments...</p>
                </div>
              ) : appointmentError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500">{appointmentError}</p>
                </div>
              ) : !appointments || appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No appointments scheduled for today</p>
                </div>
              ) : (
                appointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.appointment_date);
                  const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayOfMonth = appointmentDate.getDate();

                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500">
                            {dayOfWeek}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {dayOfMonth}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getPractitionerName(appointment.practitioner_id)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {clinicName}
                          </p>
                          {appointment.patient_phone && (
                            <p className="text-xs text-gray-400">
                              Patient: {appointment.patient_phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
