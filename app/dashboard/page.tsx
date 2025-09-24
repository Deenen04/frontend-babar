'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function Dashboard() {
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
                    <span className="text-3xl font-bold text-gray-900">770</span>
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
                  <span className="text-3xl font-bold text-gray-900">156</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reminders Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reminders</h2>
            <button className="text-primary text-sm font-medium hover:text-primary-hover">
              See all
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {/* Reminder Item 1 */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">PN</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Patient Name</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Low
                    </span>
                    <span className="text-sm text-blue-600">Type: Prescription</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover">
                View
              </button>
            </div>

            {/* Reminder Item 2 */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">PN</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Patient Name</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Medium
                    </span>
                    <span className="text-sm text-purple-600">Type: Callback</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover">
                View
              </button>
            </div>

            {/* Reminder Item 3 */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">PN</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Patient Name</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Medium
                    </span>
                    <span className="text-sm text-purple-600">Type: Callback</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover">
                View
              </button>
            </div>
          </div>
        </section>

        {/* Live calls Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Live calls</h2>
            <button className="text-primary text-sm font-medium hover:text-primary-hover">
              See all
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {/* Live Call 1 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Patient Name</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Incoming call
                  </span>
                  <span className="text-sm text-gray-500">141-888273</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Transcription</p>
                <p className="text-sm text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                  incididunt ut...
                </p>
              </div>
            </div>

            {/* Live Call 2 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Patient Name</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Incoming call
                  </span>
                  <span className="text-sm text-gray-500">141-888273</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Transcription</p>
                <p className="text-sm text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                  incididunt ut...
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

    </DashboardLayout>
  );
}
