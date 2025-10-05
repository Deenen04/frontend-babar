'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { appointmentsApi, appointmentTypesApi, type Appointment, type AppointmentType } from '@/lib/api';

type ViewType = 'Day' | 'Week';
type StaffType = 'Doctor' | 'Nurse' | 'Iron Infusion';

// UI-friendly appointment interface
interface UIAppointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  patient: string;
  type: StaffType;
  day?: number; // for week view
}

const timeSlots = [
  '09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:20 AM', '10:40 AM',
  '11:00 AM', '11:20 AM', '11:40 AM', '12:00 PM', '12:20 PM', '12:40 PM',
  '01:00 PM', '01:20 PM', '01:40 PM', '02:00 PM', '02:20 PM', '02:40 PM',
  '03:00 PM', '03:20 PM', '03:40 PM', '04:00 PM', '04:20 PM', '04:40 PM',
  '05:00 PM', '05:20 PM', '05:40 PM'
];

export default function Calendar() {
  const [activeStaff, setActiveStaff] = useState<StaffType>('Doctor');
  const [currentView, setCurrentView] = useState<ViewType>('Day');
  const [currentDate, setCurrentDate] = useState('Sep 11 2025');
  const [dateRange, setDateRange] = useState('Sep 9 - Sep 15, 2025');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [uiAppointments, setUiAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const staffTabs: StaffType[] = ['Doctor', 'Nurse', 'Iron Infusion'];

  // Load appointments and appointment types from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load appointment types first
        const types = await appointmentTypesApi.getAppointmentTypes() || [];
        setAppointmentTypes(types);

        // Load appointments for the current week (you can adjust date range as needed)
        const startDate = '2025-09-09';
        const endDate = '2025-09-15';
        const apiAppointments = await appointmentsApi.getAppointments();

        // Filter by date range (in a real app, you'd pass date filters to the API)
        const filteredAppointments = (apiAppointments || []).filter(appointment => {
          const appointmentDate = appointment.appointment_date;
          return appointmentDate >= startDate && appointmentDate <= endDate;
        });

        setAppointments(filteredAppointments);

        // Convert API appointments to UI format
        const uiAppointmentsData = filteredAppointments.map(appointment => {
          const appointmentType = types.find(type => type.id === appointment.appointment_type_id);
          const typeName = appointmentType?.name || 'Unknown';

          // Map appointment type name to staff type
          let staffType: StaffType = 'Doctor';
          if (typeName.toLowerCase().includes('nurse')) {
            staffType = 'Nurse';
          } else if (typeName.toLowerCase().includes('infusion')) {
            staffType = 'Iron Infusion';
          }

          // Format time to 12-hour format
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm.toLowerCase()}`;
          };

          // Extract day from date for week view
          const appointmentDate = new Date(appointment.appointment_date);
          const dayOfMonth = appointmentDate.getDate();

          return {
            id: appointment.id,
            title: typeName,
            startTime: formatTime(appointment.start_time),
            endTime: formatTime(appointment.end_time),
            patient: appointment.patient_phone ? `Patient ${appointment.patient_phone}` : 'No Patient',
            type: staffType,
            day: dayOfMonth,
          };
        });

        setUiAppointments(uiAppointmentsData);

      } catch (err) {
        console.error('Error loading calendar data:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const weekDays = [
    { short: 'MON', date: 9 },
    { short: 'TUE', date: 10 },
    { short: 'WED', date: 11 },
    { short: 'THU', date: 12 },
    { short: 'FRI', date: 13 },
    { short: 'SAT', date: 14 },
    { short: 'SUN', date: 15 },
  ];

  const DayView = () => {
    // Filter appointments for the current day and selected staff type
    const todayAppointments = uiAppointments.filter(apt => {
      // Filter by staff type
      return apt.type === activeStaff;
    });

    return (
      <div className="flex">
        {/* Time Column */}
        <div className="w-24 pr-4">
          {timeSlots.map(time => (
            <div key={time} className="h-20 border-b border-gray-100 flex items-start pt-2">
              <span className="text-sm text-gray-500">{time}</span>
            </div>
          ))}
        </div>

        {/* Appointment Column */}
        <div className="flex-1 relative">
          {timeSlots.map((time, index) => (
            <div key={time} className="h-20 border-b border-gray-100 relative">
              {/* Show appointments for this time slot */}
              {todayAppointments
                .filter(apt => apt.startTime.startsWith(time.replace(/ AM| PM/, '').trim()))
                .map(appointment => (
                  <div key={appointment.id} className="absolute left-0 right-0 top-2 mx-2">
                    <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                      <div className="text-sm font-medium text-blue-900">{appointment.title}</div>
                      <div className="flex items-center gap-1 text-xs text-blue-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appointment.startTime} → {appointment.endTime}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">{appointment.patient}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    // Filter appointments for the week view and selected staff type
    const weekAppointments = uiAppointments.filter(apt => apt.day && apt.type === activeStaff);

    return (
      <div>
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-0 mb-4">
          <div className="text-sm text-gray-500 p-2">
            <div>Clock Interval</div>
            <div className="font-medium text-black">20 min</div>
          </div>
          {weekDays.map(day => (
            <div key={day.date} className="text-center p-2">
              <div className="text-sm text-gray-500">{day.short}</div>
              <div className={`text-lg font-medium ${day.date === 11 ? 'bg-primary text-white w-8 h-8 rounded flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
                {day.date}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-8 gap-0">
          {/* Time Column */}
          <div className="pr-2">
            {timeSlots.slice(0, 12).map(time => (
              <div key={time} className="h-16 border-b border-gray-100 flex items-start pt-2">
                <span className="text-sm text-gray-500">{time}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map(day => (
            <div key={day.date} className="border-l border-gray-100 relative">
              {timeSlots.slice(0, 12).map((time, timeIndex) => (
                <div key={time} className="h-16 border-b border-gray-100">
                  {/* Show appointments for this day and time */}
                  {weekAppointments
                    .filter(apt => apt.day === day.date)
                    .filter(apt => apt.startTime.startsWith(time.replace(/ AM| PM/, '').trim()))
                    .map(appointment => (
                      <div key={appointment.id} className="bg-blue-100 border border-blue-300 p-2 m-1 rounded text-xs">
                        <div className="font-medium text-blue-900">{appointment.title}</div>
                        <div className="text-blue-700">{appointment.startTime} - {appointment.endTime}</div>
                        <select className="text-xs border border-blue-300 rounded mt-1 bg-white">
                          <option>{appointment.patient}</option>
                        </select>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <DashboardLayout title="Calendar">
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
        {/* Header with tabs and controls */}
        <div className="flex items-center justify-between">
          {/* Staff Tabs */}
          <div className="flex space-x-8">
            {staffTabs.map(staff => (
              <button
                key={staff}
                onClick={() => setActiveStaff(staff)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeStaff === staff
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {staff}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Set Working Hours
            </button>
            <Link
              href="/calendar/book-appointment"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Appointment
            </Link>
          </div>
        </div>

        {/* Date and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">11 September</h2>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              Today
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Day/Week Toggle */}
            <div className="flex bg-gray-100 rounded-md p-1">
              {(['Day', 'Week'] as ViewType[]).map(view => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-900">
                {currentView === 'Week' ? dateRange : currentDate}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'Day' ? <DayView /> : <WeekView />}
            </>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
