'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { dashboardApi, type DashboardResponse, type TodayAppointment, type DashboardReminder, type LiveCall } from '@/lib/api/dashboard';
import { callsApi, callsUtils, type Call, type CallResponse } from '@/lib/api/calls';
import CallDetailsModal from '@/components/CallDetailsModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReminder, setSelectedReminder] = useState<DashboardReminder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState<boolean>(true);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchCallHistory();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data using single API call
      const data = await dashboardApi.getDashboard();
      setDashboardData(data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallHistory = async () => {
    try {
      setCallHistoryLoading(true);
      
      // Fetch recent call history (last 10 calls)
      const response: CallResponse = await callsApi.getCalls({ page: 1, limit: 10 });
      
      // Convert API format to UI format
      const uiCalls = response.results.map((call: Call) => callsUtils.formatForDisplay(call));
      setCallHistory(uiCalls);
      
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setCallHistoryLoading(false);
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

  const handleViewReminder = (reminder: DashboardReminder) => {
    setSelectedReminder(reminder);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReminder(null);
  };

  const getCallTypeDisplay = (call: any) => {
    if (call.isChat) {
      return (
        <button 
          className="text-primary hover:text-primary-hover underline"
          onClick={() => setSelectedCall(call)}
        >
          View Chat
        </button>
      );
    }
    
    const isIncoming = call.callType === 'Incoming call';
    const isOutgoing = call.callType === 'Outgoing call';
    
    return (
      <button 
        className={`text-sm flex items-center gap-1 ${
          isIncoming ? 'text-green-600' : isOutgoing ? 'text-blue-600' : 'text-primary'
        } hover:opacity-75`}
        onClick={() => setSelectedCall(call)}
      >
        {call.callType}
        {(isIncoming || isOutgoing) && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={isIncoming ? "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" : 
                     "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"} />
          </svg>
        )}
      </button>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Live: 'bg-red-100 text-red-800',
      Answered: 'bg-gray-100 text-gray-800',
      Missed: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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
                    <span className="text-3xl font-bold text-gray-900">{dashboardData ? parseFloat(dashboardData.overview.total_calling_minutes).toLocaleString() : 0}</span>
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
                  <span className="text-3xl font-bold text-gray-900">{dashboardData ? dashboardData.overview.appointments_booked_by_ai : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reminders Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reminders</h2>
            <Link href="/reminders">
              <button className="text-primary text-sm font-medium hover:text-primary-hover cursor-pointer">
                See all
              </button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {(!dashboardData || dashboardData.reminders.length === 0) ? (
              <div className="p-4 text-center text-gray-500">
                No reminders found
              </div>
            ) : (
              dashboardData.reminders.map((reminder, index) => (
                <div key={`${reminder.patient_phone}-${index}`} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {reminder.patient_phone.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reminder.reminder_type} for {reminder.patient_phone}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        <span className={`text-sm ${getReminderTypeColor(reminder.reminder_type)}`}>
                          Type: {reminder.reminder_type}
                        </span>
                        {(reminder.due_date !== 'None' && reminder.due_time !== 'None') && (
                          <span className="text-sm text-gray-500">
                            Due: {reminder.due_date} {reminder.due_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewReminder(reminder)}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Call History Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Call History</h2>
            <Link href="/call-history">
              <button className="text-primary text-sm font-medium hover:text-primary-hover cursor-pointer">
                See all
              </button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {callHistoryLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Loading call history...
              </div>
            ) : callHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No call history found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Call Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {callHistory.map((call) => (
                      <tr key={call.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {call.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {call.status === 'Live' ? (
                            <span className="text-red-600 font-medium text-sm">Live</span>
                          ) : (
                            getStatusBadge(call.status)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.phoneNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getCallTypeDisplay(call)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.duration === '23:45' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              {call.duration}
                            </div>
                          ) : (
                            call.duration
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {call.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Reminder Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Reminder Details
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Complete information about this reminder
            </DialogDescription>
          </DialogHeader>

          {selectedReminder && (
            <div className="space-y-6 mt-4">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Patient Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone Number:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedReminder.patient_phone}</span>
                  </div>
                </div>
              </div>

              {/* Reminder Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reminder Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className={`text-sm font-medium ${getReminderTypeColor(selectedReminder.reminder_type)}`}>
                      {selectedReminder.reminder_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedReminder.priority)}`}>
                      {selectedReminder.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedReminder.status}</span>
                  </div>
                </div>
              </div>

              {/* Due Date & Time */}
              {(selectedReminder.due_date !== 'None' || selectedReminder.due_time !== 'None') && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule
                  </h3>
                  <div className="space-y-2">
                    {selectedReminder.due_date !== 'None' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Due Date:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedReminder.due_date}</span>
                      </div>
                    )}
                    {selectedReminder.due_time !== 'None' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Due Time:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedReminder.due_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <Link href="/reminders">
                  <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover">
                    View All Reminders
                  </button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Details Modal */}
      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}

    </DashboardLayout>
  );
}
