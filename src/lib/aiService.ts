import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DisputeContext {
  disputeId: string;
  company?: string | null;
  amount?: number | null;
  description?: string | null;
  accountNumber?: string | null;
  // Enhanced bill information
  customerName?: string | null;
  billType?: string | null;
  transactionId?: string | null;
  chargeDate?: string | null;
  dueDate?: string | null;
  billingPeriod?: string | null;
  previousBalance?: number | null;
  currentCharges?: number | null;
  totalAmount?: number | null;
  phoneNumber?: string | null;
}

// In-memory storage for dispute contexts (in production, use database)
const disputeContexts = new Map<string, DisputeContext>();

export function setDisputeContext(disputeId: string, context: DisputeContext): void {
  disputeContexts.set(disputeId, context);
}

export function getDisputeContext(disputeId: string): DisputeContext | undefined {
  return disputeContexts.get(disputeId);
}

export async function generateDisputeResponse(
  conversationHistory: string,
  disputeId: string
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const context = getDisputeContext(disputeId);
  
  // Debug logging
  console.log('=== AI Response Generation Debug ===');
  console.log('Dispute ID:', disputeId);
  console.log('Context found:', !!context);
  if (context) {
    console.log('Context details:', {
      company: context.company,
      customerName: context.customerName,
      amount: context.amount,
      accountNumber: context.accountNumber,
      chargeDate: context.chargeDate,
      billType: context.billType
    });
  }
  
  const systemPrompt = `You are ${context?.customerName || 'a customer'} calling ${context?.company || 'customer service'} to dispute a charge on your bill. You INITIATED this call because you have a problem with your bill.

YOUR BILL INFORMATION:
${context ? `
- Your Name: ${context.customerName || 'Not provided'}
- Company You're Calling: ${context.company || 'Unknown'}
- Your Account Number: ${context.accountNumber || 'Not provided'}
- Disputed Amount: $${context.amount || 'Unknown'}
- Charge Date: ${context.chargeDate || 'Not provided'}
- Due Date: ${context.dueDate || 'Not provided'}
- Transaction ID: ${context.transactionId || 'Not provided'}
- Bill Type: ${context.billType || 'Unknown'}
- Previous Balance: ${context.previousBalance ? '$' + context.previousBalance : 'Not provided'}
- Current Charges: ${context.currentCharges ? '$' + context.currentCharges : 'Not provided'}
- Total Amount: ${context.totalAmount ? '$' + context.totalAmount : 'Not provided'}
- Your Issue: ${context.description || 'Disputing an incorrect charge'}
` : 'No bill information available'}

CRITICAL INSTRUCTIONS:
1. You ARE the customer who CALLED THEM - you are NOT customer service
2. You HAVE all your bill details already - never ask for account information
3. You called because YOU have a problem with YOUR bill
4. Reference YOUR specific account number, amounts, and dates from above
5. If they ask for your account number, provide it immediately from the context
6. Be assertive about YOUR dispute - you know what's wrong with YOUR bill
7. Keep responses under 50 words but include specific details from YOUR bill
8. Never act like customer service - you are the customer with the complaint
9. ALWAYS provide bill information when asked - share account numbers, amounts, dates, etc.
10. If asked about ANY bill details, immediately provide the specific information from YOUR context
11. Never refuse to give bill information - you are calling about YOUR OWN bill
12. End responses naturally - don't always ask questions or say "please continue"
13. Vary your response style: sometimes make statements, sometimes ask questions, sometimes express frustration
14. Sound like a real person having a conversation, not a scripted response

CURRENT CONVERSATION:
${conversationHistory}

Generate your next response as the customer disputing the bill. Be natural, conversational, and vary your response style. Don't always end with questions or prompts.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Fastest model for ultra-low latency
      max_tokens: 80, // Reduced further for faster generation
      temperature: 0.7, // Optimized for speed and naturalness
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Generate the next response in this bill dispute conversation.'
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    } else {
      throw new Error('Unexpected response type from Anthropic');
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export async function generateInitialGreeting(disputeId: string): Promise<string> {
  const context = getDisputeContext(disputeId);
  
  // Debug logging
  console.log('=== Initial Greeting Generation Debug ===');
  console.log('Dispute ID:', disputeId);
  console.log('Context found:', !!context);
  if (context) {
    console.log('Context details:', {
      company: context.company,
      customerName: context.customerName,
      amount: context.amount,
      accountNumber: context.accountNumber,
      chargeDate: context.chargeDate,
      billType: context.billType
    });
  }
  
  const systemPrompt = `You are ${context?.customerName || 'a customer'} calling ${context?.company || 'customer service'} to dispute a charge on YOUR bill. You initiated this call because YOU have a problem with YOUR bill.

YOUR BILL INFORMATION:
${context ? `
- Your Name: ${context.customerName || 'Not provided'}
- Company You're Calling: ${context.company || 'Unknown'}
- Your Account Number: ${context.accountNumber || 'Not provided'}
- Disputed Amount: $${context.amount || 'Unknown'}
- Charge Date: ${context.chargeDate || 'Not provided'}
- Transaction ID: ${context.transactionId || 'Not provided'}
- Your Issue: ${context.description || 'Disputing an incorrect charge'}
` : 'General billing dispute'}

Generate a natural opening statement (under 50 words) that:
1. Introduce yourself by name if available
2. State you're calling about YOUR bill dispute
3. Provide YOUR account number immediately
4. Mention the specific charge amount and date you're disputing
5. Sound natural and conversational - like a real person calling customer service
6. Don't end with "please continue" or similar prompts

You are the CUSTOMER calling THEM about YOUR problem. Use YOUR specific bill details above.
Be natural and direct - you're frustrated about an incorrect charge on YOUR bill.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Fast model for low latency
      max_tokens: 100, // Reduced for faster generation
      temperature: 0.8, // Slightly higher for more natural responses
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Generate the initial greeting for this dispute call.'
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    } else {
      throw new Error('Unexpected response type from Anthropic');
    }
  } catch (error) {
    console.error('Error generating initial greeting:', error);
    return "Hello, I'm calling about an incorrect charge on my recent bill that I'd like to dispute.";
  }
}

