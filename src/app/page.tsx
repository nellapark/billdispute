'use client';

import { useState } from 'react';
import { BillDispute } from '@/types';
import { mockBillDisputes } from '@/data/mockData';
import DisputeDashboard from '@/components/DisputeDashboard';
import DisputeUpload from '@/components/DisputeUpload';
import DisputeDetail from '@/components/DisputeDetail';
import LoadingDashboard from '@/components/LoadingDashboard';
import StreamingDashboard from '@/components/StreamingDashboard';

type ViewState = 'upload' | 'loading' | 'streaming' | 'detail';

export default function Home() {
  const [selectedDispute, setSelectedDispute] = useState<BillDispute | null>(null);
  const [disputes] = useState<BillDispute[]>(mockBillDisputes);
  const [currentView, setCurrentView] = useState<ViewState>('upload');
  const [currentDisputeId, setCurrentDisputeId] = useState<string | null>(null);

  const handleUploadSuccess = (disputeId: string) => {
    setCurrentDisputeId(disputeId);
    setCurrentView('loading');
  };

  const handleLoadingComplete = () => {
    setCurrentView('streaming');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setSelectedDispute(null);
    setCurrentDisputeId(null);
  };

  // Full-screen views
  if (currentView === 'loading') {
    return <LoadingDashboard onComplete={handleLoadingComplete} />;
  }

  if (currentView === 'streaming') {
    return <StreamingDashboard disputeId={currentDisputeId || undefined} />;
  }

  // Original layout for upload and detail views
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
              <DisputeUpload onUploadSuccess={handleUploadSuccess} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
