'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function Patients() {
  return (
    <DashboardLayout title="Patients">
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Management</h2>
          <p className="text-gray-600">Manage patient information and records.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
