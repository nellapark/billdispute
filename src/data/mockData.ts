import { BillDispute, CallRecord } from '@/types';

const mockCallRecords: CallRecord[] = [
  {
    id: 'call-1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    duration: 420,
    status: 'completed',
    transcript: 'Agent: Hello, this is customer service. How can I help you today?\nAI: Hi, I\'m calling to dispute a charge on my recent bill for $89.99 that appears to be incorrect...\nAgent: I can help you with that. Let me look up your account...',
    outcome: 'resolved',
    notes: 'Successfully disputed the charge. Refund processed.'
  },
  {
    id: 'call-2',
    timestamp: new Date('2024-01-14T14:15:00Z'),
    duration: 180,
    status: 'failed',
    transcript: 'System: Thank you for calling. All our representatives are currently busy...',
    outcome: 'failed',
    notes: 'Call dropped due to long wait time.'
  }
];

const mockCallRecords2: CallRecord[] = [
  {
    id: 'call-3',
    timestamp: new Date('2024-01-16T09:00:00Z'),
    duration: 600,
    status: 'completed',
    transcript: 'Agent: Thank you for calling Telecom Corp. How can I assist you?\nAI: I\'m calling about an unexpected data overage charge of $45 on my bill...',
    outcome: 'escalated',
    notes: 'Escalated to billing department for review.'
  }
];

const mockCallRecords3: CallRecord[] = [
  {
    id: 'call-4',
    timestamp: new Date('2024-01-17T11:30:00Z'),
    duration: 0,
    status: 'in-progress',
    transcript: '',
    outcome: 'pending',
    notes: 'Currently attempting to connect...'
  }
];

export const mockBillDisputes: BillDispute[] = [
  {
    id: 'dispute-1',
    title: 'Internet Service Overcharge',
    company: 'Comcast',
    amount: 89.99,
    phoneNumber: '+1-800-COMCAST',
    status: 'resolved',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T10:50:00Z'),
    description: 'Charged for premium internet package that was never requested or activated.',
    documentUrl: '/uploads/comcast-bill-jan-2024.pdf',
    calls: mockCallRecords,
    priority: 'high'
  },
  {
    id: 'dispute-2',
    title: 'Mobile Data Overage',
    company: 'Verizon',
    amount: 45.00,
    phoneNumber: '+1-800-VERIZON',
    status: 'escalated',
    createdAt: new Date('2024-01-16T07:30:00Z'),
    updatedAt: new Date('2024-01-16T09:30:00Z'),
    description: 'Unexpected data overage charges despite having unlimited plan.',
    documentUrl: '/uploads/verizon-bill-jan-2024.pdf',
    calls: mockCallRecords2,
    priority: 'medium'
  },
  {
    id: 'dispute-3',
    title: 'Cable TV Premium Channels',
    company: 'Spectrum',
    amount: 29.99,
    phoneNumber: '+1-855-SPECTRUM',
    status: 'in-progress',
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T11:30:00Z'),
    description: 'Charged for premium channels that were supposed to be part of promotional package.',
    documentUrl: '/uploads/spectrum-bill-jan-2024.pdf',
    calls: mockCallRecords3,
    priority: 'low'
  },
  {
    id: 'dispute-4',
    title: 'Electric Bill Meter Reading Error',
    company: 'ConEd',
    amount: 156.78,
    phoneNumber: '+1-800-CONED',
    status: 'pending',
    createdAt: new Date('2024-01-18T09:15:00Z'),
    updatedAt: new Date('2024-01-18T09:15:00Z'),
    description: 'Electric bill shows usage that is 3x higher than normal monthly consumption.',
    documentUrl: '/uploads/coned-bill-jan-2024.pdf',
    calls: [],
    priority: 'high'
  },
  {
    id: 'dispute-5',
    title: 'Credit Card Annual Fee',
    company: 'Chase Bank',
    amount: 95.00,
    phoneNumber: '+1-800-CHASE',
    status: 'failed',
    createdAt: new Date('2024-01-12T16:20:00Z'),
    updatedAt: new Date('2024-01-13T10:45:00Z'),
    description: 'Annual fee charged despite being told it would be waived for first year.',
    documentUrl: '/uploads/chase-statement-jan-2024.pdf',
    calls: [
      {
        id: 'call-5',
        timestamp: new Date('2024-01-13T10:00:00Z'),
        duration: 300,
        status: 'completed',
        transcript: 'Agent: I see the annual fee on your account, but according to our records, the fee waiver expired...',
        outcome: 'failed',
        notes: 'Agent refused to waive the fee. No resolution achieved.'
      }
    ],
    priority: 'medium'
  }
];
