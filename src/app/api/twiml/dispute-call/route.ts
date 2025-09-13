import { NextRequest, NextResponse } from 'next/server';
import { generateInitialGreeting, setDisputeContext } from '@/lib/aiService';
import { getDisputeData } from '@/lib/callService';

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
    const disputeId = searchParams.get('disputeId');

    if (!disputeId) {
      return new NextResponse('Missing disputeId', { status: 400 });
    }

    // Get CallSid from the request body
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;

    if (!callSid) {
      return new NextResponse('Missing CallSid', { status: 400 });
    }

    console.log(`TwiML requested for dispute ${disputeId}, call ${callSid}`);

    // Get comprehensive dispute data from URL parameters (serverless-friendly)
    const encodedData = searchParams.get('data');
    let disputeData = null;
    
    console.log('=== TwiML Dispute Context Debug ===');
    console.log('Dispute ID:', disputeId);
    console.log('Encoded data present:', !!encodedData);
    
    if (encodedData) {
      try {
        disputeData = JSON.parse(decodeURIComponent(encodedData));
        console.log('Parsed dispute data:', {
          company: disputeData.company,
          customerName: disputeData.customerName,
          amount: disputeData.amount,
          accountNumber: disputeData.accountNumber,
          billType: disputeData.billType,
          chargeDate: disputeData.chargeDate,
          transactionId: disputeData.transactionId
        });
      } catch (error) {
        console.error('Failed to parse dispute data from URL:', error);
      }
    }
    
    // Fallback: try in-memory storage
    if (!disputeData) {
      console.log('No URL data, trying in-memory storage...');
      disputeData = getDisputeData(disputeId);
      console.log('In-memory data found:', !!disputeData);
    }
    
    if (disputeData) {
      // Set comprehensive dispute context for AI
      const contextData = {
        disputeId,
        company: disputeData.company,
        amount: disputeData.amount,
        description: disputeData.description,
        accountNumber: disputeData.accountNumber,
        customerName: disputeData.customerName,
        billType: disputeData.billType,
        transactionId: disputeData.transactionId,
        chargeDate: disputeData.chargeDate,
        dueDate: disputeData.dueDate,
        billingPeriod: disputeData.billingPeriod,
        previousBalance: disputeData.previousBalance,
        currentCharges: disputeData.currentCharges,
        totalAmount: disputeData.totalAmount,
        phoneNumber: disputeData.phoneNumber,
      };
      
      console.log('Setting context data:', contextData);
      setDisputeContext(disputeId, contextData);
    } else {
      console.log('No dispute data found anywhere, using fallback context');
      // Fallback context
      setDisputeContext(disputeId, {
        disputeId,
        company: 'Customer Service',
        description: 'Billing dispute',
      });
    }

    // Get the base URL for webhooks
    const baseUrl = getBaseUrl();

    // Generate initial greeting
    const greeting = await generateInitialGreeting(disputeId);

    // Generate ElevenLabs audio URLs
    const greetingAudioUrl = createAudioUrl(greeting, 'f5HLTX707KIM4SzJYzSz');
    const retryAudioUrl = createAudioUrl("I didn't receive a response. Let me try again.", 'f5HLTX707KIM4SzJYzSz');

    // Create TwiML response with fast response times for initial greeting
    const dataParam = encodedData ? `&amp;data=${encodeURIComponent(encodedData)}` : '';
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="3" speechTimeout="1" bargein="true" action="${baseUrl}/api/twiml/process-speech?callSid=${callSid}&amp;disputeId=${disputeId}${dataParam}" method="POST">
    <Play>${escapeXmlUrl(greetingAudioUrl)}</Play>
  </Gather>
  <Play>${escapeXmlUrl(retryAudioUrl)}</Play>
  <Redirect>${baseUrl}/api/twiml/dispute-call?disputeId=${disputeId}${dataParam}</Redirect>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    
    const errorAudioUrl = createAudioUrl("I'm sorry, there was an error processing your call. Please try again later.", 'f5HLTX707KIM4SzJYzSz');
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
