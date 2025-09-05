import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadToSupabase, generateStorageKey } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

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
