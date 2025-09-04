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
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Error fetching category" },
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
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // 카테고리 정보 조회
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        audios: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // 관련된 오디오가 있는지 확인
    if (category.audios.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with existing audios. Please delete all audios first.",
        },
        { status: 400 }
      );
    }

    // 카테고리 삭제
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Error deleting category" },
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
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const data = await req.formData();
    const name = data.get("name") as string;
    const isFree = data.get("isFree") === "true";
    const presenterImageFile = data.get("presenterImage") as File | null;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    let presenterImageUrl: string | undefined | null = existingCategory.presenterImage;

    if (presenterImageFile) {
      const imageBuffer = Buffer.from(await presenterImageFile.arrayBuffer());
      const imageKey = generateStorageKey(presenterImageFile.name);
      presenterImageUrl = await uploadToSupabase(imageBuffer, 'presenter-images', imageKey, presenterImageFile.type);
    }

    // 카테고리 업데이트
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        isFree: Boolean(isFree),
        presenterImage: presenterImageUrl,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating category" },
      { status: 500 }
    );
  }
}
