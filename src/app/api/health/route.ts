import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const status: {
    api: string;
    environment: string | undefined;
    timestamp: string;
    database?: string;
    databaseError?: string;
    prismaClient?: string;
    prismaError?: string;
    categoryCount?: number;
    envVars?: {
      DATABASE_URL: boolean;
      NEXTAUTH_URL: boolean;
      NEXTAUTH_SECRET: boolean;
    };
  } = {
    api: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  // 데이터베이스 연결 체크
  try {
    console.log("Health check: Testing database connection...");
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    status.database = "connected";
    console.log("Health check: Database connected successfully", dbTest);
  } catch (error) {
    console.error("Health check: Database connection failed", error);
    status.database = "error";
    status.databaseError = (error as Error)?.message;
  }

  // Prisma 클라이언트 체크
  try {
    const categoryCount = await prisma.category.count();
    status.prismaClient = "ok";
    status.categoryCount = categoryCount;
  } catch (error) {
    console.error("Health check: Prisma client error", error);
    status.prismaClient = "error";
    status.prismaError = (error as Error)?.message;
  }

  // 환경 변수 체크
  status.envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  const statusCode = status.database === "connected" ? 200 : 500;

  return NextResponse.json(status, { status: statusCode });
}