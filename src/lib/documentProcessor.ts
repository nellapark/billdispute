import { readFile } from 'fs/promises';
import * as pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

// Phone number regex patterns
const phonePatterns = [
  /\b1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, // US format
  /\b\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, // International format
  /\b([0-9]{3})[-.]([0-9]{3})[-.]([0-9]{4})\b/g, // Dot/dash format
  /\b\(([0-9]{3})\)\s?([0-9]{3})[-.]([0-9]{4})\b/g, // Parentheses format
];

// Common customer service keywords that often appear near phone numbers
const customerServiceKeywords = [
  'customer service',
  'customer support',
  'support',
  'help',
  'contact',
  'call',
  'phone',
  'toll free',
  'toll-free',
  'questions',
  'billing',
  'account',
  'service',
];

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and has 11 digits, remove the 1
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // If it has 10 digits, format as US number
  if (digits.length === 10) {
    return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return original if can't normalize
}

function extractPhonesFromText(text: string): string[] {
  const phones: string[] = [];
  
  for (const pattern of phonePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      phones.push(match[0]);
    }
  }
  
  return phones.map(normalizePhoneNumber);
}

function findBestPhoneNumber(text: string, phones: string[]): string | null {
  if (phones.length === 0) return null;
  if (phones.length === 1) return phones[0];
  
  const lowerText = text.toLowerCase();
  const phoneScores: { phone: string; score: number }[] = [];
  
  for (const phone of phones) {
    let score = 0;
    const phoneIndex = lowerText.indexOf(phone.replace(/\D/g, ''));
    
    if (phoneIndex === -1) continue;
    
    // Check for customer service keywords near the phone number
    const contextStart = Math.max(0, phoneIndex - 200);
    const contextEnd = Math.min(lowerText.length, phoneIndex + 200);
    const context = lowerText.slice(contextStart, contextEnd);
    
    for (const keyword of customerServiceKeywords) {
      if (context.includes(keyword)) {
        score += keyword === 'customer service' ? 10 : 5;
      }
    }
    
    // Prefer toll-free numbers (800, 888, 877, 866, 855, 844, 833, 822)
    const digits = phone.replace(/\D/g, '');
    const areaCode = digits.slice(-10, -7);
    if (['800', '888', '877', '866', '855', '844', '833', '822'].includes(areaCode)) {
      score += 15;
    }
    
    phoneScores.push({ phone, score });
  }
  
  // Return the phone number with the highest score
  phoneScores.sort((a, b) => b.score - a.score);
  return phoneScores.length > 0 ? phoneScores[0].phone : phones[0];
}

export async function extractPhoneNumber(filePath: string, mimeType: string): Promise<string | null> {
  try {
    let text = '';
    
    if (mimeType === 'application/pdf') {
      // Extract text from PDF
      const buffer = await readFile(filePath);
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (mimeType.startsWith('image/')) {
      // Extract text from image using OCR
      const worker = await createWorker('eng');
      const { data: { text: ocrText } } = await worker.recognize(filePath);
      await worker.terminate();
      text = ocrText;
    } else if (mimeType === 'text/plain') {
      // Read plain text file
      const buffer = await readFile(filePath);
      text = buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
    // Extract phone numbers from text
    const phones = extractPhonesFromText(text);
    
    // Find the best phone number (likely customer service)
    return findBestPhoneNumber(text, phones);
    
  } catch (error) {
    console.error('Error extracting phone number:', error);
    return null;
  }
}

// Additional utility to extract other information from documents
export async function extractBillInfo(filePath: string, mimeType: string): Promise<{
  phoneNumber: string | null;
  company: string | null;
  amount: number | null;
  accountNumber: string | null;
}> {
  try {
    let text = '';
    
    if (mimeType === 'application/pdf') {
      const buffer = await readFile(filePath);
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (mimeType.startsWith('image/')) {
      const worker = await createWorker('eng');
      const { data: { text: ocrText } } = await worker.recognize(filePath);
      await worker.terminate();
      text = ocrText;
    } else if (mimeType === 'text/plain') {
      const buffer = await readFile(filePath);
      text = buffer.toString('utf-8');
    }
    
    const phoneNumber = findBestPhoneNumber(text, extractPhonesFromText(text));
    
    // Extract company name (look for common patterns)
    const companyPatterns = [
      /(?:from|bill from|statement from)\s+([A-Z][A-Za-z\s&]+)/i,
      /^([A-Z][A-Za-z\s&]+)\s+(?:bill|statement|invoice)/im,
    ];
    
    let company: string | null = null;
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        company = match[1].trim();
        break;
      }
    }
    
    // Extract amount (look for currency patterns)
    const amountPatterns = [
      /(?:total|amount due|balance|total due)[\s:$]*(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/g,
    ];
    
    let amount: number | null = null;
    for (const pattern of amountPatterns) {
      const matches = text.matchAll(pattern);
      const amounts = Array.from(matches).map(m => parseFloat(m[1]));
      if (amounts.length > 0) {
        // Take the largest amount found (likely the total)
        amount = Math.max(...amounts);
        break;
      }
    }
    
    // Extract account number
    const accountPatterns = [
      /account\s*(?:number|#)[\s:]*([A-Z0-9-]+)/i,
      /acct\s*(?:number|#)[\s:]*([A-Z0-9-]+)/i,
    ];
    
    let accountNumber: string | null = null;
    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match) {
        accountNumber = match[1].trim();
        break;
      }
    }
    
    return {
      phoneNumber,
      company,
      amount,
      accountNumber,
    };
    
  } catch (error) {
    console.error('Error extracting bill info:', error);
    return {
      phoneNumber: null,
      company: null,
      amount: null,
      accountNumber: null,
    };
  }
}
