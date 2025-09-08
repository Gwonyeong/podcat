import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth-helpers';
import * as cron from 'node-cron';
import { scheduleTask } from '@/lib/cron-scheduler';

export async function GET() {
  const authResult = await checkAdminAuth();
  if (!authResult.authorized && authResult.response) {
    return authResult.response;
  }

  try {
    const schedulers = await prisma.audioScheduler.findMany({
      include: {
        category: true,
        generatedAudios: {
          include: {
            audio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(schedulers);
  } catch (error) {
    console.error('Error fetching schedulers:', error);
    return NextResponse.json({ error: 'Error fetching schedulers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
      promptMode = 'single',
      usePerplexity = false,
      perplexitySystemPrompt,
      topicList,
      elevenLabsVoiceId, 
      cronExpression, 
      isActive 
    } = body;

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      return NextResponse.json({ error: 'Invalid cron expression' }, { status: 400 });
    }

    // For now, set nextRunAt to null - it will be calculated by the cron scheduler
    const nextRunAt = null;

    const scheduler = await prisma.audioScheduler.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        prompt,
        promptMode,
        usePerplexity,
        perplexitySystemPrompt,
        topicList: topicList ? topicList : null,
        currentTopicIndex: 0,
        elevenLabsVoiceId,
        cronExpression,
        isActive: isActive ?? true,
        nextRunAt: nextRunAt,
      },
      include: {
        category: true,
      },
    });

    // Schedule the task if it's active
    if (scheduler.isActive) {
      scheduleTask(scheduler);
    }

    return NextResponse.json(scheduler, { status: 201 });
  } catch (error) {
    console.error('Error creating scheduler:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error creating scheduler' 
    }, { status: 500 });
  }
}