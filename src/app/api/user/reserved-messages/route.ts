import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session:", JSON.stringify(session, null, 2));

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reservedMessages = await prisma.reservedMessage.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        reservedTime: "asc",
      },
    });

    return NextResponse.json({ reservedMessages });
  } catch (error) {
    console.error("Error fetching reserved messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, reservedTime } = await request.json();

    if (!message || !reservedTime) {
      return NextResponse.json(
        {
          error: "Message and reserved time are required",
        },
        { status: 400 }
      );
    }

    console.log("Session:", JSON.stringify(session, null, 2));

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reservedMessage = await prisma.reservedMessage.create({
      data: {
        userId: user.id,
        message,
        reservedTime: new Date(reservedTime),
      },
    });

    return NextResponse.json({ reservedMessage });
  } catch (error) {
    console.error("Error creating reserved message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
