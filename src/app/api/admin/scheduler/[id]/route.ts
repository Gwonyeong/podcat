import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth-helpers';
import * as cron from 'node-cron';
import { refreshScheduler, stopTask } from '@/lib/cron-scheduler';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const scheduler = await prisma.audioScheduler.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        category: true,
        generatedAudios: {
          include: {
            audio: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!scheduler) {
      return NextResponse.json({ error: 'Scheduler not found' }, { status: 404 });
    }

    return NextResponse.json(scheduler);
  } catch (error) {
    console.error('Error fetching scheduler:', error);
    return NextResponse.json({ error: 'Error fetching scheduler' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { 
      name, 
      categoryId, 
      prompt, 
      promptMode,
      usePerplexity,
      perplexitySystemPrompt,
      topicList,
      currentTopicIndex,
      elevenLabsVoiceId, 
      cronExpression, 
      isActive 
    } = body;

    // Validate cron expression if provided
    if (cronExpression && !cron.validate(cronExpression)) {
      return NextResponse.json({ error: 'Invalid cron expression' }, { status: 400 });
    }

    // For now, set nextRunAt to null if cron expression is provided
    let nextRunAt = undefined;
    if (cronExpression) {
      nextRunAt = null;
    }

    const updateData: Record<string, unknown> = {
      ...(name && { name }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(prompt && { prompt }),
      ...(promptMode && { promptMode }),
      ...(usePerplexity !== undefined && { usePerplexity }),
      ...(perplexitySystemPrompt !== undefined && { perplexitySystemPrompt }),
      ...(topicList !== undefined && { topicList }),
      ...(currentTopicIndex !== undefined && { currentTopicIndex }),
      ...(elevenLabsVoiceId && { elevenLabsVoiceId }),
      ...(cronExpression && { cronExpression }),
      ...(isActive !== undefined && { isActive }),
      ...(nextRunAt !== undefined && { nextRunAt }),
    };

    const scheduler = await prisma.audioScheduler.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Refresh the scheduler in cron
    await refreshScheduler(parseInt(params.id));

    return NextResponse.json(scheduler);
  } catch (error) {
    console.error('Error updating scheduler:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error updating scheduler' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    // Stop the cron task before deleting
    stopTask(parseInt(params.id));
    
    await prisma.audioScheduler.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Scheduler deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduler:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error deleting scheduler' 
    }, { status: 500 });
  }
}