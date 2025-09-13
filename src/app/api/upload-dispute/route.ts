import { NextRequest, NextResponse } from 'next/server';
import { extractBillInfoFromBuffer } from '@/lib/documentProcessor';
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

    // Process the file in memory (serverless-friendly)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract bill information from document buffer
    let billInfo = {
      phoneNumber: null as string | null,
      company: null as string | null,
      amount: null as number | null,
      accountNumber: null as string | null,
      customerName: null as string | null,
      billType: null as string | null,
      transactionId: null as string | null,
      chargeDate: null as string | null,
      dueDate: null as string | null,
      billingPeriod: null as string | null,
      previousBalance: null as number | null,
      currentCharges: null as number | null,
      totalAmount: null as number | null,
    };
    
    try {
      billInfo = await extractBillInfoFromBuffer(buffer, file.type, file.name);
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
      documentUrl: `data:${file.type};base64,${buffer.toString('base64').substring(0, 100)}...`, // Truncated for storage
      calls: [],
      priority: priority as 'low' | 'medium' | 'high',
      // Enhanced bill information
      customerName: billInfo.customerName,
      billType: billInfo.billType,
      accountNumber: billInfo.accountNumber,
      transactionId: billInfo.transactionId,
      chargeDate: billInfo.chargeDate,
      dueDate: billInfo.dueDate,
      billingPeriod: billInfo.billingPeriod,
      previousBalance: billInfo.previousBalance,
      currentCharges: billInfo.currentCharges,
      totalAmount: billInfo.totalAmount,
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
