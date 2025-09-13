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

// Helper function to get base URL for audio generation
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 
         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
         'https://billdispute.vercel.app';
}

// Helper function to create ElevenLabs audio URL
function createAudioUrl(text: string, voiceId?: string): string {
  const baseUrl = getBaseUrl();
  const encodedText = encodeURIComponent(text);
  const voiceParam = voiceId ? `&voiceId=${encodeURIComponent(voiceId)}` : '';
  return `${baseUrl}/api/audio/generate?text=${encodedText}${voiceParam}`;
}

// Helper function to escape URLs for XML
function escapeXmlUrl(url: string): string {
  return url.replace(/&/g, '&amp;');
}

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
    // Get the base URL - prioritize production URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://billdispute.vercel.app';
    
    // Create TwiML for the call
    const twimlUrl = `${baseUrl}/api/twiml/dispute-call?disputeId=${dispute.id}`;

    console.log(`Using webhook URL: ${twimlUrl}`);

    // Initiate the call
    const call = await twilioClient.calls.create({
      to: dispute.phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      url: twimlUrl,
      statusCallback: `${baseUrl}/api/webhooks/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: true,
      recordingStatusCallback: `${baseUrl}/api/webhooks/recording-status`,
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
  voiceId: string = 'f5HLTX707KIM4SzJYzSz' // Brad voice - https://elevenlabs.io/app/voice-library?voiceId=f5HLTX707KIM4SzJYzSz
): Promise<Buffer> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_turbo_v2_5', // Faster model for lower latency
      voiceSettings: {
        stability: 0.4, // Slightly lower for faster generation
        similarityBoost: 0.4, // Slightly lower for faster generation
        style: 0.2, // Lower style for faster processing
        useSpeakerBoost: false, // Disable for faster processing
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
  confidence: number,
  disputeId?: string
): Promise<string> {
  let session = activeCalls.get(callSid);
  if (!session) {
    console.log(`Call session not found for ${callSid}, creating temporary session`);
    // Create a temporary session if it doesn't exist
    session = {
      disputeId: disputeId || 'temp-dispute',
      callSid: callSid,
      transcript: [],
      isActive: true,
      startTime: new Date(),
      phoneNumber: 'unknown',
    };
    activeCalls.set(callSid, session);
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

    // Get the base URL for webhooks
    const baseUrl = getBaseUrl();

    // Generate ElevenLabs audio URLs
    const mainResponseUrl = createAudioUrl(aiResponse, 'f5HLTX707KIM4SzJYzSz');
    const continuePromptUrl = createAudioUrl('Please continue.', 'f5HLTX707KIM4SzJYzSz');
    const retryPromptUrl = createAudioUrl("I didn't hear anything. Let me try again.", 'f5HLTX707KIM4SzJYzSz');

    // Use ElevenLabs audio with fast response (optimized timeouts)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="3" speechTimeout="1" bargein="true" action="${baseUrl}/api/twiml/process-speech?callSid=${callSid}&amp;disputeId=${session.disputeId}" method="POST">
    <Play>${escapeXmlUrl(mainResponseUrl)}</Play>
    <Play>${escapeXmlUrl(continuePromptUrl)}</Play>
  </Gather>
  <Play>${escapeXmlUrl(retryPromptUrl)}</Play>
  <Redirect>${baseUrl}/api/twiml/dispute-call?disputeId=${session.disputeId}</Redirect>
</Response>`;

    return twiml;
  } catch (error) {
    console.error('Error processing call input:', error);
    
    const errorAudioUrl = createAudioUrl("I'm sorry, I'm having technical difficulties. Let me transfer you to a human representative.", 'f5HLTX707KIM4SzJYzSz');
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXmlUrl(errorAudioUrl)}</Play>
  <Hangup/>
</Response>`;
    
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
