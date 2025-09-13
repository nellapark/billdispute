'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { DisputeFormData, BillDispute } from '@/types';

interface DisputeUploadProps {
  onDisputeCreated?: (dispute: BillDispute) => void;
}

export default function DisputeUpload({ onDisputeCreated }: DisputeUploadProps) {
  const [formData, setFormData] = useState<DisputeFormData>({
    file: null,
    description: '',
    priority: 'medium'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      setError('Please upload a bill document');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of the dispute');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('priority', formData.priority);

      const response = await fetch('/api/upload-dispute', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload dispute');
      }

      const result = await response.json();
      
      if (onDisputeCreated && result.dispute) {
        // Transition to streaming dashboard
        onDisputeCreated(result.dispute);
      } else {
        // Fallback to success message
        setSuccess('Dispute uploaded successfully! Processing will begin shortly.');
        
        // Reset form
        setFormData({
          file: null,
          description: '',
          priority: 'medium'
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Bill for Dispute
        </h2>
        <p className="text-gray-600">
          Upload your bill document and provide details about the dispute. Our AI will automatically extract the phone number and initiate the dispute call.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bill Document
          </label>
          
          {!formData.file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload your bill'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop your bill, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports PDF, PNG, JPG, TXT (max 10MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{formData.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Dispute Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Describe the issue with your bill. Be specific about what charges you're disputing and why..."
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            <option value="low">Low - Minor issue, not urgent</option>
            <option value="medium">Medium - Standard dispute</option>
            <option value="high">High - Urgent, significant amount</option>
          </select>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
            <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !formData.file || !formData.description.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Start Dispute Process</span>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Upload your bill document (PDF, image, or text)</li>
          <li>2. Our AI extracts the company phone number automatically</li>
          <li>3. AI generates a dispute strategy based on your description</li>
          <li>4. Automated call is placed using natural voice synthesis</li>
          <li>5. Real-time conversation with company representatives</li>
          <li>6. Full transcript and outcome tracking in your dashboard</li>
        </ol>
      </div>
    </div>
  );
}
