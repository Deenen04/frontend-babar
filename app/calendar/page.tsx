'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

type ViewType = 'Day' | 'Week';
type StaffType = 'Doctor' | 'Nurse' | 'Iron Infusion';

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  patient: string;
  type: StaffType;
  day?: number; // for week view
}


const sampleAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Doctor Name',
    startTime: '09:20',
    endTime: '09:40',
    patient: 'Patient Name',
    type: 'Doctor',
  },
  {
    id: '2',
    title: 'Appointment',
    startTime: '09:00',
    endTime: '11:30',
    patient: 'All Patient',
    type: 'Doctor',
    day: 9,
  },
  {
    id: '3',
    title: 'Appointment',
    startTime: '09:00',
    endTime: '11:30',
    patient: 'All Patient',
    type: 'Doctor',
    day: 10,
  },
  {
    id: '4',
    title: 'Appointment',
    startTime: '09:00',
    endTime: '11:30',
    patient: 'All Patient',
    type: 'Doctor',
    day: 12,
  },
  {
    id: '5',
    title: 'Appointment',
    startTime: '09:00',
    endTime: '11:30',
    patient: 'All Patient',
    type: 'Doctor',
    day: 10,
  },
];

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
  const staffTabs: StaffType[] = ['Doctor', 'Nurse', 'Iron Infusion'];

  const weekDays = [
    { short: 'MON', date: 9 },
    { short: 'TUE', date: 10 },
    { short: 'WED', date: 11 },
    { short: 'THU', date: 12 },
    { short: 'FRI', date: 13 },
    { short: 'SAT', date: 14 },
    { short: 'SUN', date: 15 },
  ];


  const DayView = () => (
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
            {/* Sample appointment at specific time */}
            {time === '09:20 AM' && (
              <div className="absolute left-0 right-0 top-2 mx-2">
                <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                  <div className="text-sm font-medium text-blue-900">Doctor Name</div>
                  <div className="flex items-center gap-1 text-xs text-blue-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    09:20 am → 09:40 pm
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Patient Name</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const WeekView = () => (
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
                {/* Sample appointments */}
                {day.date === 9 && timeIndex === 0 && (
                  <div className="bg-blue-100 border border-blue-300 p-2 m-1 rounded text-xs">
                    <div className="font-medium text-blue-900">Appointment</div>
                    <div className="text-blue-700">9:00 - 11:30 AM</div>
                    <select className="text-xs border border-blue-300 rounded mt-1 bg-white">
                      <option>All Patient</option>
                    </select>
                  </div>
                )}
                {day.date === 10 && timeIndex === 1 && (
                  <div className="bg-blue-100 border border-blue-300 p-2 m-1 rounded text-xs">
                    <div className="font-medium text-blue-900">Appointment</div>
                    <div className="text-blue-700">9:00 - 11:30 AM</div>
                    <select className="text-xs border border-blue-300 rounded mt-1 bg-white">
                      <option>All Patient</option>
                    </select>
                  </div>
                )}
                {day.date === 12 && timeIndex === 0 && (
                  <div className="bg-blue-100 border border-blue-300 p-2 m-1 rounded text-xs">
                    <div className="font-medium text-blue-900">Appointment</div>
                    <div className="text-blue-700">9:00 - 11:30 AM</div>
                    <select className="text-xs border border-blue-300 rounded mt-1 bg-white">
                      <option>All Patient</option>
                    </select>
                  </div>
                )}
                {day.date === 10 && timeIndex === 4 && (
                  <div className="bg-blue-100 border border-blue-300 p-2 m-1 rounded text-xs">
                    <div className="font-medium text-blue-900">Appointment</div>
                    <div className="text-blue-700">9:00 - 11:30 AM</div>
                    <select className="text-xs border border-blue-300 rounded mt-1 bg-white">
                      <option>All Patient</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Calendar">
      <div className="space-y-6">
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
          {currentView === 'Day' ? <DayView /> : <WeekView />}
        </div>
      </div>

    </DashboardLayout>
  );
}
