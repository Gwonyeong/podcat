import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAudioFromScheduler } from '@/lib/audio-generator';
import { sendSlackNotification } from '@/lib/slack-notifications';

export async function POST(req: NextRequest) {
  // Simple API key authentication for cron jobs
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find schedulers that should run now
    const schedulers = await prisma.audioScheduler.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: now,
        },
      },
      include: {
        category: true,
      },
    });

    const results = [];
    
    for (const scheduler of schedulers) {
      const executionTime = new Date();
      try {
        const result = await generateAudioFromScheduler(scheduler);
        
        // Get audio details for success notification
        let audioTitle: string | undefined;
        if (result.success && result.audioId) {
          try {
            const audio = await prisma.audio.findUnique({
              where: { id: result.audioId },
              select: { title: true }
            });
            audioTitle = audio?.title;
          } catch (e) {
            console.warn('Failed to fetch audio title for notification:', e);
          }
        }

        // Send Slack notification
        await sendSlackNotification({
          success: result.success,
          schedulerName: scheduler.name,
          categoryName: scheduler.category.name,
          audioTitle,
          audioId: result.audioId,
          error: result.error,
          executionTime,
          promptMode: scheduler.promptMode,
          usedTopic: result.usedTopic?.title
        });

        results.push({
          schedulerId: scheduler.id,
          success: result.success,
          audioId: result.audioId,
          error: result.error,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Send Slack error notification
        await sendSlackNotification({
          success: false,
          schedulerName: scheduler.name,
          categoryName: scheduler.category.name,
          error: errorMessage,
          executionTime,
          promptMode: scheduler.promptMode
        });

        results.push({
          schedulerId: scheduler.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${schedulers.length} schedulers`,
      results,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Cron job failed' 
    }, { status: 500 });
  }
}