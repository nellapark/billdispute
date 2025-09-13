'use client';

import { useState, useEffect } from 'react';
import { Loader2, Phone, FileText, Brain, Mic } from 'lucide-react';

interface LoadingDashboardProps {
  onComplete: () => void;
}

export default function LoadingDashboard({ onComplete }: LoadingDashboardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: FileText, label: 'Analyzing bill document', duration: 2000 },
    { icon: Brain, label: 'Extracting bill details', duration: 1500 },
    { icon: Phone, label: 'Preparing dispute call', duration: 1000 },
    { icon: Mic, label: 'Initiating call connection', duration: 1500 }
  ];

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        setTimeout(onComplete, 500);
        return;
      }

      setCurrentStep(stepIndex);
      setProgress(0);

      // Animate progress for current step
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + (100 / (steps[stepIndex].duration / 50));
        });
      }, 50);

      // Move to next step after duration
      stepTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        startStep(stepIndex + 1);
      }, steps[stepIndex].duration);
    };

    startStep(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Your Dispute
          </h2>
          <p className="text-gray-600">
            Setting up your automated dispute call...
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                
                <div className="flex-1">
                  <div className={`
                    font-medium transition-colors duration-300
                    ${isCompleted 
                      ? 'text-green-600' 
                      : isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                    }
                  `}>
                    {step.label}
                  </div>
                  
                  {isActive && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span>This usually takes 10-15 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
