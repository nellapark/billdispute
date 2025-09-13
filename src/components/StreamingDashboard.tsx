'use client';

import { useState, useEffect } from 'react';
import { BillDispute } from '@/types';
import { Phone, PhoneCall, Clock, User, Building, DollarSign, Calendar, Hash, FileText, Loader2 } from 'lucide-react';

interface StreamingDashboardProps {
  dispute: BillDispute;
  onBack: () => void;
}

interface ConversationMessage {
  id: string;
  speaker: 'ai' | 'human';
  message: string;
  timestamp: Date;
}

export default function StreamingDashboard({ dispute, onBack }: StreamingDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'completed'>('connecting');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Dummy conversation data for streaming animation
  const dummyConversation = [
    { speaker: 'ai' as const, message: "Hello, this is Allen Park calling about my electric bill. My account number is 876543210.", delay: 2000 },
    { speaker: 'human' as const, message: "Hello Mr. Park, I can help you with that. What seems to be the issue with your bill?", delay: 3000 },
    { speaker: 'ai' as const, message: "I received my August bill and there's a $645.22 charge that seems incorrect for my usual usage.", delay: 4000 },
    { speaker: 'human' as const, message: "Let me look up your account. I can see the charge from August 5th. Can you tell me more about why you think it's incorrect?", delay: 5000 },
    { speaker: 'ai' as const, message: "My typical monthly bill is around $200-250. This $645 charge is nearly triple my normal usage, and I was out of town for half of July.", delay: 4500 },
    { speaker: 'human' as const, message: "I understand your concern. Let me check the meter readings and usage patterns for that billing period.", delay: 3500 },
    { speaker: 'ai' as const, message: "Thank you. I have my previous bills here if you need to compare the usage history.", delay: 3000 },
    { speaker: 'human' as const, message: "I can see there was an estimated reading in July that may have caused an adjustment. Let me investigate this further and see what we can do to resolve this.", delay: 5000 },
  ];

  useEffect(() => {
    // Initial loading animation
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setCallStatus('active');
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (isLoading || callStatus !== 'active') return;

    let messageIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const addNextMessage = () => {
      if (messageIndex >= dummyConversation.length) {
        setCallStatus('completed');
        return;
      }

      const currentMsg = dummyConversation[messageIndex];
      setIsTyping(true);

      // Simulate typing delay
      const typingDelay = currentMsg.speaker === 'ai' ? 1000 : 1500;
      
      setTimeout(() => {
        const newMessage: ConversationMessage = {
          id: `msg-${messageIndex}`,
          speaker: currentMsg.speaker,
          message: currentMsg.message,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, newMessage]);
        setIsTyping(false);
        messageIndex++;

        // Schedule next message
        timeoutId = setTimeout(addNextMessage, currentMsg.delay);
      }, typingDelay);
    };

    // Start the conversation
    const initialDelay = setTimeout(addNextMessage, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
    };
  }, [isLoading, callStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Phone className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Dispute Process</h2>
          <p className="text-gray-600">Processing your bill and preparing to call {dispute.company}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Live Dispute Call</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                callStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                callStatus === 'active' ? 'bg-green-500 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 capitalize">{callStatus}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Bill Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Company</p>
                    <p className="text-sm text-gray-600">{dispute.company}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer</p>
                    <p className="text-sm text-gray-600">{dispute.customerName || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Number</p>
                    <p className="text-sm text-gray-600 font-mono">{dispute.accountNumber || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Disputed Amount</p>
                    <p className="text-sm text-gray-600 font-semibold">${dispute.amount}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Charge Date</p>
                    <p className="text-sm text-gray-600">{dispute.chargeDate || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bill Type</p>
                    <p className="text-sm text-gray-600">{dispute.billType || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Number</p>
                    <p className="text-sm text-gray-600 font-mono">{dispute.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-2">Issue Description</p>
                <p className="text-sm text-gray-600">{dispute.description}</p>
              </div>
            </div>
          </div>

          {/* Main Content - Streaming Conversation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Call Header */}
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <PhoneCall className="w-8 h-8 text-blue-600" />
                      {callStatus === 'active' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Calling {dispute.company}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {callStatus === 'connecting' && 'Connecting to customer service...'}
                        {callStatus === 'active' && 'Live conversation in progress'}
                        {callStatus === 'completed' && 'Call completed successfully'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Conversation Area */}
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.speaker === 'ai' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.speaker === 'ai'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {msg.speaker === 'ai' ? 'You (AI)' : 'Customer Service'}
                          </span>
                          <span className="text-xs opacity-50">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">Customer service is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Call Status Footer */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        callStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {callStatus === 'connecting' && 'Establishing connection...'}
                        {callStatus === 'active' && 'Call in progress - AI handling dispute'}
                        {callStatus === 'completed' && 'Call completed - Processing results'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Messages: {conversation.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
