import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { extractBillInfo } from '@/lib/documentProcessor';
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

    // Extract bill information from document
    let billInfo = {
      phoneNumber: null as string | null,
      company: null as string | null,
      amount: null as number | null,
      accountNumber: null as string | null,
    };
    
    try {
      billInfo = await extractBillInfo(filepath, file.type);
      console.log('Extracted bill info:', billInfo);
    } catch (error) {
      console.error('Error extracting bill info:', error);
    }

    // Create dispute record (in a real app, this would be saved to database)
    const disputeId = `dispute-${Date.now()}`;
    const dispute = {
      id: disputeId,
      title: `${billInfo.company || 'Bill'} Dispute - $${billInfo.amount || 'Unknown Amount'}`,
      company: billInfo.company || 'Unknown',
      amount: billInfo.amount || 0,
      phoneNumber: billInfo.phoneNumber || undefined,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      description,
      documentUrl: `/uploads/${filename}`,
      calls: [],
      priority: priority as 'low' | 'medium' | 'high'
    };

    // If we have a phone number, initiate the dispute call
    if (billInfo.phoneNumber) {
      try {
        console.log(`Initiating dispute call to ${billInfo.phoneNumber} for ${billInfo.company}`);
        await initiateDisputeCall(dispute);
      } catch (error) {
        console.error('Error initiating dispute call:', error);
        // Don't fail the upload if call initiation fails
      }
    }

    return NextResponse.json({
      success: true,
      dispute: {
        id: disputeId,
        company: billInfo.company,
        amount: billInfo.amount,
        phoneNumber: billInfo.phoneNumber,
        accountNumber: billInfo.accountNumber,
        description,
        priority,
        callInitiated: !!billInfo.phoneNumber
      },
      message: billInfo.phoneNumber 
        ? `Dispute created successfully! Found ${billInfo.company || 'company'} bill for $${billInfo.amount || 'unknown amount'}. Call initiated to ${billInfo.phoneNumber}.`
        : `Dispute created successfully! Found ${billInfo.company || 'company'} bill for $${billInfo.amount || 'unknown amount'}. No phone number found - manual entry required.`
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
