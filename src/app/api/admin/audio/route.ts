import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadToSupabase, generateStorageKey } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const categoryId = formData.get('categoryId') as string;
    const publishDate = formData.get('publishDate') as string;
    const audioFile = formData.get('audioFile') as File;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    const description = formData.get('description') as string;
    const script = formData.get('script') as string;

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
