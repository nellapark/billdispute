'use client';

import { useState } from 'react';
import { BillDispute, CallRecord } from '@/types';
import { ArrowLeft, Phone, Clock, CheckCircle, XCircle, AlertTriangle, FileText, DollarSign, Calendar, User, Maximize2, Download, X } from 'lucide-react';

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

function CallRecordCard({ call, onViewFullTranscript }: { call: CallRecord; onViewFullTranscript: (transcript: string, callId: string) => void }) {
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
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Call Transcript</span>
            </h4>
            <button
              onClick={() => onViewFullTranscript(call.transcript!, call.id)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md text-sm transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Maximize2 className="h-4 w-4 transition-transform duration-150 hover:scale-110" />
              <span>Full Screen</span>
            </button>
          </div>
          <div className="bg-gray-50 rounded p-3 max-h-60 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {call.transcript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Fullscreen Transcript Modal Component
function TranscriptModal({ 
  isOpen, 
  onClose, 
  transcript, 
  callId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  transcript: string; 
  callId: string; 
}) {
  if (!isOpen) return null;

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${callId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Call Transcript - Call #{callId.split('-')[1]}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadTranscript}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4 transition-transform duration-150 hover:scale-110" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
            {transcript}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function DisputeDetail({ dispute, onBack }: DisputeDetailProps) {
  const [fullscreenTranscript, setFullscreenTranscript] = useState<{
    transcript: string;
    callId: string;
  } | null>(null);
  
  const StatusIcon = statusIcons[dispute.status];

  const handleViewFullTranscript = (transcript: string, callId: string) => {
    setFullscreenTranscript({ transcript, callId });
  };

  const closeFullscreenTranscript = () => {
    setFullscreenTranscript(null);
  };

  const downloadReport = () => {
    const reportData = {
      dispute: {
        id: dispute.id,
        title: dispute.title,
        company: dispute.company,
        amount: dispute.amount,
        status: dispute.status,
        priority: dispute.priority,
        createdAt: dispute.createdAt.toISOString(),
        updatedAt: dispute.updatedAt.toISOString(),
        description: dispute.description,
        phoneNumber: dispute.phoneNumber,
      },
      calls: dispute.calls.map(call => ({
        id: call.id,
        timestamp: call.timestamp.toISOString(),
        duration: call.duration,
        status: call.status,
        outcome: call.outcome,
        notes: call.notes,
        transcript: call.transcript,
      })),
      summary: {
        totalCalls: dispute.calls.length,
        totalDuration: dispute.calls.reduce((sum, call) => sum + call.duration, 0),
        lastCallDate: dispute.calls.length > 0 
          ? new Date(Math.max(...dispute.calls.map(call => call.timestamp.getTime()))).toISOString()
          : null,
      }
    };

    const reportText = `
BILL DISPUTE REPORT
==================

Dispute Information:
- ID: ${dispute.id}
- Title: ${dispute.title}
- Company: ${dispute.company}
- Amount: $${dispute.amount.toFixed(2)}
- Status: ${dispute.status}
- Priority: ${dispute.priority}
- Created: ${dispute.createdAt.toLocaleString()}
- Updated: ${dispute.updatedAt.toLocaleString()}
- Phone: ${dispute.phoneNumber || 'Not available'}

Description:
${dispute.description}

Call History (${dispute.calls.length} calls):
${dispute.calls.length === 0 ? 'No calls made yet.' : ''}
${dispute.calls.map((call, index) => `
Call #${index + 1} (${call.id})
- Date: ${call.timestamp.toLocaleString()}
- Duration: ${formatDuration(call.duration)}
- Status: ${call.status}
- Outcome: ${call.outcome || 'N/A'}
- Notes: ${call.notes || 'None'}

Transcript:
${call.transcript || 'No transcript available'}
`).join('\n---\n')}

Summary:
- Total Calls: ${dispute.calls.length}
- Total Call Duration: ${formatDuration(dispute.calls.reduce((sum, call) => sum + call.duration, 0))}
- Report Generated: ${new Date().toLocaleString()}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispute-report-${dispute.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                <CallRecordCard 
                  key={call.id} 
                  call={call} 
                  onViewFullTranscript={handleViewFullTranscript}
                />
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
          <button 
            onClick={downloadReport}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 active:scale-95 font-medium flex items-center space-x-2 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Transcript Modal */}
      <TranscriptModal
        isOpen={!!fullscreenTranscript}
        onClose={closeFullscreenTranscript}
        transcript={fullscreenTranscript?.transcript || ''}
        callId={fullscreenTranscript?.callId || ''}
      />
    </div>
  );
}
