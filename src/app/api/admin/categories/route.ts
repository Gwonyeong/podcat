import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToSupabase, generateStorageKey } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth-helpers";

export async function GET() {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Admin 권한 체크
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const data = await req.formData();
    const name = data.get("name") as string;
    const isFree = data.get("isFree") === "true";
    const presenterImageFile = data.get("presenterImage") as File | null;
    const presenterName = data.get("presenterName") as string | null;
    const presenterPersona = data.get("presenterPersona") as string | null;
    const presenterVoiceId = data.get("presenterVoiceId") as string | null;

    let presenterImageUrl: string | undefined;

    if (presenterImageFile) {
      const imageBuffer = Buffer.from(await presenterImageFile.arrayBuffer());
      const imageKey = generateStorageKey(presenterImageFile.name);
      presenterImageUrl = await uploadToSupabase(imageBuffer, 'presenter-images', imageKey, presenterImageFile.type);
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        isFree,
        presenterImage: presenterImageUrl,
        presenterName: presenterName || null,
        presenterPersona: presenterPersona || null,
        presenterVoiceId: presenterVoiceId || null,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating category" },
      { status: 500 }
    );
  }
}
