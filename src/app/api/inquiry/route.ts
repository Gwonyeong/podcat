import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { type, subject, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "문의 유형과 내용은 필수입니다." },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: session?.user?.id || null,
        type,
        subject: subject || null,
        content,
        email: session?.user?.email || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "문의가 성공적으로 접수되었습니다.",
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error("Inquiry creation error:", error);
    return NextResponse.json(
      { error: "문의 접수 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: { status?: string; type?: string } = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Inquiry fetch error:", error);
    return NextResponse.json(
      { error: "문의 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