export async function analyzeCallOutcome(transcript: string): Promise<{
  outcome: 'resolved' | 'escalated' | 'pending' | 'failed';
  summary: string;
  nextSteps?: string;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const systemPrompt = `Analyze this customer service call transcript and determine the outcome of a bill dispute.

TRANSCRIPT:
${transcript}

Analyze the conversation and provide:
1. Outcome: resolved, escalated, pending, or failed
2. Summary: Brief description of what happened
3. Next steps: What should be done next (if applicable)

Respond in JSON format:
{
  "outcome": "resolved|escalated|pending|failed",
  "summary": "Brief summary of the call outcome",
  "nextSteps": "What to do next (optional)"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Analyze this call transcript and determine the outcome.'
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text.trim());
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          outcome: 'pending',
          summary: 'Call completed but outcome unclear',
        };
      }
    } else {
      throw new Error('Unexpected response type from Anthropic');
    }
  } catch (error) {
    console.error('Error analyzing call outcome:', error);
    return {
      outcome: 'failed',
      summary: 'Error analyzing call outcome',
    };
  }
}

export async function generateDisputeStrategy(
  description: string,
  amount: number,
  company?: string
): Promise<{
  strategy: string;
  keyPoints: string[];
  expectedChallenges: string[];
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const systemPrompt = `You are an expert in customer service disputes. Generate a strategy for disputing a bill charge.

DISPUTE DETAILS:
- Company: ${company || 'Unknown'}
- Amount: $${amount}
- Description: ${description}

Provide a dispute strategy including:
1. Overall strategy approach
2. Key points to emphasize
3. Expected challenges and how to address them

Respond in JSON format:
{
  "strategy": "Overall approach description",
  "keyPoints": ["point1", "point2", "point3"],
  "expectedChallenges": ["challenge1", "challenge2"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Generate a dispute strategy for this billing issue.'
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text.trim());
      } catch (parseError) {
        console.error('Error parsing strategy response:', parseError);
        return {
          strategy: 'Politely explain the issue and request a refund or credit',
          keyPoints: ['Clearly state the problem', 'Provide specific details', 'Request specific resolution'],
          expectedChallenges: ['Representative may need manager approval', 'May require documentation'],
        };
      }
    } else {
      throw new Error('Unexpected response type from Anthropic');
    }
  } catch (error) {
    console.error('Error generating dispute strategy:', error);
    return {
      strategy: 'Standard dispute approach',
      keyPoints: ['State the issue clearly', 'Request resolution'],
      expectedChallenges: ['May need escalation'],
    };
  }
}
