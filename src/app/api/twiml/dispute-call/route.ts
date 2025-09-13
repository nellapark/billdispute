import { NextRequest, NextResponse } from 'next/server';
import { generateInitialGreeting, setDisputeContext } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get('disputeId');

    if (!disputeId) {
      return new NextResponse('Missing disputeId', { status: 400 });
    }

    // Set dispute context (in a real app, fetch from database)
    setDisputeContext(disputeId, {
      disputeId,
      company: 'Customer Service',
      description: 'Billing dispute',
    });

    // Generate initial greeting
    const greeting = await generateInitialGreeting(disputeId);

    // Create TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${greeting}</Say>
  <Gather input="speech" timeout="10" speechTimeout="auto" action="/api/twiml/process-speech?callSid={CallSid}&amp;disputeId=${disputeId}" method="POST">
    <Say voice="alice">Please hold while I connect you to a representative.</Say>
  </Gather>
  <Say voice="alice">I didn't receive a response. Let me try again.</Say>
  <Redirect>/api/twiml/dispute-call?disputeId=${disputeId}</Redirect>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">I'm sorry, there was an error processing your call. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
