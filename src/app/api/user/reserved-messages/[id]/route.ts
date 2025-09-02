import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messageId = parseInt(params.id)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const { message, reservedTime, isActive } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 메시지가 해당 사용자의 것인지 확인
    const existingMessage = await prisma.reservedMessage.findFirst({
      where: { 
        id: messageId,
        userId: user.id 
      }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const updatedMessage = await prisma.reservedMessage.update({
      where: { id: messageId },
      data: {
        ...(message !== undefined && { message }),
        ...(reservedTime !== undefined && { reservedTime: new Date(reservedTime) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ reservedMessage: updatedMessage })
  } catch (error) {
    console.error('Error updating reserved message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messageId = parseInt(params.id)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 메시지가 해당 사용자의 것인지 확인
    const existingMessage = await prisma.reservedMessage.findFirst({
      where: { 
        id: messageId,
        userId: user.id 
      }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    await prisma.reservedMessage.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reserved message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}