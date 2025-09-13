'use client';

import { BillDispute } from '@/types';
import { Clock, CheckCircle, XCircle, AlertTriangle, Phone, DollarSign } from 'lucide-react';

interface DisputeDashboardProps {
  disputes: BillDispute[];
  selectedDispute: BillDispute | null;
  onSelectDispute: (dispute: BillDispute | null) => void;
}

// Map all statuses to the 3 main categories
const getSimplifiedStatus = (status: string) => {
  switch (status) {
    case 'pending':
    case 'escalated':
      return 'in-progress';
    case 'resolved':
      return 'resolved';
    case 'failed':
      return 'failed';
    default:
      return 'in-progress';
  }
};

const statusIcons = {
  'in-progress': Phone,
  resolved: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  'in-progress': 'text-blue-600 bg-blue-100',
  resolved: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-red-400',
};

export default function DisputeDashboard({ disputes, selectedDispute, onSelectDispute }: DisputeDashboardProps) {
  const handleDisputeClick = (dispute: BillDispute) => {
    // If clicking on the already selected dispute, unselect it
    if (selectedDispute?.id === dispute.id) {
      onSelectDispute(null);
    } else {
      onSelectDispute(dispute);
    }
  };

  const getStatusCounts = () => {
    return disputes.reduce((acc, dispute) => {
      const simplifiedStatus = getSimplifiedStatus(dispute.status);
      acc[simplifiedStatus] = (acc[simplifiedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="bg-white rounded-lg shadow-sm border h-fit">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Dispute Queue</h2>
        <p className="text-sm text-gray-500 mt-1">{disputes.length} total disputes</p>
      </div>

      {/* Status Legend */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {Object.entries(statusCounts).map(([status, count]) => {
            const Icon = statusIcons[status as keyof typeof statusIcons];
            const colorClass = statusColors[status as keyof typeof statusColors];
            return (
              <div key={status} className={`flex items-center space-x-1 px-2 py-1 rounded ${colorClass} flex-shrink-0`}>
                <Icon className="h-3 w-3" />
                <span className="capitalize font-medium whitespace-nowrap">{status.replace('-', ' ')}</span>
                <span>({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispute List */}
      <div className="max-h-[400px] overflow-y-auto">
        {disputes.map((dispute) => {
          const simplifiedStatus = getSimplifiedStatus(dispute.status);
          const Icon = statusIcons[simplifiedStatus as keyof typeof statusIcons];
          const isSelected = selectedDispute?.id === dispute.id;
          
          return (
            <div
              key={dispute.id}
              onClick={() => handleDisputeClick(dispute)}
              className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
              }`}
            >
              {/* Title and Company */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {dispute.title}
                </h4>
                <p className="text-xs text-gray-500">{dispute.company}</p>
              </div>
              
              {/* Amount and Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-gray-900">
                  ${dispute.amount.toFixed(2)}
                </div>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[simplifiedStatus]}`}>
                  <Icon className="h-3 w-3" />
                  <span className="capitalize">{simplifiedStatus.replace('-', ' ')}</span>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="space-y-2 text-xs text-gray-500">
                {dispute.calls.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{dispute.calls.length} call{dispute.calls.length !== 1 ? 's' : ''} made</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    dispute.priority === 'high' ? 'bg-red-100 text-red-700' :
                    dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {dispute.priority} priority
                  </div>
                  <div>
                    Updated {dispute.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
