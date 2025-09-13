import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;

    console.log(`Recording status update: ${recordingSid} - ${recordingStatus}`);

    if (recordingStatus === 'completed' && recordingUrl) {
      console.log(`Recording completed for call ${callSid}: ${recordingUrl}`);
      
      // In a real application, you would:
      // 1. Download the recording
      // 2. Store it in your database
      // 3. Optionally transcribe it using speech-to-text
      // 4. Update the call record with the recording URL
      
      // For now, just log the information
      console.log({
        callSid,
        recordingSid,
        recordingUrl,
        duration: recordingDuration,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling recording status webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
