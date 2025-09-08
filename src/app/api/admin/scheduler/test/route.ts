import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth-helpers';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function POST(req: NextRequest) {
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { prompt, elevenLabsVoiceId, categoryName } = body;

    if (!prompt || !elevenLabsVoiceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate audio using ElevenLabs API directly
    const audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: prompt,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${audioResponse.status}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    
    // Convert buffer to base64 for client-side playback
    const audioBase64 = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Get thumbnail image from Unsplash (optional, for preview)
    let thumbnailUrl = null;
    if (categoryName) {
      try {
        const result = await unsplash.search.getPhotos({
          query: `${categoryName} podcast microphone`,
          page: 1,
          perPage: 1,
          orientation: 'landscape',
        });

        if (result.response?.results[0]) {
          thumbnailUrl = result.response.results[0].urls.small;
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
        // Continue without thumbnail if Unsplash fails
      }
    }

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      thumbnailUrl,
      duration: Math.floor(audioBuffer.length / 16000), // Approximate duration in seconds
    });

  } catch (error) {
    console.error('Error in test generation:', error);
    
    // Handle specific ElevenLabs errors
    if (error instanceof Error) {
      if (error.message.includes('ElevenLabs API error')) {
        return NextResponse.json({ 
          error: 'ElevenLabs API 오류가 발생했습니다. API 키와 음성 ID를 확인해주세요.' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: `테스트 생성 실패: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: '알 수 없는 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}