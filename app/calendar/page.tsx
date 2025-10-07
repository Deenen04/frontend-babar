'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { DatePicker } from '@/components/ui/date-picker';
import { appointmentsApi, appointmentTypesApi, type Appointment, type AppointmentType } from '@/lib/api';
import { axiosInstance } from '@/lib/axios';

type ViewType = 'Day' | 'Week';
type StaffType = 'Doctor 1' | 'Doctor 2' | 'Nurse' | 'Pragmafare';

// UI-friendly appointment interface
interface UIAppointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  patient: string;
  type: StaffType;
  day?: number; // for week view
  status?: string;
}

const timeSlots = [
  '08:00 AM', '08:20 AM', '08:40 AM', '09:00 AM', '09:20 AM', '09:40 AM',
  '10:00 AM', '10:20 AM', '10:40 AM', '11:00 AM', '11:20 AM', '11:40 AM',
  '12:00 PM', '12:20 PM', '12:40 PM', '01:00 PM', '01:20 PM', '01:40 PM',
  '02:00 PM', '02:20 PM', '02:40 PM', '03:00 PM', '03:20 PM', '03:40 PM',
  '04:00 PM', '04:20 PM', '04:40 PM', '05:00 PM', '05:20 PM', '05:40 PM',
  '06:00 PM'
];

