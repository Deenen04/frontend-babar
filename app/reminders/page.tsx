'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

type ReminderStatus = 'pending' | 'completed';
type ReminderPriority = 'Low' | 'Medium' | 'High';
type ReminderType = 'Prescription' | 'Callback';

interface Reminder {
  id: string;
  patientName: string;
  priority: ReminderPriority;
  type: ReminderType;
  phoneNumber: string;
  dueDate: string;
  source: string;
  taskDescription: string;
  status: ReminderStatus;
}

const sampleReminders: Reminder[] = [
  {
    id: '1',
    patientName: 'Patient Name',
    priority: 'Low',
    type: 'Prescription',
    phoneNumber: '141-888273',
    dueDate: 'Due Date',
    source: 'Incoming call',
    taskDescription: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    status: 'pending',
  },
  {
    id: '2',
    patientName: 'Patient Name',
    priority: 'Medium',
    type: 'Callback',
    phoneNumber: '141-888273',
    dueDate: 'Due Date',
    source: 'Incoming call',
    taskDescription: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    status: 'pending',
  },
  {
    id: '3',
    patientName: 'Patient Name',
    priority: 'High',
    type: 'Prescription',
    phoneNumber: '141-888273',
    dueDate: 'Due Date',
    source: 'Incoming call',
    taskDescription: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    status: 'pending',
  },
  {
    id: '4',
    patientName: 'Patient Name',
    priority: 'High',
    type: 'Callback',
    phoneNumber: '141-888273',
    dueDate: 'Due Date',
    source: 'Incoming call',
    taskDescription: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    status: 'pending',
  },
  {
    id: '5',
    patientName: 'Patient Name',
    priority: 'Low',
    type: 'Prescription',
    phoneNumber: '141-888273',
    dueDate: 'Due Date',
    source: 'Incoming call',
    taskDescription: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    status: 'completed',
  },
  {
    id: '6',
    patientName: 'Patient Name',
    priority: 'Medium',
    type: 'Callback',
    phoneNumber: '141-888273',
    dueDate: 'Due Date',
    source: 'Incoming call',
    taskDescription: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    status: 'completed',
  },
];

export default function Reminders() {
  const [activeTab, setActiveTab] = useState<ReminderStatus>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Sep 9 - Sep 15, 2025');
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);
  const [expandedReminders, setExpandedReminders] = useState<Set<string>>(new Set());

  const filteredReminders = reminders.filter(reminder => 
    reminder.status === activeTab &&
    (reminder.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     reminder.phoneNumber.includes(searchTerm))
  );

  const handleMoveToCompleted = (reminderId: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, status: 'completed' as ReminderStatus }
          : reminder
      )
    );
  };

  const toggleExpanded = (reminderId: string) => {
    setExpandedReminders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reminderId)) {
        newSet.delete(reminderId);
      } else {
        newSet.add(reminderId);
      }
      return newSet;
    });
  };

  const getPriorityBadgeColor = (priority: ReminderPriority) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: ReminderType) => {
    switch (type) {
      case 'Prescription':
        return 'text-blue-600';
      case 'Callback':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const isExpanded = expandedReminders.has(reminder.id);
    const truncatedDescription = reminder.taskDescription.slice(0, 100) + '...';

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{reminder.patientName}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {reminder.status === 'completed' ? (
              <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-md">
                Completed
              </span>
            ) : (
              <button
                onClick={() => handleMoveToCompleted(reminder.id)}
                className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600"
              >
                Move to Completed
              </button>
            )}
            
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Priority and Type */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(reminder.priority)}`}>
            {reminder.priority}
          </span>
          <span className={`text-sm font-medium ${getTypeColor(reminder.type)}`}>
            Type: {reminder.type}
          </span>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{reminder.phoneNumber}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{reminder.dueDate}</span>
          </div>
          
          <div>
            <span>Source: </span>
            <span className="text-blue-600">{reminder.source}</span>
            <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Task Description */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Task Description</h4>
          <p className="text-sm text-gray-600 mb-2">
            {isExpanded ? reminder.taskDescription : truncatedDescription}
          </p>
          <button
            onClick={() => toggleExpanded(reminder.id)}
            className="text-blue-600 text-sm hover:text-blue-700"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Reminders">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by Name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-900">{dateRange}</span>
            </div>
            
            <button className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Reminders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>

        {filteredReminders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab} reminders found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
