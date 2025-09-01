import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // 오디오 정보 조회
    const audio = await prisma.audio.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!audio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    // 파일 삭제
    const filePath = path.join(process.cwd(), "public", audio.filePath);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn("File not found for deletion:", filePath);
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const publishDate = formData.get("publishDate") as string;
    const audioFile = formData.get("audioFile") as File | null;

    // 기존 오디오 정보 조회
    const existingAudio = await prisma.audio.findUnique({
      where: { id },
    });

    if (!existingAudio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    let filePath = existingAudio.filePath;

    // 새 파일이 업로드된 경우
    if (audioFile) {
      // 기존 파일 삭제
      const oldFilePath = path.join(
        process.cwd(),
        "public",
        existingAudio.filePath
      );
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.warn("Old file not found for deletion:", oldFilePath);
      }

      // 새 파일 저장
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const filename = `${Date.now()}_${audioFile.name}`;
      const newFilePath = path.join(process.cwd(), "public/uploads", filename);

      await fs.writeFile(newFilePath, buffer);
      filePath = `/uploads/${filename}`;
    }

    // 데이터베이스 업데이트
    const updatedAudio = await prisma.audio.update({
      where: { id },
      data: {
        title,
        publishDate: new Date(publishDate),
        filePath,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedAudio);
  } catch (error) {
    console.error("Error updating audio:", error);
    return NextResponse.json(
      { error: "Error updating audio" },
      { status: 500 }
    );
  }
}
