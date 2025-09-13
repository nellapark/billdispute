import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DisputeContext {
  disputeId: string;
  company?: string;
  amount?: number;
  description?: string;
  accountNumber?: string;
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
  
  const systemPrompt = `You are an AI assistant helping to dispute a bill charge over the phone. You are speaking directly to a customer service representative.

DISPUTE CONTEXT:
${context ? `
- Company: ${context.company || 'Unknown'}
- Disputed Amount: $${context.amount || 'Unknown'}
- Account Number: ${context.accountNumber || 'Not provided'}
- Issue Description: ${context.description || 'Not provided'}
` : 'Context not available'}

INSTRUCTIONS:
1. Be polite, professional, and persistent
2. Clearly state the issue and why the charge is incorrect
3. Ask for specific actions (refund, credit, removal of charge)
4. Request confirmation numbers and follow-up information
5. If transferred, briefly re-explain the situation
6. Keep responses concise and natural (under 100 words)
7. Don't mention you are an AI - speak as if you are the customer

CONVERSATION FLOW:
- Start by identifying yourself and stating the purpose of your call
- Provide account information when requested
- Explain the disputed charge clearly
- Provide evidence or reasoning for why the charge is incorrect
- Request resolution (refund, credit, etc.)
- Get confirmation and reference numbers

CURRENT CONVERSATION:
${conversationHistory}

Generate your next response as the customer disputing the bill. Be natural and conversational.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      temperature: 0.7,
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
  
  const systemPrompt = `You are calling customer service to dispute a bill charge. Generate a polite, professional opening statement.

DISPUTE CONTEXT:
${context ? `
- Company: ${context.company || 'Unknown'}
- Disputed Amount: $${context.amount || 'Unknown'}
- Issue: ${context.description || 'Incorrect charge on bill'}
` : 'General billing dispute'}

Generate a natural opening statement (under 50 words) that:
1. Greets the representative politely
2. States you're calling about a billing issue
3. Briefly mentions the nature of the dispute

Don't mention you are an AI - speak as the customer.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      temperature: 0.7,
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
      model: 'claude-3-5-sonnet-20241022',
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
      model: 'claude-3-5-sonnet-20241022',
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
