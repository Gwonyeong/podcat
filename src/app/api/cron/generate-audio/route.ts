import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAudioFromScheduler } from '@/lib/audio-generator';
import { sendSlackNotification } from '@/lib/slack-notifications';
import { calculateNextRunTime } from '@/lib/cron-utils';

export async function GET(req: NextRequest) {
  // Vercel Cron authentication
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Check if it's from Vercel Cron (has specific header) or manual trigger with secret
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Log cron job execution
    console.log(`[CRON] Checking for schedulers to run at ${now.toISOString()}`);
    
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
    
    console.log(`[CRON] Found ${schedulers.length} schedulers to execute`);

    const results = [];
    
    for (const scheduler of schedulers) {
      const executionTime = new Date();
      console.log(`[CRON] Executing scheduler: ${scheduler.name} (ID: ${scheduler.id})`);
      
      try {
        const result = await generateAudioFromScheduler(scheduler);
        
        // Calculate and update next run time
        const nextRunAt = calculateNextRunTime(scheduler.cronExpression, executionTime);
        await prisma.audioScheduler.update({
          where: { id: scheduler.id },
          data: {
            lastRunAt: executionTime,
            nextRunAt: nextRunAt,
            totalGenerated: scheduler.totalGenerated + (result.success ? 1 : 0)
          },
        });

        console.log(`[CRON] Scheduler ${scheduler.id} executed. Next run: ${nextRunAt}`);

        // Check if auto topic generation is needed (only for successful list mode executions)
        if (result.success && scheduler.promptMode === 'list' && scheduler.autoGenerateTopics) {
          try {
            await checkAndGenerateTopics(scheduler.id);
          } catch (autoGenError) {
            console.warn(`[CRON] Failed to auto-generate topics for scheduler ${scheduler.id}:`, autoGenError);
            // Don't fail the entire job for auto-generation errors
          }
        }
        
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
        console.error(`[CRON] Error executing scheduler ${scheduler.id}:`, error);
        
        // Even on error, update next run time to prevent infinite retries
        try {
          const nextRunAt = calculateNextRunTime(scheduler.cronExpression, executionTime);
          await prisma.audioScheduler.update({
            where: { id: scheduler.id },
            data: { 
              lastRunAt: executionTime,
              nextRunAt: nextRunAt
            },
          });
        } catch (updateError) {
          console.error(`[CRON] Failed to update next run time for scheduler ${scheduler.id}:`, updateError);
        }
        
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

    console.log(`[CRON] Completed processing ${schedulers.length} schedulers`);
    
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

async function checkAndGenerateTopics(schedulerId: number) {
  try {
    // Call the auto-generate-topics API endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/scheduler/auto-generate-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schedulerId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Auto-generation API failed: ${errorData.error}`);
    }

    const result = await response.json();

    if (result.generatedTopics) {
      console.log(`[CRON] Auto-generated ${result.generatedTopics.length} topics for scheduler ${schedulerId}`);
    } else {
      console.log(`[CRON] Auto-generation not needed for scheduler ${schedulerId}: ${result.message}`);
    }

  } catch (error) {
    console.error(`[CRON] Error in checkAndGenerateTopics for scheduler ${schedulerId}:`, error);
    throw error;
  }
}