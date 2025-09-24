'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function CallHistory() {
  return (
    <DashboardLayout title="Call History">
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Call History</h2>
          <p className="text-gray-600">Review all previous calls and transcriptions.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
