'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function Reminders() {
  return (
    <DashboardLayout title="Reminders">
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reminders Management</h2>
          <p className="text-gray-600">Manage all your patient reminders here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
