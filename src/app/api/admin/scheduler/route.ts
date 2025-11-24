import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth-helpers';
import * as cron from 'node-cron';
import { calculateNextRunTime } from '@/lib/cron-utils';

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
      cronExpression, 
      publishDateOffset = 0,
      isActive 
    } = body;

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      return NextResponse.json({ error: 'Invalid cron expression' }, { status: 400 });
    }

    // Calculate next run time if scheduler is active
    const nextRunAt = isActive ? calculateNextRunTime(cronExpression) : null;
    
    if (isActive && !nextRunAt) {
      console.error('Failed to calculate next run time for cron expression:', cronExpression);
      return NextResponse.json({ 
        error: 'Invalid cron expression - could not calculate next run time' 
      }, { status: 400 });
    }

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
        cronExpression,
        publishDateOffset: parseInt(publishDateOffset) || 0,
        isActive: isActive ?? true,
        nextRunAt: nextRunAt,
      },
      include: {
        category: true,
      },
    });

    // Log scheduler creation
    console.log(`Scheduler created: ${scheduler.name} (ID: ${scheduler.id}), Next run: ${scheduler.nextRunAt}`);

    return NextResponse.json(scheduler, { status: 201 });
  } catch (error) {
    console.error('Error creating scheduler:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error creating scheduler' 
    }, { status: 500 });
  }
}