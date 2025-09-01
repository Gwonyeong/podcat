import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

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

    let presenterImagePath: string | undefined;

    if (presenterImageFile) {
      const bytes = await presenterImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imagePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        `${Date.now()}_${presenterImageFile.name}`
      );
      await writeFile(imagePath, buffer);
      presenterImagePath = `/uploads/${path.basename(imagePath)}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        isFree,
        presenterImage: presenterImagePath,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating category" },
      { status: 500 }
    );
  }
}
