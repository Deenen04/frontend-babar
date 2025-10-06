'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CallDetailsModal from '../../components/CallDetailsModal';
import { DatePicker } from '@/components/ui/date-picker';
import { callsApi, callsUtils, type Call } from '@/lib/api';

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

// Mock call data for MVP
const MOCK_CALLS: CallRecord[] = [
  {
    id: '1',
    patientName: 'John Doe',
    status: 'Answered',
    phoneNo: '555-0123',
    callType: 'Incoming call',
    duration: '12:34',
    date: 'Sep 11 2025',
    hasTranscript: true,
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    status: 'Live',
    phoneNo: '555-0456',
    callType: 'Outgoing call',
    duration: '23:45',
    date: 'Sep 11 2025',
    hasTranscript: false,
  },
  {
    id: '3',
    patientName: 'Bob Wilson',
    status: 'Missed',
    phoneNo: '555-0789',
    callType: 'Incoming call',
    duration: '00:00',
    date: 'Sep 11 2025',
    hasTranscript: false,
  },
  {
    id: '4',
    patientName: 'Alice Johnson',
    status: 'Answered',
    phoneNo: '555-0321',
    callType: 'Incoming call',
    duration: '08:15',
    date: 'Sep 10 2025',
    hasTranscript: true,
  },
  {
    id: '5',
    patientName: 'Charlie Brown',
    status: 'Answered',
    phoneNo: '555-0654',
    callType: 'View Chat',
    duration: '15:22',
    date: 'Sep 10 2025',
    hasTranscript: true,
    isChat: true,
  },
];

export default function CallHistory() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);

  // Load calls from API with filters
  useEffect(() => {
    const loadCalls = async () => {
      setLoading(true);
      setError(null);

      try {
        // Prepare filter parameters
        const params: any = {};

        // Add status filter based on active tab
        if (activeTab !== 'All') {
          if (activeTab === 'Chat') {
            params.status = 'Chat'; // Assuming Chat is a status
          } else {
            params.status = activeTab;
          }
        }

        // Add search filter
        if (searchTerm) {
          params.search = searchTerm;
        }

        // Add date filter
        if (selectedDate) {
          params.start_date = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        // Fetch calls from API with filters
        const apiCalls = await callsApi.getCalls(params);

        // Apply client-side filters for search and date if API doesn't support them
        let filteredCalls = apiCalls;

        if (searchTerm && !params.search) {
          filteredCalls = await callsUtils.searchCalls(searchTerm, filteredCalls);
        }

        if (selectedDate && params.start_date) {
          filteredCalls = await callsUtils.filterCallsByDate(params.start_date, filteredCalls);
        }

        // Convert API format to UI format using the utility function
        const uiCalls = filteredCalls.map(call => callsUtils.formatForDisplay(call));

        setCalls(uiCalls);
        setTotalCalls(uiCalls.length);
      } catch (err) {
        console.error('Error loading calls:', err);
        setError('Failed to load calls. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCalls();
  }, [activeTab, searchTerm, selectedDate]);

  const tabs: TabType[] = ['All', 'Live', 'Answered', 'Chat'];

  // Calls are already filtered by the API, so just return them
  const filteredCalls = calls;

  const getCallTypeDisplay = (call: CallRecord) => {
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

        {/* Header with total calls, search, and date picker */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              Total number of calls <span className="font-semibold text-gray-900">{totalCalls}</span>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by patient name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Filter by date"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
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
                  {[...Array(6)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
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
        )}

        {/* Pagination */}
        {!loading && filteredCalls.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing Calls <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredCalls.length, 7)}</span> of{' '}
              <span className="font-medium">{filteredCalls.length}</span> entries
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
        )}

        {/* Empty State */}
        {!loading && filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-gray-500">
              {activeTab === 'All' ? 'No calls found.' : `No ${activeTab.toLowerCase()} calls found.`}
            </p>
          </div>
        )}
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
