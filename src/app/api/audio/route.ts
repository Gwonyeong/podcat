import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // 선택된 날짜 (YYYY-MM-DD 형식)

    const whereClause: {
      publishDate: {
        lte: Date;
        gte?: Date;
        lt?: Date;
      };
    } = {
      publishDate: {
        lte: new Date(), // 오늘 날짜 이하만 (미래 오디오 제외)
      },
    };

    // 특정 날짜가 요청된 경우
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.publishDate = {
        gte: selectedDate,
        lt: nextDay,
        lte: new Date(), // 여전히 오늘 이하만
      };
    }

    const audios = await prisma.audio.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        publishDate: "desc",
      },
    });

    return NextResponse.json(audios);
  } catch (error) {
    console.error("Error fetching audios:", error);
    return NextResponse.json(
      { error: "Error fetching audios" },
      { status: 500 }
    );
  }
}
