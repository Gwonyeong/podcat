import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

const uploadsDir = path.join(process.cwd(), '/public/uploads');

async function ensureUploadsDirExists() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  await ensureUploadsDirExists();

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

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioFilename = `${Date.now()}_${audioFile.name}`;
    const audioFilePath = path.join(uploadsDir, audioFilename);

    await fs.writeFile(audioFilePath, audioBuffer);

    let imageUrl = null;
    if (thumbnailFile) {
      const imageBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const imageFilename = `${Date.now()}_thumb_${thumbnailFile.name}`;
      const imageFilePath = path.join(uploadsDir, imageFilename);
      await fs.writeFile(imageFilePath, imageBuffer);
      imageUrl = `/uploads/${imageFilename}`;
    }

    const newAudio = await prisma.audio.create({
      data: {
        title,
        publishDate: new Date(publishDate),
        filePath: `/uploads/${audioFilename}`,
        imageUrl,
        categoryId: parseInt(categoryId),
        description,
        script,
      },
    });

    return NextResponse.json(newAudio, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
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
