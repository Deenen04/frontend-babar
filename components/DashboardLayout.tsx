'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title={title} />
      
      <main className={`pl-64 pt-16 ${isDashboard ? 'pr-80' : ''}`}>
        <div className="h-screen overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>

      {/* Today's Appointments Sidebar - Only on Dashboard */}
      {isDashboard && (
        <div className="fixed top-16 right-0 w-80 h-screen bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
              <button className="text-primary text-sm font-medium hover:text-primary-hover">
                View All
              </button>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">Member:</label>
              <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option>Doctor</option>
              </select>
            </div>

            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500">
                        {i === 0 ? 'Fri' : 'Sat'}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {i === 0 ? '14' : '15'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dr. Ashton Cleve</p>
                      <p className="text-sm text-gray-500">10:00am - 10:30am</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
