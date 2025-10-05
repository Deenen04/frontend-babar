'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { callsApi, type Call } from '@/lib/api/calls';
import { appointmentsApi, type Appointment } from '@/lib/api/appointments';
import { remindersApi, type Reminder } from '@/lib/api/reminders';

export default function Dashboard() {
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [appointmentsBooked, setAppointmentsBooked] = useState<number>(0);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [liveCalls, setLiveCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch calls data for total minutes and live calls using API caller
      const callsData = await callsApi.getCalls();

      // Calculate total minutes from all calls
      const totalMinutesCalculated = callsData.reduce((total: number, call: Call) => {
        return total + (call.duration_seconds / 60); // Convert seconds to minutes
      }, 0);
      setTotalMinutes(Math.round(totalMinutesCalculated));

      // Filter live/ongoing calls
      const liveCallsFiltered = callsData.filter((call: Call) =>
        call.call_status === 'ongoing' || call.call_status === 'active'
      );
      setLiveCalls(liveCallsFiltered);

      // Fetch appointments data using API caller
      const appointmentsData = await appointmentsApi.getAppointments();

      // Count appointments booked (assuming 'booked' or 'confirmed' status)
      const bookedCount = appointmentsData.filter((appointment: Appointment) =>
        appointment.status === 'booked' || appointment.status === 'confirmed'
      ).length;
      setAppointmentsBooked(bookedCount);

      // Fetch reminders data using API caller
      const remindersData = await remindersApi.getReminders();
      setReminders(remindersData.slice(0, 3)); // Show only first 3 reminders

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prescription': return 'text-blue-600';
      case 'callback': return 'text-purple-600';
      case 'followup': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Overview Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Calling Minutes */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Calling Minutes</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{totalMinutes.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Booked by AI */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Appointments Booked by AI</p>
                  <span className="text-3xl font-bold text-gray-900">{appointmentsBooked}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reminders Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reminders</h2>
            <button className="text-primary text-sm font-medium hover:text-primary-hover">
              See all
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {reminders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No reminders found
              </div>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {reminder.patient_phone.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        <span className={`text-sm ${getReminderTypeColor(reminder.reminder_type)}`}>
                          Type: {reminder.reminder_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover">
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Live calls Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Live calls</h2>
            <button className="text-primary text-sm font-medium hover:text-primary-hover">
              See all
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {liveCalls.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No live calls at the moment
              </div>
            ) : (
              liveCalls.map((call) => (
                <div key={call.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {call.patient_id ? `Patient ${call.patient_id.slice(0, 8)}...` : 'Unknown Patient'}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {call.call_type === 'incoming' ? 'Incoming call' : 'Outgoing call'}
                      </span>
                      <span className="text-sm text-gray-500">{call.phone_number}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Transcription</p>
                    <p className="text-sm text-gray-500">
                      {call.transcript && call.transcript.length > 100
                        ? `${call.transcript.substring(0, 100)}...`
                        : call.transcript || 'No transcription available'
                      }
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

    </DashboardLayout>
  );
}
