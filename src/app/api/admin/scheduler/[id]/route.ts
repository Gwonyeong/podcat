import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth-helpers';
import * as cron from 'node-cron';
import { calculateNextRunTime } from '@/lib/cron-utils';

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
      cronExpression,
      publishDateOffset,
      isActive,
      autoGenerateTopics,
      autoGenerateCount,
      topicThreshold
    } = body;

    // Validate cron expression if provided
    if (cronExpression && !cron.validate(cronExpression)) {
      return NextResponse.json({ error: 'Invalid cron expression' }, { status: 400 });
    }

    // Calculate next run time if scheduler is active and cron expression is changed
    let nextRunAt = undefined;
    if (cronExpression && isActive !== false) {
      const calculatedNextRun = calculateNextRunTime(cronExpression);
      if (!calculatedNextRun) {
        console.error('Failed to calculate next run time for cron expression:', cronExpression);
        return NextResponse.json({ 
          error: 'Invalid cron expression - could not calculate next run time' 
        }, { status: 400 });
      }
      nextRunAt = calculatedNextRun;
    } else if (isActive === false) {
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
      ...(cronExpression && { cronExpression }),
      ...(publishDateOffset !== undefined && { publishDateOffset: parseInt(publishDateOffset) || 0 }),
      ...(isActive !== undefined && { isActive }),
      ...(autoGenerateTopics !== undefined && { autoGenerateTopics }),
      ...(autoGenerateCount !== undefined && { autoGenerateCount: parseInt(autoGenerateCount) || 5 }),
      ...(topicThreshold !== undefined && { topicThreshold: parseInt(topicThreshold) || 2 }),
      ...(nextRunAt !== undefined && { nextRunAt }),
    };

    const scheduler = await prisma.audioScheduler.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        category: true,
      },
    });

    // Log scheduler update
    console.log(`Scheduler updated: ${scheduler.name} (ID: ${scheduler.id}), Next run: ${scheduler.nextRunAt}`);

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