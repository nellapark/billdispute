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

// In-memory storage for dispute data (in production, use database)
const disputeStorage = new Map<string, BillDispute>();

export function storeDisputeData(dispute: BillDispute): void {
  console.log('=== Storing Dispute Data ===');
  console.log('Dispute ID:', dispute.id);
  console.log('Dispute data:', {
    company: dispute.company,
    customerName: dispute.customerName,
    amount: dispute.amount,
    accountNumber: dispute.accountNumber,
    phoneNumber: dispute.phoneNumber
  });
  disputeStorage.set(dispute.id, dispute);
  console.log('Stored successfully. Storage size:', disputeStorage.size);
  console.log('Storage keys:', Array.from(disputeStorage.keys()));
}

export function getDisputeData(disputeId: string): BillDispute | undefined {
  console.log('=== Retrieving Dispute Data ===');
  console.log('Looking for dispute ID:', disputeId);
  console.log('Storage size:', disputeStorage.size);
  console.log('Available keys:', Array.from(disputeStorage.keys()));
  const data = disputeStorage.get(disputeId);
  console.log('Found data:', !!data);
  if (data) {
    console.log('Retrieved data:', {
      company: data.company,
      customerName: data.customerName,
      amount: data.amount,
      accountNumber: data.accountNumber
    });
  }
  return data;
}

export async function initiateDisputeCall(dispute: BillDispute): Promise<string> {
  if (!dispute.phoneNumber) {
    throw new Error('No phone number available for dispute');
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  // Store dispute data for retrieval in TwiML routes
  storeDisputeData(dispute);

  try {
    // Get the base URL - prioritize production URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://billdispute.vercel.app';
    
    // Create TwiML for the call with encoded dispute data
    const disputeData = encodeURIComponent(JSON.stringify({
      company: dispute.company,
      customerName: dispute.customerName,
      amount: dispute.amount,
      accountNumber: dispute.accountNumber,
      billType: dispute.billType,
      transactionId: dispute.transactionId,
      chargeDate: dispute.chargeDate,
      dueDate: dispute.dueDate,
      billingPeriod: dispute.billingPeriod,
      previousBalance: dispute.previousBalance,
      currentCharges: dispute.currentCharges,
      totalAmount: dispute.totalAmount,
      phoneNumber: dispute.phoneNumber,
      description: dispute.description
    }));
    
    const twimlUrl = `${baseUrl}/api/twiml/dispute-call?disputeId=${dispute.id}&data=${disputeData}`;

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
      modelId: 'eleven_flash_v2_5', // Flash model for ultra-low latency (~75ms)
      voiceSettings: {
        stability: 0.3, // Lower for maximum speed
        similarityBoost: 0.3, // Lower for maximum speed
        style: 0.1, // Minimal style for fastest processing
        useSpeakerBoost: false, // Disabled for speed
      },
      optimizeStreamingLatency: 4, // Maximum streaming optimization
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
  disputeId?: string,
  encodedData?: string
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
    console.log('Starting AI response generation...');
    const aiStartTime = Date.now();
    
    // Generate AI response using Anthropic with parallel audio generation
    const aiResponsePromise = generateDisputeResponse(
      session.transcript.join('\n'),
      session.disputeId
    );

    // Wait for AI response
    const aiResponse = await aiResponsePromise;
    const aiTime = Date.now() - aiStartTime;
    console.log(`AI response generated in ${aiTime}ms: "${aiResponse.substring(0, 50)}..."`);

    // Add AI response to transcript
    session.transcript.push(`AI: ${aiResponse}`);

    // Get the base URL for webhooks
    const baseUrl = getBaseUrl();

    // Pre-generate ElevenLabs audio for immediate playback
    console.log('Starting ElevenLabs audio generation...');
    const audioStartTime = Date.now();
    
    const [mainAudioBuffer, retryAudioBuffer] = await Promise.all([
      generateVoiceResponse(aiResponse, 'f5HLTX707KIM4SzJYzSz'),
      generateVoiceResponse("I didn't hear anything.", 'f5HLTX707KIM4SzJYzSz')
    ]);
    
    const audioTime = Date.now() - audioStartTime;
    console.log(`ElevenLabs audio generated in ${audioTime}ms`);

    // Create URLs for the pre-generated audio
    const mainResponseUrl = createAudioUrl(aiResponse, 'f5HLTX707KIM4SzJYzSz');
    const retryPromptUrl = createAudioUrl("I didn't hear anything.", 'f5HLTX707KIM4SzJYzSz');

    // Optimized: Long timeout for thinking, ultra-short speechTimeout for immediate detection
    const dataParam = encodedData ? `&amp;data=${encodeURIComponent(encodedData)}` : '';
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="5" speechTimeout="0.5" bargein="true" action="${baseUrl}/api/twiml/process-speech?callSid=${callSid}&amp;disputeId=${session.disputeId}${dataParam}" method="POST">
    <Play>${escapeXmlUrl(mainResponseUrl)}</Play>
  </Gather>
  <Play>${escapeXmlUrl(retryPromptUrl)}</Play>
  <Redirect>${baseUrl}/api/twiml/dispute-call?disputeId=${session.disputeId}${dataParam}</Redirect>
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
