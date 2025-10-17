'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { DatePicker } from '@/components/ui/date-picker';
import { appointmentsApi, appointmentTypesApi, workingHoursApi, type Appointment, type AppointmentType, type WorkingHour } from '@/lib/api';
import { axiosInstance } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ViewType = 'Day' | 'Week';
type StaffType = 'Dr. August' | 'Dr. Terrani' | 'Nurse' | 'Pragmafer';

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
  const [activeStaff, setActiveStaff] = useState<StaffType>('Dr. August');
  const [currentView, setCurrentView] = useState<ViewType>('Day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [uiAppointments, setUiAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal and working hours state
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [workingHoursLoading, setWorkingHoursLoading] = useState(false);

  // Appointment details modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Working hours form state
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [workingHoursForm, setWorkingHoursForm] = useState<Record<string, { active: boolean; startTime: string; endTime: string }>>({
    monday: { active: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { active: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { active: true, startTime: '09:00', endTime: '17:00' },
    thursday: { active: true, startTime: '09:00', endTime: '17:00' },
    friday: { active: true, startTime: '09:00', endTime: '17:00' },
    saturday: { active: false, startTime: '09:00', endTime: '17:00' },
    sunday: { active: false, startTime: '09:00', endTime: '17:00' },
  });
  const [saving, setSaving] = useState(false);
  const staffTabs: StaffType[] = ['Dr. August', 'Dr. Terrani', 'Nurse', 'Pragmafer'];

  // Map staff types to practitioner IDs
  const staffToPractitionerId: Record<StaffType, string> = {
    'Dr. August': 'user_august',
    'Dr. Terrani': 'user_terrani',
    'Nurse': 'nurse',
    'Pragmafer': 'pragmafer'
  };

  // Appointment details modal functions
  const handleAppointmentClick = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowAppointmentModal(true);
    }
  };

  // Working hours management functions
  const loadWorkingHours = async () => {
    setWorkingHoursLoading(true);
    try {
      const hours = await workingHoursApi.getWorkingHours();
      setWorkingHours(hours);
    } catch (error) {
      console.error('Error loading working hours:', error);
      setError('Failed to load working hours');
    } finally {
      setWorkingHoursLoading(false);
    }
  };

  const handleSetWorkingHours = () => {
    setShowWorkingHoursModal(true);
    loadWorkingHours();
  };

  const handleFormChange = (day: string, field: 'active' | 'startTime' | 'endTime', value: boolean | string) => {
    setWorkingHoursForm(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const saveWorkingHours = async () => {
    if (!selectedStaff) {
      setError('Please select a staff member');
      return;
    }

    setSaving(true);
    try {
      // Map staff names to practitioner IDs
      const practitionerIdMap: Record<string, string> = {
        'Dr. August': 'user_august',
        'Dr. Terrani': 'user_terrani',
        'Nurse': 'nurse',
        'Pragmafer': 'pragmafer'
      };

      const practitionerId = practitionerIdMap[selectedStaff];
      if (!practitionerId) {
        throw new Error('Invalid staff member selected');
      }

      // Save working hours for each day
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      for (const day of daysOfWeek) {
        const dayData = workingHoursForm[day];
        const dayOfWeek = daysOfWeek.indexOf(day); // 0 = Monday, 1 = Tuesday, etc.

        // Check if working hours already exist for this practitioner and day
        const existingHours = workingHours.find(
          wh => wh.practitioner_id === practitionerId && wh.day_of_week === dayOfWeek.toString()
        );

        if (dayData.active) {
          const workingHourData = {
            practitioner_id: practitionerId,
            day_of_week: dayOfWeek.toString(),
            start_time: dayData.startTime,
            end_time: dayData.endTime,
            is_active: true
          };

          if (existingHours) {
            // Update existing working hours
            await workingHoursApi.update(existingHours.id, workingHourData);
          } else {
            // Create new working hours
            await workingHoursApi.create(workingHourData);
          }
        } else if (existingHours) {
          // Deactivate existing working hours for this day
          await workingHoursApi.update(existingHours.id, { is_active: false });
        }
      }

      // Reload working hours to reflect changes
      await loadWorkingHours();

      // Close modal
      setShowWorkingHoursModal(false);

      // Show success message (you might want to add a toast notification here)
      console.log('Working hours saved successfully');

    } catch (error) {
      console.error('Error saving working hours:', error);
      setError('Failed to save working hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
        // Create date strings in local timezone to avoid UTC conversion issues
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedDayOfMonth = selectedDate.getDate();

        let startDate: string;
        let endDate: string;

        if (currentView === 'Day') {
          // Format as YYYY-MM-DD in local timezone
          startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDayOfMonth).padStart(2, '0')}`;
          endDate = startDate;
        } else {
          // For week view, get the week containing the selected date
          const selectedDay = selectedDate.getDay();
          const monday = new Date(selectedYear, selectedMonth, selectedDayOfMonth - (selectedDay === 0 ? 6 : selectedDay - 1));
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          startDate = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
          endDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
        }

        // Fetch appointments with date parameter and practitioner_id based on filter date and active staff
        // For day view: /appointments?date=2025-10-06&practitioner_id=nurse
        // For week view: /appointments?practitioner_id=nurse (fetch all and filter client-side)
        const practitionerId = staffToPractitionerId[activeStaff];
        let apiUrl = `/appointments?practitioner_id=${practitionerId}`;
        
        // Only add date parameter for Day view
        if (currentView === 'Day') {
          const dateParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDayOfMonth).padStart(2, '0')}`;
          apiUrl += `&date=${dateParam}`;
        }
        
        const directResponse = await axiosInstance.get(apiUrl);

        // Handle both array and paginated responses
        let apiAppointments: Appointment[] = [];
        if (Array.isArray(directResponse.data)) {
          apiAppointments = directResponse.data as Appointment[];
        } else if (directResponse.data && typeof directResponse.data === 'object' && 'results' in directResponse.data) {
          apiAppointments = (directResponse.data as any).results as Appointment[];
        }

        console.log('📅 API URL:', apiUrl);
        console.log('📅 Raw API Response:', directResponse.data);
        console.log('📅 Parsed Appointments:', apiAppointments);
        console.log('📅 Practitioner ID:', practitionerId);
        console.log('📅 Date Range:', { startDate, endDate, currentView });

        // For week view, we still need to filter client-side since API returns data for the week
        let filteredAppointments = apiAppointments || [];

        if (currentView === 'Day') {
          // For day view, filter by exact date (though API should already filter this)
          filteredAppointments = filteredAppointments.filter(appointment => {
            return appointment.appointment_date === startDate;
          });
        } else {
          // For week view, filter by date range (API should return week data, but double-check)
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
          let staffType: StaffType = 'Dr. August';
          let displayName = 'Appointment';

          const practitionerId = appointment.practitioner_id?.toLowerCase() || '';
          const appointmentTypeId = appointment.appointment_type_id?.toLowerCase() || '';

          // Check for nurse
          if (practitionerId.includes('nurse') || appointmentTypeId.includes('nurse')) {
            staffType = 'Nurse';
            displayName = 'Nurse Appointment';
          }
          // Check for pragmafer
          else if (practitionerId.includes('pragmafer') || appointmentTypeId.includes('pragmafer') ||
                   practitionerId.includes('infusion') || appointmentTypeId.includes('infusion')) {
            staffType = 'Pragmafer';
            displayName = 'Pragmafer';
          }
          // Default to Doctor - distinguish between Dr. August and Dr. Terrani
          else {
            // Extract doctor name from practitioner_id (e.g., "user_august" -> "Dr. August")
            if (practitionerId.includes('august')) {
              staffType = 'Dr. August';
              displayName = 'Dr. August';
            } else if (practitionerId.includes('terrani')) {
              staffType = 'Dr. Terrani';
              displayName = 'Dr. Terrani';
            } else {
              staffType = 'Dr. August';
              displayName = 'Doctor Appointment';
            }
          }
          
          // For doctor appointments, always show the doctor name, not appointment type
          if (staffType === 'Dr. August' || staffType === 'Dr. Terrani') {
            // Keep the doctor name as displayName
          } else {
            // For non-doctor appointments, try to get appointment type name if available
            const appointmentType = types.find(type => type.id === appointment.appointment_type_id);
            if (appointmentType?.name) {
              displayName = appointmentType.name;
            }
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
          // Parse the date string in local timezone to avoid timezone conversion issues
          const [year, month, day] = appointment.appointment_date.split('-').map(Number);
          const appointmentDate = new Date(year, month - 1, day);
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
  }, [selectedDate, currentView, activeStaff]);

  // Calculate week days based on selected date
  const getWeekDays = () => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDayOfMonth = selectedDate.getDate();
    const selectedDay = selectedDate.getDay();

    const monday = new Date(selectedYear, selectedMonth, selectedDayOfMonth - (selectedDay === 0 ? 6 : selectedDay - 1));

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
                className="absolute left-2 right-2 overflow-hidden cursor-pointer"
                style={style}
                onClick={() => handleAppointmentClick(appointment.id)}
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
              <div className={`text-lg font-medium ${day.fullDate.toDateString() === selectedDate.toDateString() ? 'bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
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
                      className="absolute left-0.5 right-0.5 overflow-hidden cursor-pointer"
                      style={style}
                      onClick={() => handleAppointmentClick(appointment.id)}
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
            <button
              onClick={handleSetWorkingHours}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
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
                  <p>Selected Date: {selectedDate.toLocaleDateString()}</p>
                  <p>Current View: {currentView}</p>
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

      {/* Working Hours Modal */}
      <Dialog open={showWorkingHoursModal} onOpenChange={setShowWorkingHoursModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center w-full">
              <DialogTitle className="text-2xl font-bold text-gray-900">Set Working Hours</DialogTitle>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Holiday
              </button>
            </div>
          </DialogHeader>

          {/* Controls Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-gray-600">Select working Day and time</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Member:</span>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Doctor</option>
                    {staffTabs.filter(staff => staff !== 'Dr. August').map(staff => (
                      <option key={staff} value={staff}>{staff}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Operation Day
              </button>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>

            {/* Monday Rows */}
            {[
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' },
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' },
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' },
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' },
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' },
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' },
              { date: '9 Sept 2025', startTime: '05:00 AM', endTime: '05:00 AM' }
            ].map((monday, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 min-w-[80px]">Monday</span>
                  <span className="text-sm text-gray-500">{monday.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      id={`active-${index}`}
                    />
                    <label
                      htmlFor={`active-${index}`}
                      className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors ${
                        true ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                          true ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </label>
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Start</label>
                    <select className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="05:00 AM">05:00 AM</option>
                      <option value="06:00 AM">06:00 AM</option>
                      <option value="07:00 AM">07:00 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">End</label>
                    <select className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="05:00 AM">05:00 AM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setShowWorkingHoursModal(false)}
              disabled={saving}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={saveWorkingHours}
              disabled={saving || !selectedStaff}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Appointment Details</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedAppointment.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAppointment.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Appointment ID</h3>
                  <p className="text-sm font-mono text-gray-900">{selectedAppointment.id}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Patient Phone</h3>
                  <p className="text-sm text-gray-900">
                    {selectedAppointment.patient_phone || 'Not provided'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Practitioner ID</h3>
                  <p className="text-sm text-gray-900">{selectedAppointment.practitioner_id}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Appointment Type ID</h3>
                  <p className="text-sm text-gray-900">{selectedAppointment.appointment_type_id}</p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Start Time</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(`2000-01-01T${selectedAppointment.start_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">End Time</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(`2000-01-01T${selectedAppointment.end_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  {selectedAppointment.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  {selectedAppointment.call_id && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Call ID</h4>
                      <p className="text-sm font-mono text-gray-900">{selectedAppointment.call_id}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Created By</h4>
                    <p className="text-sm text-gray-900">{selectedAppointment.created_by}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Created At</h4>
                      <p className="text-xs text-gray-900">
                        {new Date(selectedAppointment.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Updated At</h4>
                      <p className="text-xs text-gray-900">
                        {new Date(selectedAppointment.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
