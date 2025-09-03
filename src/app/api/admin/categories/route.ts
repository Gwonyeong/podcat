import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToSupabase, generateStorageKey } from "@/lib/supabase";

export async function GET() {
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
  try {
    const data = await req.formData();
    const name = data.get("name") as string;
    const isFree = data.get("isFree") === "true";
    const presenterImageFile = data.get("presenterImage") as File | null;

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
