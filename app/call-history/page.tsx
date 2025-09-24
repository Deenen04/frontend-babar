'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CallDetailsModal from '../../components/CallDetailsModal';

type CallStatus = 'Live' | 'Answered' | 'Missed';
type TabType = 'All' | 'Live' | 'Answered' | 'Chat';

interface CallRecord {
  id: string;
  patientName: string;
  status: CallStatus;
  phoneNo: string;
  callType: 'Incoming call' | 'Outgoing call' | 'View Chat';
  duration: string;
  date: string;
  hasTranscript?: boolean;
  isChat?: boolean;
}

const sampleCalls: CallRecord[] = [
  {
    id: '1',
    patientName: 'John Doe',
    status: 'Live',
    phoneNo: '8096676654',
    callType: 'View Chat',
    duration: '-',
    date: '-',
    isChat: true,
  },
  {
    id: '2',
    patientName: 'John Doe',
    status: 'Answered',
    phoneNo: '8096676654',
    callType: 'Incoming call',
    duration: '20 minutes',
    date: '12-sept-2025',
    hasTranscript: true,
  },
  {
    id: '3',
    patientName: 'John Doe',
    status: 'Answered',
    phoneNo: '8096676654',
    callType: 'Outgoing call',
    duration: '23:45',
    date: '12-sept-2025',
    hasTranscript: true,
  },
  {
    id: '4',
    patientName: 'Jane Smith',
    status: 'Answered',
    phoneNo: '8494949490',
    callType: 'Incoming call',
    duration: '15 minutes',
    date: '11-sept-2025',
    hasTranscript: true,
  },
  {
    id: '5',
    patientName: 'Patient Name',
    status: 'Answered',
    phoneNo: '8494949499',
    callType: 'View Chat',
    duration: '-',
    date: '-',
    isChat: true,
  },
  {
    id: '6',
    patientName: 'Alice Johnson',
    status: 'Answered',
    phoneNo: '8096676655',
    callType: 'Outgoing call',
    duration: '18:30',
    date: '10-sept-2025',
    hasTranscript: true,
  },
];

export default function CallHistory() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [currentDate, setCurrentDate] = useState('Sep 11 2025');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const tabs: TabType[] = ['All', 'Live', 'Answered', 'Chat'];

  const getFilteredCalls = (): CallRecord[] => {
    switch (activeTab) {
      case 'Live':
        return sampleCalls.filter(call => call.status === 'Live');
      case 'Answered':
        return sampleCalls.filter(call => call.status === 'Answered');
      case 'Chat':
        return sampleCalls.filter(call => call.isChat);
      default:
        return sampleCalls;
    }
  };

  const filteredCalls = getFilteredCalls();

  const getCallTypeDisplay = (call: CallRecord) => {
    if (call.isChat) {
      return (
        <button className="text-primary hover:text-primary-hover underline">
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

  const getStatusBadge = (status: CallStatus) => {
    const colors = {
      Live: 'bg-red-100 text-red-800',
      Answered: 'bg-gray-100 text-gray-800',
      Missed: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout title="Call History">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Header with total calls and date picker */}
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Total number of calls <span className="font-semibold text-gray-900">30</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-900">{currentDate}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    {activeTab === 'Chat' ? 'Conversation' : 'Call/Whatsapp'}
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
                {filteredCalls.map((call) => (
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
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing Calls <span className="font-medium">1</span> to <span className="font-medium">7</span> of{' '}
            <span className="font-medium">30</span> entries
          </div>
          
          <nav className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button className="px-3 py-1 bg-primary text-white rounded text-sm font-medium">
              1
            </button>
            
            {[2, 3, 4].map((page) => (
              <button
                key={page}
                className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium"
              >
                {page}
              </button>
            ))}
            
            <span className="px-2 text-gray-500">...</span>
            
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium">
              40
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

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