export default function Calendar() {
  const [activeStaff, setActiveStaff] = useState<StaffType>('Doctor 1');
  const [currentView, setCurrentView] = useState<ViewType>('Day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 9, 3)); // October 3, 2025
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 3)); // October 3, 2025
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [uiAppointments, setUiAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const staffTabs: StaffType[] = ['Doctor 1', 'Doctor 2', 'Nurse', 'Pragmafare'];

  // Load appointments and appointment types from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load appointment types first
        const types = await appointmentTypesApi.getAppointmentTypes() || [];
        setAppointmentTypes(types);

        // Calculate date range based on current view and selected date
        let startDate: string;
        let endDate: string;

        if (currentView === 'Day') {
          startDate = selectedDate.toISOString().split('T')[0];
          endDate = startDate;
        } else {
          // For week view, get the week containing the selected date
          const selectedDay = selectedDate.getDay();
          const monday = new Date(selectedDate);
          monday.setDate(selectedDate.getDate() - (selectedDay === 0 ? 6 : selectedDay - 1));
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          startDate = monday.toISOString().split('T')[0];
          endDate = sunday.toISOString().split('T')[0];
        }

        // Fetch all appointments directly from API
        // Note: API returns direct array, not paginated response
        const directResponse = await axiosInstance.get('/appointments');
        
        // Handle both array and paginated responses
        let apiAppointments: Appointment[] = [];
        if (Array.isArray(directResponse.data)) {
          apiAppointments = directResponse.data as Appointment[];
        } else if (directResponse.data && typeof directResponse.data === 'object' && 'results' in directResponse.data) {
          apiAppointments = (directResponse.data as any).results as Appointment[];
        }
        
        console.log('📅 Raw API Response:', directResponse.data);
        console.log('📅 Parsed Appointments:', apiAppointments);
        console.log('📅 Date Range:', { startDate, endDate, currentView });

        // Filter appointments client-side based on view and date
        let filteredAppointments = apiAppointments || [];
        
        if (currentView === 'Day') {
          // For day view, filter by exact date
          filteredAppointments = filteredAppointments.filter(appointment => {
            return appointment.appointment_date === startDate;
          });
        } else {
          // For week view, filter by date range
          filteredAppointments = filteredAppointments.filter(appointment => {
            const appointmentDate = appointment.appointment_date;
            return appointmentDate >= startDate && appointmentDate <= endDate;
          });
        }
        
        console.log('📅 Filtered Appointments:', filteredAppointments);

        setAppointments(filteredAppointments);

        // Convert API appointments to UI format
        const uiAppointmentsData = filteredAppointments.map(appointment => {
          // Map practitioner_id and appointment_type_id to staff type
          let staffType: StaffType = 'Doctor 1';
          let displayName = 'Appointment';

          const practitionerId = appointment.practitioner_id?.toLowerCase() || '';
          const appointmentTypeId = appointment.appointment_type_id?.toLowerCase() || '';

          // Check for nurse
          if (practitionerId.includes('nurse') || appointmentTypeId.includes('nurse')) {
            staffType = 'Nurse';
            displayName = 'Nurse Appointment';
          }
          // Check for pragmafare
          else if (practitionerId.includes('pragmafer') || appointmentTypeId.includes('pragmafer') ||
                   practitionerId.includes('infusion') || appointmentTypeId.includes('infusion')) {
            staffType = 'Pragmafare';
            displayName = 'Pragmafare';
          }
          // Default to Doctor - distinguish between Doctor 1 and Doctor 2
          else {
            // Extract doctor name from practitioner_id (e.g., "user_august" -> "Dr. August")
            if (practitionerId.includes('august')) {
              staffType = 'Doctor 1';
              displayName = 'Dr. August';
            } else if (practitionerId.includes('terrani')) {
              staffType = 'Doctor 2';
              displayName = 'Dr. Terrani';
            } else {
              staffType = 'Doctor 1';
              displayName = 'Doctor Appointment';
            }
          }
          
          // Try to get appointment type name if available
          const appointmentType = types.find(type => type.id === appointment.appointment_type_id);
          if (appointmentType?.name) {
            displayName = appointmentType.name;
          }

          // Format time to 12-hour format
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
          };

          // Extract day from date for week view
          const appointmentDate = new Date(appointment.appointment_date + 'T00:00:00');
          const dayOfMonth = appointmentDate.getDate();

          // Format patient display
          let patientDisplay = 'Available';
          if (appointment.patient_phone) {
            patientDisplay = appointment.patient_phone;
          } else if (appointment.status === 'available') {
            patientDisplay = 'Available';
          }

          return {
            id: appointment.id,
            title: displayName,
            startTime: formatTime(appointment.start_time),
            endTime: formatTime(appointment.end_time),
            patient: patientDisplay,
            type: staffType,
            day: dayOfMonth,
            status: appointment.status,
          };
        });

        console.log('📅 UI Appointments Created:', uiAppointmentsData);
        console.log('📅 Total UI Appointments:', uiAppointmentsData.length);
        
        setUiAppointments(uiAppointmentsData);

      } catch (err) {
        console.error('❌ Error loading calendar data:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate, currentView]);

  // Calculate week days based on current date
  const getWeekDays = () => {
    const currentDay = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const days = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        short: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: date
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  const DayView = () => {
    // Filter appointments for the current day and selected staff type
    const todayAppointments = uiAppointments.filter(apt => {
      // Filter by staff type
      return apt.type === activeStaff;
    });

    // Helper to convert time string to minutes from start of day (8:00 AM)
    const timeToMinutes = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    // Start time is 8:00 AM (480 minutes from midnight)
    const startMinutes = timeToMinutes('08:00 AM');
    const pixelsPerMinute = 80 / 20; // 80px height per 20-minute slot = 4px per minute

    const getAppointmentStyle = (appointment: UIAppointment) => {
      const startMins = timeToMinutes(appointment.startTime);
      const endMins = timeToMinutes(appointment.endTime);
      const duration = endMins - startMins;
      
      const top = (startMins - startMinutes) * pixelsPerMinute;
      const height = duration * pixelsPerMinute;
      
      return { top: `${top}px`, height: `${height}px` };
    };

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
        <div className="flex-1 relative" style={{ minHeight: `${timeSlots.length * 80}px` }}>
          {/* Grid lines */}
          {timeSlots.map((time, index) => (
            <div 
              key={time} 
              className="absolute left-0 right-0 h-20 border-b border-gray-100"
              style={{ top: `${index * 80}px` }}
            />
          ))}
          
          {/* Appointments positioned absolutely based on their start and end times */}
          {todayAppointments.map(appointment => {
            const isAvailable = appointment.status === 'available';
            const isConfirmed = appointment.status === 'confirmed';
            const style = getAppointmentStyle(appointment);
            
            return (
              <div 
                key={appointment.id} 
                className="absolute left-2 right-2 overflow-hidden"
                style={style}
              >
                <div className={`h-full border-l-4 p-2 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  isAvailable 
                    ? 'bg-green-50 border-green-500 hover:bg-green-100' 
                    : isConfirmed
                    ? 'bg-blue-100 border-blue-500 hover:bg-blue-200'
                    : 'bg-gray-100 border-gray-500 hover:bg-gray-200'
                }`}>
                  <div className={`text-sm font-semibold truncate ${
                    isAvailable ? 'text-green-900' : isConfirmed ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {appointment.title}
                  </div>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    isAvailable ? 'text-green-700' : isConfirmed ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{appointment.startTime} - {appointment.endTime}</span>
                  </div>
                  <div className={`text-xs mt-1 font-medium truncate ${
                    isAvailable ? 'text-green-600' : isConfirmed ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {appointment.patient}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    // Filter appointments for the week view and selected staff type
    const weekAppointments = uiAppointments.filter(apt => apt.day && apt.type === activeStaff);

    // Helper to convert time string to minutes from start of day
    const timeToMinutes = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };

    // Start time is 8:00 AM
    const startMinutes = timeToMinutes('08:00 AM');
    const pixelsPerMinute = 64 / 20; // 64px height per 20-minute slot = 3.2px per minute

    const getAppointmentStyle = (appointment: UIAppointment) => {
      const startMins = timeToMinutes(appointment.startTime);
      const endMins = timeToMinutes(appointment.endTime);
      const duration = endMins - startMins;
      
      const top = (startMins - startMinutes) * pixelsPerMinute;
      const height = Math.max(duration * pixelsPerMinute, 30); // Minimum height of 30px
      
      return { top: `${top}px`, height: `${height}px` };
    };

    return (
      <div>
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-0 mb-4">
          <div className="text-sm text-gray-500 p-2">
            <div>Clock Interval</div>
            <div className="font-medium text-black">20 min</div>
          </div>
          {weekDays.map(day => (
            <div key={day.fullDate.toISOString()} className="text-center p-2">
              <div className="text-sm text-gray-500">{day.short}</div>
              <div className={`text-lg font-medium ${day.fullDate.toDateString() === currentDate.toDateString() ? 'bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
                {day.date}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-8 gap-0">
          {/* Time Column */}
          <div className="pr-2">
            {timeSlots.map(time => (
              <div key={time} className="h-16 border-b border-gray-100 flex items-start pt-1">
                <span className="text-xs text-gray-500">{time}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map(day => (
            <div 
              key={day.fullDate.toISOString()} 
              className="border-l border-gray-200 relative"
              style={{ minHeight: `${timeSlots.length * 64}px` }}
            >
              {/* Grid lines */}
              {timeSlots.map((time, timeIndex) => (
                <div 
                  key={time} 
                  className="absolute left-0 right-0 h-16 border-b border-gray-100"
                  style={{ top: `${timeIndex * 64}px` }}
                />
              ))}
              
              {/* Appointments positioned absolutely based on their start and end times */}
              {weekAppointments
                .filter(apt => apt.day === day.date)
                .map(appointment => {
                  const isAvailable = appointment.status === 'available';
                  const isConfirmed = appointment.status === 'confirmed';
                  const style = getAppointmentStyle(appointment);
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className="absolute left-0.5 right-0.5 overflow-hidden"
                      style={style}
                    >
                      <div className={`h-full border-l-2 px-1 py-0.5 rounded text-[10px] shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        isAvailable 
                          ? 'bg-green-50 border-green-500 hover:bg-green-100' 
                          : isConfirmed
                          ? 'bg-blue-100 border-blue-500 hover:bg-blue-200'
                          : 'bg-gray-100 border-gray-500 hover:bg-gray-200'
                      }`}>
                        <div className={`font-semibold truncate leading-tight ${
                          isAvailable ? 'text-green-900' : isConfirmed ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {appointment.title}
                        </div>
                        <div className={`truncate leading-tight ${
                          isAvailable ? 'text-green-700' : isConfirmed ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {appointment.startTime}
                        </div>
                        {style.height && parseInt(style.height) > 50 && (
                          <div className={`truncate leading-tight font-medium ${
                            isAvailable ? 'text-green-600' : isConfirmed ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {appointment.patient}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              }
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
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            {!loading && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {uiAppointments.filter(apt => apt.type === activeStaff).length} appointments
              </span>
            )}
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Today
            </button>
            {/* Legend */}
            <div className="flex items-center gap-4 ml-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-50 border-l-2 border-green-500 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 rounded"></div>
                <span className="text-gray-600">Confirmed</span>
              </div>
            </div>
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
            <DatePicker
              date={selectedDate}
              onDateChange={(date) => date && setSelectedDate(date)}
              placeholder="Select date"
              className="w-auto"
            />
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto max-h-[calc(100vh-240px)]">
          {loading ? (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading appointments...</p>
              </div>
            </div>
          ) : uiAppointments.length === 0 ? (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No appointments found</p>
                <p className="text-gray-400 text-sm">
                  Try selecting a different date or staff type
                </p>
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-left inline-block">
                  <p className="font-semibold mb-1">Debug Info:</p>
                  <p>Selected Date: {selectedDate.toISOString().split('T')[0]}</p>
                  <p>Active Staff: {activeStaff}</p>
                  <p>Total Raw Appointments: {appointments.length}</p>
                  <p className="text-gray-400 mt-1">Check browser console for details</p>
                </div>
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
