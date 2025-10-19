'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  appointmentsApi,
  appointmentsUtils,
  appointmentTypesApi,
  AppointmentType,
  CreateAppointmentRequest
} from '@/lib/api/appointments';
import { practitionersApi, practitionersUtils, Practitioner } from '@/lib/api/practitioners';
import { patientsApi, patientsUtils, Patient as APIPatient } from '@/lib/api/patients';
import { workingHoursApi, workingHoursUtils } from '@/lib/api/working-hours';

interface BookingData {
  patientId: string;
  patientName: string;
  contactNumber: string;
  countryCode: string;
  dateOfBirth: string;
  insuranceId: string;
  insuranceProvider: string;
  selectedDate: Date | null;
  selectedTime: string;
  practitionerId: string;
  appointmentTypeId: string;
}

export default function BookAppointment() {
  const router = useRouter();

  // API Data State
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [patients, setPatients] = useState<APIPatient[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // UI State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  const [bookingData, setBookingData] = useState<BookingData>({
    patientId: '',
    patientName: '',
    contactNumber: '',
    countryCode: '+1',
    dateOfBirth: '',
    insuranceId: '',
    insuranceProvider: '',
    selectedDate: new Date(),
    selectedTime: '',
    practitionerId: '',
    appointmentTypeId: ''
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load practitioners
        const practitionersData = await practitionersApi.getActivePractitioners();
        setPractitioners(practitionersData);

        // Load appointment types
        const appointmentTypesData = await appointmentTypesApi.getAppointmentTypes();
        setAppointmentTypes(appointmentTypesData);

        // Load patients
        const patientsData = await patientsApi.getActivePatients();
        setPatients(patientsData);

        // Set default values if data is available
        if (practitionersData.length > 0) {
          setBookingData(prev => ({ ...prev, practitionerId: practitionersData[0].id }));
        }
        if (appointmentTypesData.length > 0) {
          setBookingData(prev => ({ ...prev, appointmentTypeId: appointmentTypesData[0].id }));
        }

      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load available slots when practitioner or date changes
  useEffect(() => {
    if (bookingData.practitionerId && bookingData.selectedDate && bookingData.appointmentTypeId) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [bookingData.practitionerId, bookingData.selectedDate, bookingData.appointmentTypeId]);

  // Load available time slots for selected practitioner and date
  const loadAvailableSlots = async () => {
    if (!bookingData.practitionerId || !bookingData.selectedDate || !bookingData.appointmentTypeId) {
      setAvailableSlots([]);
      return;
    }

    try {
      setError(null);

      // Get appointments for the selected date
      const dateString = bookingData.selectedDate.toISOString().split('T')[0];
      const appointmentsForDate = await appointmentsApi.getByDate(dateString);

      // Ensure appointmentsForDate is an array before filtering
      if (!Array.isArray(appointmentsForDate)) {
        console.warn('Appointments data is not an array:', appointmentsForDate);
        setAvailableSlots([]);
        return;
      }

      // Filter for available slots for the selected practitioner and appointment type
      const availableAppointments = appointmentsForDate.filter(appointment =>
        appointment.practitioner_id === bookingData.practitionerId &&
        appointment.appointment_type_id === bookingData.appointmentTypeId &&
        appointment.status === 'available'
      );

      // Extract and format the start times
      const slots = availableAppointments.map(appointment => formatTimeTo12Hour(appointment.start_time));

      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error loading available slots:', err);
      setError('Failed to load available time slots.');
      setAvailableSlots([]);
    }
  };

  // Generate time slots based on working hours and appointment duration
  const generateTimeSlots = (startTime: string, endTime: string, durationMinutes: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += durationMinutes) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(formatTimeTo12Hour(timeString));
    }

    return slots;
  };

  // Convert 12-hour format to 24-hour format for API
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h || !time12h.match(/(am|pm)/i)) {
      throw new Error('Invalid time format. Expected format: HH:MMam/pm');
    }
    const [time, period] = time12h.split(/(am|pm)/i);
    let [hours, minutes] = time.split(':').map(Number);
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

  // Format time to 12-hour format for display
  const formatTimeTo12Hour = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
  };

  // Handle patient selection
  const handlePatientChange = (patientId: string) => {
    const selectedPatient = patients.find(p => p.id === patientId);
    if (selectedPatient) {
      setBookingData(prev => ({
        ...prev,
        patientId,
        patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        contactNumber: selectedPatient.phone_number,
        countryCode: selectedPatient.phone_extension || '+1',
        dateOfBirth: selectedPatient.date_of_birth || '',
        insuranceId: selectedPatient.insurance_id || '',
        insuranceProvider: selectedPatient.insurance_provider || ''
      }));
    }
  };

  // Handle appointment creation
  const handleSaveAppointment = async () => {
    console.log(bookingData);

    // Validate required fields
    if (!bookingData.selectedDate) {
      alert('Please select a date for the appointment.');
      return;
    }

    if (!bookingData.selectedTime) {
      alert('Please select a time slot for the appointment.');
      return;
    }

    if (!bookingData.patientId) {
      alert('Please select a patient.');
      return;
    }

    if (!bookingData.appointmentTypeId) {
      alert('Please select an appointment type.');
      return;
    }

    if (!bookingData.practitionerId) {
      setError('Please select a practitioner.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const selectedAppointmentType = appointmentTypes.find(at => at.id === bookingData.appointmentTypeId);
      const durationMinutes = selectedAppointmentType?.duration_minutes || 30;

      const startTime24h = convertTo24Hour(bookingData.selectedTime);
      const [hours, minutes] = startTime24h.split(':').map(Number);
      const endTime = new Date(bookingData.selectedDate);
      endTime.setHours(hours, minutes + durationMinutes);
      const endTime24h = endTime.toTimeString().slice(0, 8);

      const appointmentData: CreateAppointmentRequest = {
        patient_phone: bookingData.contactNumber,
        patient_name: bookingData.patientName,
        practitioner_id: bookingData.practitionerId,
        appointment_type_id: bookingData.appointmentTypeId,
        appointment_date: bookingData.selectedDate.toISOString().split('T')[0],
        start_time: startTime24h,
        end_time: endTime24h,
        status: 'scheduled',
        notes: '',
        created_by: 'user-123'
      };

      await appointmentsApi.create(appointmentData);

      // Redirect back to calendar
      router.push('/calendar');
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateCalendarDays = () => {
    const year = selectedCalendarDate.getFullYear();
    const month = selectedCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday

    const days = [];
    const currentDate = new Date(startDate);

    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  return (
    <DashboardLayout title="Book Appointment">
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

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading appointment data...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <Link 
            href="/calendar"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Book appointment</h1>
        </div>

        <div className="flex">
          {/* Form Section */}
          <div className="w-1/2 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient's Name *
              </label>
              <select
                value={bookingData.patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                disabled={loading}
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <div className="flex">
                <select
                  value={bookingData.countryCode}
                  onChange={(e) => setBookingData(prev => ({ ...prev, countryCode: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-gray-50 flex items-center"
                  disabled
                >
                  <option value={bookingData.countryCode}>{bookingData.countryCode}</option>
                </select>
                <input
                  type="tel"
                  value={bookingData.contactNumber}
                  readOnly
                  className="flex-1 px-3 py-2 text-black border border-l-0 border-gray-300 rounded-r-md bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bookingData.dateOfBirth}
                  readOnly
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-md bg-gray-50"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance ID
              </label>
              <input
                type="text"
                value={bookingData.insuranceId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider
              </label>
              <input
                type="text"
                value={bookingData.insuranceProvider}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <button className="text-primary text-sm font-medium hover:text-primary-hover">
              Add New Patient
            </button>
          </div>

          {/* Calendar Section */}
          <div className="w-1/2 p-6 border-l border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date and Time</h3>

            {/* Practitioner Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practitioner *
              </label>
              <select
                value={bookingData.practitionerId}
                onChange={(e) => setBookingData(prev => ({ ...prev, practitionerId: e.target.value, selectedTime: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                disabled={loading}
              >
                <option value="">Select a practitioner</option>
                {practitioners.map(practitioner => (
                  <option key={practitioner.id} value={practitioner.id}>
                    {practitioner.title} {practitioner.first_name} {practitioner.last_name} - {practitioner.specialization}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type *
              </label>
              <select
                value={bookingData.appointmentTypeId}
                onChange={(e) => setBookingData(prev => ({ ...prev, appointmentTypeId: e.target.value, selectedTime: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                disabled={loading}
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>
            
            {/* Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedCalendarDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedCalendarDate(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="font-medium">
                  {selectedCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedCalendarDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedCalendarDate(newDate);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === selectedCalendarDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = bookingData.selectedDate && date.toDateString() === bookingData.selectedDate.toDateString();

                  return (
                  <button
                      key={index}
                    onClick={() => {
                        const newDate = new Date(date);
                        setBookingData(prev => ({ ...prev, selectedDate: newDate, selectedTime: '' }));
                    }}
                      disabled={!isCurrentMonth}
                    className={`w-8 h-8 text-sm rounded ${
                        isSelected
                        ? 'bg-primary text-white'
                          : isToday
                          ? 'bg-blue-100 text-blue-600'
                          : isCurrentMonth
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300'
                      }`}
                    >
                      {date.getDate()}
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Available Slots */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Select Time Slot <span className="text-red-500">*</span>
              </h4>
              {bookingData.selectedDate ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {bookingData.selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {availableSlots.length > 0 && !bookingData.selectedTime && (
                    <p className="text-sm text-primary font-medium mt-1">
                      ⓘ Please select a time slot below
                    </p>
                  )}
                  {bookingData.selectedTime && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      ✓ Selected: {bookingData.selectedTime}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">Please select a date</p>
              )}
              
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setBookingData(prev => ({ ...prev, selectedTime: slot }))}
                    className={`px-3 py-2 text-sm border rounded-md transition-all ${
                      bookingData.selectedTime === slot
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-gray-300 text-gray-700 hover:border-primary hover:bg-primary hover:bg-opacity-10'
                    }`}
                  >
                    {slot}
                  </button>
                  ))
                ) : (
                  <p className="col-span-3 text-sm text-gray-500 text-center py-4">
                    {bookingData.practitionerId && bookingData.selectedDate && bookingData.appointmentTypeId
                      ? 'No schedule available for this date'
                      : 'Select a practitioner, appointment type, and date to see available slots'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Link
            href="/calendar"
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSaveAppointment}
            disabled={saving || loading}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
