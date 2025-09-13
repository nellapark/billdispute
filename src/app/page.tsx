'use client';

import { useState } from 'react';
import { BillDispute } from '@/types';
import { mockBillDisputes } from '@/data/mockData';
import DisputeDashboard from '@/components/DisputeDashboard';
import DisputeUpload from '@/components/DisputeUpload';
import DisputeDetail from '@/components/DisputeDetail';

export default function Home() {
  const [selectedDispute, setSelectedDispute] = useState<BillDispute | null>(null);
  const [disputes] = useState<BillDispute[]>(mockBillDisputes);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Bill Dispute Assistant</h1>
            <div className="text-sm text-gray-500">
              AI-Powered Automated Dispute Resolution
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Dispute Dashboard */}
          <div className="lg:col-span-1">
            <DisputeDashboard
              disputes={disputes}
              selectedDispute={selectedDispute}
              onSelectDispute={setSelectedDispute}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedDispute ? (
              <DisputeDetail
                dispute={selectedDispute}
                onBack={() => setSelectedDispute(null)}
              />
            ) : (
              <DisputeUpload />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
