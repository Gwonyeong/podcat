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

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const filename = `${Date.now()}_${audioFile.name}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const newAudio = await prisma.audio.create({
      data: {
        title,
        publishDate: new Date(publishDate),
        filePath: `/uploads/${filename}`,
        categoryId: parseInt(categoryId),
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
