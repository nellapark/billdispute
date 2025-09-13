'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, FileText, Clock, User, Building2 } from 'lucide-react';

interface StreamingDashboardProps {
  disputeId?: string;
}

interface Message {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function StreamingDashboard({ disputeId }: StreamingDashboardProps) {
  const [isCallActive, setIsCallActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dummy bill data
  const billData = {
    company: "Charlie's Electric",
    customerName: "Allen Park",
    accountNumber: "876543210",
    amount: 645.22,
    billType: "Electric",
    chargeDate: "August 5, 2025"
  };

  // Dummy conversation responses
  const dummyResponses = [
    { speaker: 'ai' as const, text: "Hello, this is Allen Park calling about my electric bill. My account number is 876543210.", delay: 1000 },
    { speaker: 'user' as const, text: "Hello Mr. Park, I can help you with your account. What seems to be the issue?", delay: 2500 },
    { speaker: 'ai' as const, text: "There's a $645.22 charge from August 5th that looks incorrect. It's much higher than usual.", delay: 2000 },
    { speaker: 'user' as const, text: "I see that charge on your account. Let me look into the billing details for that period.", delay: 3000 },
    { speaker: 'ai' as const, text: "Thank you. My typical monthly bill is around $200, so this seems way off.", delay: 2200 },
    { speaker: 'user' as const, text: "You're right, I can see there was an error in the meter reading. Let me process a credit for you.", delay: 2800 },
    { speaker: 'ai' as const, text: "That's great! How long will it take for the credit to appear on my account?", delay: 1800 },
    { speaker: 'user' as const, text: "The credit will appear within 3-5 business days. Is there anything else I can help you with?", delay: 2500 },
    { speaker: 'ai' as const, text: "No, that covers everything. Thank you for resolving this so quickly!", delay: 1500 }
  ];

  // Simulate streaming conversation
  useEffect(() => {
    let messageIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const addNextMessage = () => {
      if (messageIndex >= dummyResponses.length) {
        setIsCallActive(false);
        return;
      }

      const response = dummyResponses[messageIndex];
      
      // Show typing indicator
      setIsTyping(true);
      
      timeoutId = setTimeout(() => {
        setIsTyping(false);
        
        const newMessage: Message = {
          id: `msg-${messageIndex}`,
          speaker: response.speaker,
          text: response.text,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        messageIndex++;
        
        // Schedule next message
        timeoutId = setTimeout(addNextMessage, response.delay);
      }, 800); // Typing delay
    };

    // Start the conversation after a brief delay
    timeoutId = setTimeout(addNextMessage, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCallActive]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">{billData.company}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{billData.customerName}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-mono text-gray-600">
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${isCallActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
              }
            `}>
              {isCallActive ? 'Call Active' : 'Call Ended'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Bill Details Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Bill Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Account Number
              </label>
              <p className="mt-1 text-sm font-mono text-gray-900">{billData.accountNumber}</p>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Disputed Amount
              </label>
              <p className="mt-1 text-lg font-semibold text-red-600">
                ${billData.amount.toFixed(2)}
              </p>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Bill Type
              </label>
              <p className="mt-1 text-sm text-gray-900">{billData.billType}</p>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Charge Date
              </label>
              <p className="mt-1 text-sm text-gray-900">{billData.chargeDate}</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'ai' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                  ${message.speaker === 'ai'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                  }
                `}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`
                    text-xs mt-1
                    ${message.speaker === 'ai' ? 'text-blue-100' : 'text-gray-500'}
                  `}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Call Controls */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`
                  p-3 rounded-full transition-colors
                  ${isMuted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                disabled={!isCallActive}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleEndCall}
                disabled={!isCallActive}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              
              <button
                className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                disabled={!isCallActive}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {isCallActive 
                  ? 'AI is handling your dispute call automatically' 
                  : 'Call completed successfully'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
