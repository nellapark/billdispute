import { NextRequest, NextResponse } from 'next/server';
import { processCallInput } from '@/lib/callService';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callSid = searchParams.get('callSid');
    const disputeId = searchParams.get('disputeId');

    if (!callSid || !disputeId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Parse form data from Twilio
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = parseFloat(formData.get('Confidence') as string || '0');

    if (!speechResult) {
      // Get the base URL for webhooks
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                     'https://billdispute.vercel.app';

      // No speech detected, ask again
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">I didn't hear anything. Could you please repeat that?</Say>
  <Gather input="speech" timeout="10" speechTimeout="auto" action="${baseUrl}/api/twiml/process-speech?callSid=${callSid}&amp;disputeId=${disputeId}" method="POST">
    <Say voice="alice">Please continue.</Say>
  </Gather>
  <Say voice="alice">I'm having trouble hearing you. Let me transfer you to a human representative.</Say>
  <Hangup/>
</Response>`;

      return new NextResponse(twiml, {
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    // Process the speech input and generate AI response
    const twimlResponse = await processCallInput(callSid, speechResult, confidence);

    return new NextResponse(twimlResponse, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error processing speech:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">I'm sorry, I'm having technical difficulties. Let me transfer you to a human representative.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
