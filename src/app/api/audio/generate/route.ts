import { NextRequest, NextResponse } from 'next/server';
import { generateVoiceResponse } from '@/lib/callService';

// In-memory cache for generated audio
const audioCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create cache key
    const cacheKey = `${text}-${voiceId || 'default'}`;
    
    // Check cache first
    const cached = audioCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Serving cached audio for:', text.substring(0, 50) + '...');
      return new NextResponse(cached.buffer as BodyInit, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=300', // 5 minutes
        },
      });
    }

    console.log('Generating ElevenLabs audio for:', text.substring(0, 50) + '...');
    
    // Generate audio with ElevenLabs
    const audioBuffer = await generateVoiceResponse(text, voiceId);
    
    // Cache the result
    audioCache.set(cacheKey, {
      buffer: audioBuffer,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    for (const [key, value] of audioCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_DURATION) {
        audioCache.delete(key);
      }
    }

    return new NextResponse(audioBuffer as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const voiceId = searchParams.get('voiceId');
  
  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  try {
    // Create cache key
    const cacheKey = `${text}-${voiceId || 'default'}`;
    
    // Check cache first
    const cached = audioCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Serving cached audio for:', text.substring(0, 50) + '...');
      return new NextResponse(cached.buffer as BodyInit, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    console.log('Generating ElevenLabs audio for:', text.substring(0, 50) + '...');
    
    // Generate audio with ElevenLabs
    const audioBuffer = await generateVoiceResponse(text, voiceId || undefined);
    
    // Cache the result
    audioCache.set(cacheKey, {
      buffer: audioBuffer,
      timestamp: Date.now()
    });

    return new NextResponse(audioBuffer as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=300',
      },
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' }, 
      { status: 500 }
    );
  }
}
