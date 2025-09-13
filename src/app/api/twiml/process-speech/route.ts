import { NextRequest, NextResponse } from 'next/server';
import { processCallInput } from '@/lib/callService';

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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callSid = searchParams.get('callSid');
    const disputeId = searchParams.get('disputeId');
    const encodedData = searchParams.get('data');

    if (!callSid || !disputeId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Parse form data from Twilio
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = parseFloat(formData.get('Confidence') as string || '0');

    if (!speechResult) {
      // Get the base URL for webhooks
      const baseUrl = getBaseUrl();

      // Generate ElevenLabs audio URLs for no speech scenario
      const noSpeechUrl = createAudioUrl("I didn't hear anything. Could you please repeat that?", 'f5HLTX707KIM4SzJYzSz');
      const transferUrl = createAudioUrl("I'm having trouble hearing you. Let me transfer you to a human representative.", 'f5HLTX707KIM4SzJYzSz');

      // No speech detected, ask again with faster response detection
      const dataParam = encodedData ? `&amp;data=${encodeURIComponent(encodedData)}` : '';
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="2" speechTimeout="auto" bargein="true" action="${baseUrl}/api/twiml/process-speech?callSid=${callSid}&amp;disputeId=${disputeId}${dataParam}" method="POST">
    <Play>${escapeXmlUrl(noSpeechUrl)}</Play>
  </Gather>
  <Play>${escapeXmlUrl(transferUrl)}</Play>
  <Hangup/>
</Response>`;

      return new NextResponse(twiml, {
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    console.log(`Processing speech for dispute ${disputeId}: "${speechResult}" (confidence: ${confidence})`);
    
    // Process the speech input and generate AI response with timing
    const startTime = Date.now();
    const twimlResponse = await processCallInput(callSid, speechResult, confidence, disputeId, encodedData || undefined);
    const processingTime = Date.now() - startTime;
    
    console.log(`Generated TwiML response in ${processingTime}ms`);
    console.log('TwiML response:', twimlResponse.substring(0, 200) + '...');

    return new NextResponse(twimlResponse, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error processing speech:', error);
    
    const errorAudioUrl = createAudioUrl("I'm sorry, I'm having technical difficulties. Let me transfer you to a human representative.", 'f5HLTX707KIM4SzJYzSz');
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXmlUrl(errorAudioUrl)}</Play>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
