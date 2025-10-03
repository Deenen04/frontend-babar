'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface BookingData {
  patientName: string;
  contactNumber: string;
  countryCode: string;
  dateOfBirth: string;
  insuranceId: string;
  insuranceProvider: string;
  selectedDate: number | null;
  selectedTime: string;
}

const availableSlots = [
  '10:30am', '11:30am', '02:30pm', '03:00pm', '03:30pm',
  '04:30pm', '05:00pm', '05:30pm'
];

export default function BookAppointment() {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(10);
  const [bookingData, setBookingData] = useState<BookingData>({
    patientName: 'John Doe',
    contactNumber: '',
    countryCode: '+351',
    dateOfBirth: '29 March 2003',
    insuranceId: '',
    insuranceProvider: '',
    selectedDate: 10,
    selectedTime: ''
  });

  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  return (
    <DashboardLayout title="Book Appointment">
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
                value={bookingData.patientName}
                onChange={(e) => setBookingData(prev => ({ ...prev, patientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
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
                >
                  <option value="+351">🇺🇸 +351</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input
                  type="tel"
                  value={bookingData.contactNumber}
                  onChange={(e) => setBookingData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  placeholder="Enter Mobile Number"
                  className="flex-1 px-3 py-2 text-black border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                  onChange={(e) => setBookingData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                onChange={(e) => setBookingData(prev => ({ ...prev, insuranceId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider
              </label>
              <input
                type="text"
                value={bookingData.insuranceProvider}
                onChange={(e) => setBookingData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <button className="text-primary text-sm font-medium hover:text-primary-hover">
              Add New Patient
            </button>
          </div>

          {/* Calendar Section */}
          <div className="w-1/2 p-6 border-l border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date and Time</h3>
            
            {/* Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="font-medium">September 2025</h4>
                <button className="p-1 hover:bg-gray-100 rounded">
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
                {generateCalendarDays().map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      setBookingData(prev => ({ ...prev, selectedDate: day }));
                      setSelectedCalendarDate(day);
                    }}
                    className={`w-8 h-8 text-sm rounded ${
                      selectedCalendarDate === day
                        ? 'bg-primary text-white'
                        : day === 10
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Slots */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Slots</h4>
              <p className="text-sm text-gray-600 mb-4">Thursday, 19th September</p>
              
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setBookingData(prev => ({ ...prev, selectedTime: slot }))}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      bookingData.selectedTime === slot
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Link
            href="/calendar"
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
          <Link
            href="/calendar"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
          >
            Save
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
