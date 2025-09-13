import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { extractPhoneNumber } from '@/lib/documentProcessor';
import { initiateDisputeCall } from '@/lib/callService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);

    // Extract phone number from document
    let phoneNumber: string | null = null;
    try {
      phoneNumber = await extractPhoneNumber(filepath, file.type);
    } catch (error) {
      console.error('Error extracting phone number:', error);
    }

    // Create dispute record (in a real app, this would be saved to database)
    const disputeId = `dispute-${Date.now()}`;
    const dispute = {
      id: disputeId,
      title: `Dispute for ${file.name}`,
      company: 'Unknown', // Would be extracted from document
      amount: 0, // Would be extracted from document
      phoneNumber,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      description,
      documentUrl: `/uploads/${filename}`,
      calls: [],
      priority: priority as 'low' | 'medium' | 'high'
    };

    // If we have a phone number, initiate the dispute call
    if (phoneNumber) {
      try {
        await initiateDisputeCall(dispute);
      } catch (error) {
        console.error('Error initiating dispute call:', error);
        // Don't fail the upload if call initiation fails
      }
    }

    return NextResponse.json({
      success: true,
      disputeId,
      phoneNumber,
      message: phoneNumber 
        ? 'Dispute uploaded successfully. Phone number extracted and call initiated.'
        : 'Dispute uploaded successfully. Could not extract phone number - manual entry required.'
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
