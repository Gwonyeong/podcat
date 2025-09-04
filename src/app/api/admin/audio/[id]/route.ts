import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToSupabase, generateStorageKey } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const audio = await prisma.audio.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!audio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    return NextResponse.json(audio);
  } catch (error) {
    console.error("Error fetching audio:", error);
    return NextResponse.json(
      { error: "Error fetching audio" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // 오디오 정보 조회
    const audio = await prisma.audio.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!audio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    // Supabase Storage 파일은 별도로 삭제하지 않음 (필요시 Supabase 삭제 함수 추가 가능)
    // 데이터베이스에서 삭제
    await prisma.audio.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Audio deleted successfully" });
  } catch (error) {
    console.error("Error deleting audio:", error);
    return NextResponse.json(
      { error: "Error deleting audio" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const publishDate = formData.get("publishDate") as string;
    const audioFile = formData.get("audioFile") as File | null;
    const thumbnailFile = formData.get("thumbnailFile") as File | null;
    const description = formData.get("description") as string;
    const script = formData.get("script") as string;

    // 기존 오디오 정보 조회
    const existingAudio = await prisma.audio.findUnique({
      where: { id },
    });

    if (!existingAudio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    let filePath = existingAudio.filePath;
    let imageUrl = existingAudio.imageUrl;

    // 새 오디오 파일이 업로드된 경우
    if (audioFile) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const audioKey = generateStorageKey(audioFile.name);
      filePath = await uploadToSupabase(audioBuffer, 'audio', audioKey, audioFile.type);
    }

    // 새 썸네일이 업로드된 경우
    if (thumbnailFile) {
      const imageBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const imageKey = generateStorageKey(thumbnailFile.name);
      imageUrl = await uploadToSupabase(imageBuffer, 'thumbnails', imageKey, thumbnailFile.type);
    }

    // 데이터베이스 업데이트
    const updatedAudio = await prisma.audio.update({
      where: { id },
      data: {
        title,
        publishDate: new Date(publishDate),
        filePath,
        imageUrl,
        categoryId: parseInt(categoryId),
        description,
        script,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedAudio);
  } catch (error) {
    console.error("Error updating audio:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating audio" },
      { status: 500 }
    );
  }
}
