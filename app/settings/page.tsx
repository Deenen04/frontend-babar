'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function Settings() {
  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
          <p className="text-gray-600">Configure your application settings.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
