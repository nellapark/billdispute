export interface CallRecord {
  id: string;
  timestamp: Date;
  duration: number; // in seconds
  status: 'completed' | 'failed' | 'in-progress' | 'no-answer';
  transcript?: string;
  outcome?: 'resolved' | 'escalated' | 'pending' | 'failed';
  notes?: string;
}

export interface BillDispute {
  id: string;
  title: string;
  company: string;
  amount: number;
  phoneNumber?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'failed' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
  description: string;
  documentUrl?: string;
  calls: CallRecord[];
  priority: 'low' | 'medium' | 'high';
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface DisputeFormData {
  file: File | null;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
