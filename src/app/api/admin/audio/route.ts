import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadToSupabase, generateStorageKey } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/auth-helpers';
import { generateAudioFromScheduler } from '@/lib/audio-generator';
import { sendSlackNotification } from '@/lib/slack-notifications';

async function handleFileUpload(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const categoryId = formData.get('categoryId') as string;
    const publishDate = formData.get('publishDate') as string;
    const audioFile = formData.get('audioFile') as File;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    const description = formData.get('description') as string;
    const script = formData.get('script') as string;
    const duration = formData.get('duration') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    // 오디오 파일 Supabase 업로드
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioKey = generateStorageKey(audioFile.name);
    const audioUrl = await uploadToSupabase(audioBuffer, 'audio', audioKey, audioFile.type);

    // 썸네일 이미지 Supabase 업로드
    let imageUrl = null;
    if (thumbnailFile) {
      const imageBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const imageKey = generateStorageKey(thumbnailFile.name);
      imageUrl = await uploadToSupabase(imageBuffer, 'thumbnails', imageKey, thumbnailFile.type);
    }

    const newAudio = await prisma.audio.create({
      data: {
        title,
        publishDate: new Date(publishDate),
        filePath: audioUrl,
        imageUrl,
        categoryId: parseInt(categoryId),
        description,
        script,
        duration: duration ? parseInt(duration) : null,
      },
    });

    return NextResponse.json(newAudio, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error uploading file' 
    }, { status: 500 });
  }
}

interface SchedulerExecutionBody {
  schedulerId?: number;
  generateFromPrompt?: boolean;
  audioData?: {
    title: string;
    audioBuffer: string | Buffer;
    imageUrl: string | null;
    categoryId: number;
    description: string;
    script: string;
    duration?: number;
  };
}

async function handleSchedulerExecution(body: SchedulerExecutionBody) {
  try {
    const { schedulerId, audioData } = body;

    // If audioData is provided directly, create audio from that data
    if (audioData) {
      const { title, audioBuffer, imageUrl, categoryId, description, script, duration } = audioData;

      // Decode base64 audio buffer if provided as string
      let audioBufferData: Buffer;
      if (typeof audioBuffer === 'string') {
        audioBufferData = Buffer.from(audioBuffer, 'base64');
      } else if (Buffer.isBuffer(audioBuffer)) {
        audioBufferData = audioBuffer;
      } else {
        return NextResponse.json({ error: 'Invalid audio buffer format' }, { status: 400 });
      }

      // Upload audio to Supabase
      const audioKey = generateStorageKey(`${title.replace(/\s+/g, '_')}.mp3`);
      const audioUrl = await uploadToSupabase(audioBufferData, 'audio', audioKey, 'audio/mpeg');

      // Create audio record in database
      const audio = await prisma.audio.create({
        data: {
          title,
          publishDate: new Date(),
          filePath: audioUrl,
          imageUrl,
          categoryId,
          description,
          script,
          duration: duration || null,
        },
      });

      // If schedulerId is provided, create GeneratedAudio record and update scheduler stats
      if (schedulerId) {
        await prisma.generatedAudio.create({
          data: {
            schedulerId,
            audioId: audio.id,
          },
        });

        await prisma.audioScheduler.update({
          where: { id: schedulerId },
          data: {
            lastRunAt: new Date(),
            totalGenerated: {
              increment: 1,
            },
          },
        });
      }

      return NextResponse.json({ 
        message: 'Audio created successfully', 
        audioId: audio.id 
      });
    }

    // Legacy mode: generate audio from scheduler prompt
    if (schedulerId && !audioData) {
      const scheduler = await prisma.audioScheduler.findUnique({
        where: { id: schedulerId },
        include: {
          category: true,
        },
      });

      if (!scheduler) {
        return NextResponse.json({ error: 'Scheduler not found' }, { status: 404 });
      }

      const executionTime = new Date();
      const result = await generateAudioFromScheduler(scheduler);

      // Get audio details for notification
      let audioTitle: string | undefined;
      if (result.success && result.audioId) {
        try {
          const audio = await prisma.audio.findUnique({
            where: { id: result.audioId },
            select: { title: true }
          });
          audioTitle = audio?.title;
        } catch (e) {
          console.warn('Failed to fetch audio title for notification:', e);
        }
      }

      // Send Slack notification for manual execution
      await sendSlackNotification({
        success: result.success,
        schedulerName: `${scheduler.name} (수동 실행)`,
        categoryName: scheduler.category.name,
        audioTitle,
        audioId: result.audioId,
        error: result.error,
        executionTime,
        promptMode: scheduler.promptMode,
        usedTopic: result.usedTopic?.title
      });

      if (result.success) {
        return NextResponse.json({ 
          message: 'Audio generated successfully', 
          audioId: result.audioId 
        });
      } else {
        return NextResponse.json({ 
          error: result.error 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Invalid request: provide either audioData or schedulerId for generation' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error executing scheduler:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error executing scheduler' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  const contentType = req.headers.get('content-type') || '';

  // FormData 방식 (기존 파일 업로드)
  if (contentType.includes('multipart/form-data')) {
    return handleFileUpload(req);
  }

  // JSON 방식 (스케줄러 실행 또는 직접 오디오 데이터 생성)
  if (contentType.includes('application/json')) {
    try {
      const body = await req.json();
      const { generateFromPrompt, audioData } = body;
      
      if (generateFromPrompt || audioData) {
        return handleSchedulerExecution(body);
      } else {
        return NextResponse.json({ 
          error: 'Missing required parameters: either audioData or (schedulerId and generateFromPrompt)' 
        }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ 
        error: 'Invalid JSON body' 
      }, { status: 400 });
    }
  }

  return NextResponse.json({ 
    error: 'Unsupported content type' 
  }, { status: 400 });
}

export async function GET() {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const audios = await prisma.audio.findMany({
      include: {
        category: true,
      },
      orderBy: {
        publishDate: 'desc',
      },
    });
    return NextResponse.json(audios);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching audio data' }, { status: 500 });
  }
}
