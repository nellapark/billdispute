import { NextRequest, NextResponse } from 'next/server';
import { endCall } from '@/lib/callService';

export async function POST(request: NextRequest) {
  try {
    // Log request details for debugging
    const userAgent = request.headers.get('user-agent') || '';
    const origin = request.headers.get('origin') || '';
    console.log(`Webhook called by: ${userAgent}, Origin: ${origin}`);
    
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const duration = formData.get('CallDuration') as string;

    console.log(`Call status update: ${callSid} - ${callStatus}`);

    // Handle different call statuses
    switch (callStatus) {
      case 'initiated':
        console.log(`Call ${callSid} initiated`);
        break;
      case 'ringing':
        console.log(`Call ${callSid} ringing`);
        break;
      case 'answered':
        console.log(`Call ${callSid} answered`);
        break;
      case 'completed':
      case 'busy':
      case 'no-answer':
      case 'failed':
      case 'canceled':
        console.log(`Call ${callSid} ended with status: ${callStatus}`);
        await endCall(callSid, callStatus);
        break;
      default:
        console.log(`Unknown call status: ${callStatus}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling call status webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
