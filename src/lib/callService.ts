import twilio from 'twilio';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { BillDispute, CallRecord } from '@/types';
import { generateDisputeResponse } from './aiService';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize ElevenLabs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

interface CallSession {
  disputeId: string;
  callSid: string;
  transcript: string[];
  isActive: boolean;
  startTime: Date;
  phoneNumber: string;
}

// In-memory storage for active call sessions (in production, use Redis or database)
const activeCalls = new Map<string, CallSession>();

export async function initiateDisputeCall(dispute: BillDispute): Promise<string> {
  if (!dispute.phoneNumber) {
    throw new Error('No phone number available for dispute');
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  try {
    // Create TwiML for the call
    const twimlUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/twiml/dispute-call?disputeId=${dispute.id}`;

    // Initiate the call
    const call = await twilioClient.calls.create({
      to: dispute.phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      url: twimlUrl,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: true,
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/recording-status`,
    });

    // Store call session
    const session: CallSession = {
      disputeId: dispute.id,
      callSid: call.sid,
      transcript: [],
      isActive: true,
      startTime: new Date(),
      phoneNumber: dispute.phoneNumber,
    };

    activeCalls.set(call.sid, session);

    console.log(`Initiated dispute call for ${dispute.id}, Call SID: ${call.sid}`);
    return call.sid;

  } catch (error) {
    console.error('Error initiating dispute call:', error);
    throw error;
  }
}

export async function handleIncomingCall(callSid: string, from: string, to: string): Promise<string> {
  // This would handle incoming calls if needed
  // For now, we're only making outbound calls
  return `
    <Response>
      <Say voice="alice">Thank you for calling. This is an automated dispute system.</Say>
      <Hangup/>
    </Response>
  `;
}

export async function generateVoiceResponse(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL' // Default Bella voice
): Promise<Buffer> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_multilingual_v2',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.5,
      },
    });

    // Convert ReadableStream to Buffer
    const chunks: Buffer[] = [];
    const reader = audio.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error generating voice response:', error);
    throw error;
  }
}

export async function processCallInput(
  callSid: string,
  speechResult: string,
  confidence: number
): Promise<string> {
  const session = activeCalls.get(callSid);
  if (!session) {
    throw new Error('Call session not found');
  }

  // Add user input to transcript
  session.transcript.push(`Human: ${speechResult}`);

  try {
    // Generate AI response using Anthropic
    const aiResponse = await generateDisputeResponse(
      session.transcript.join('\n'),
      session.disputeId
    );

    // Add AI response to transcript
    session.transcript.push(`AI: ${aiResponse}`);

    // Generate TwiML response with the AI text
    const twiml = `
      <Response>
        <Say voice="alice">${aiResponse}</Say>
        <Gather input="speech" timeout="10" speechTimeout="auto" action="/api/twiml/process-speech?callSid=${callSid}" method="POST">
          <Say voice="alice">Please continue.</Say>
        </Gather>
        <Say voice="alice">I didn't hear anything. Let me try again.</Say>
        <Redirect>/api/twiml/dispute-call?disputeId=${session.disputeId}</Redirect>
      </Response>
    `;

    return twiml;
  } catch (error) {
    console.error('Error processing call input:', error);
    
    const errorResponse = `
      <Response>
        <Say voice="alice">I'm sorry, I'm having technical difficulties. Let me transfer you to a human representative.</Say>
        <Hangup/>
      </Response>
    `;
    
    return errorResponse;
  }
}

export async function endCall(callSid: string, status: string): Promise<void> {
  const session = activeCalls.get(callSid);
  if (!session) {
    return;
  }

  session.isActive = false;
  
  // Create call record
  const callRecord: CallRecord = {
    id: `call-${Date.now()}`,
    timestamp: session.startTime,
    duration: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
    status: status === 'completed' ? 'completed' : 'failed',
    transcript: session.transcript.join('\n'),
    outcome: 'pending', // Would be determined by AI analysis
    notes: `Call ${status} at ${new Date().toISOString()}`,
  };

  // In a real app, save this to database
  console.log('Call ended:', callRecord);

  // Clean up session
  activeCalls.delete(callSid);
}

export function getActiveCallSession(callSid: string): CallSession | undefined {
  return activeCalls.get(callSid);
}

export function getAllActiveCalls(): CallSession[] {
  return Array.from(activeCalls.values());
}
