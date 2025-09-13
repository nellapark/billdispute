'use client';

import { BillDispute, CallRecord } from '@/types';
import { ArrowLeft, Phone, Clock, CheckCircle, XCircle, AlertTriangle, FileText, DollarSign, Calendar, User } from 'lucide-react';

interface DisputeDetailProps {
  dispute: BillDispute;
  onBack: () => void;
}

const statusIcons = {
  pending: Clock,
  'in-progress': Phone,
  resolved: CheckCircle,
  failed: XCircle,
  escalated: AlertTriangle,
};

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-100 border-yellow-200',
  'in-progress': 'text-blue-600 bg-blue-100 border-blue-200',
  resolved: 'text-green-600 bg-green-100 border-green-200',
  failed: 'text-red-600 bg-red-100 border-red-200',
  escalated: 'text-orange-600 bg-orange-100 border-orange-200',
};

const callStatusColors = {
  completed: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
  'in-progress': 'text-blue-600 bg-blue-100',
  'no-answer': 'text-gray-600 bg-gray-100',
};

const outcomeColors = {
  resolved: 'text-green-600 bg-green-100',
  escalated: 'text-orange-600 bg-orange-100',
  pending: 'text-yellow-600 bg-yellow-100',
  failed: 'text-red-600 bg-red-100',
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function CallRecordCard({ call }: { call: CallRecord }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${callStatusColors[call.status]}`}>
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Call #{call.id.split('-')[1]}
            </p>
            <p className="text-sm text-gray-500">
              {call.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${callStatusColors[call.status]}`}>
            {call.status}
          </div>
          {call.duration > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Duration: {formatDuration(call.duration)}
            </p>
          )}
        </div>
      </div>

      {call.outcome && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Outcome:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${outcomeColors[call.outcome]}`}>
            {call.outcome}
          </span>
        </div>
      )}

      {call.notes && (
        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm text-gray-700">{call.notes}</p>
        </div>
      )}

      {call.transcript && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Call Transcript</span>
          </h4>
          <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {call.transcript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisputeDetail({ dispute, onBack }: DisputeDetailProps) {
  const StatusIcon = statusIcons[dispute.status];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{dispute.title}</h1>
            <p className="text-gray-600 mt-1">{dispute.company}</p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusColors[dispute.status]}`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium capitalize">{dispute.status}</span>
          </div>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-gray-900">${dispute.amount.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold text-gray-900">{dispute.phoneNumber || 'Not extracted'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold text-gray-900">{dispute.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className={`font-semibold capitalize ${
                dispute.priority === 'high' ? 'text-red-600' :
                dispute.priority === 'medium' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {dispute.priority}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Dispute Description</h2>
        <p className="text-gray-700 leading-relaxed">{dispute.description}</p>
        
        {dispute.documentUrl && (
          <div className="mt-4">
            <a
              href={dispute.documentUrl}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4" />
              <span>View Original Document</span>
            </a>
          </div>
        )}
      </div>

      {/* Call History */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Call History</h2>
          <div className="text-sm text-gray-500">
            {dispute.calls.length} call{dispute.calls.length !== 1 ? 's' : ''}
          </div>
        </div>

        {dispute.calls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No calls made yet</p>
            <p className="text-sm mt-1">Calls will appear here once the dispute process begins</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dispute.calls
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((call) => (
                <CallRecordCard key={call.id} call={call} />
              ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t bg-gray-50">
        <div className="flex space-x-3">
          {dispute.status === 'pending' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
              Start Dispute Call
            </button>
          )}
          {dispute.status === 'in-progress' && (
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium">
              Call in Progress...
            </button>
          )}
          {dispute.status === 'failed' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
              Retry Dispute Call
            </button>
          )}
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
