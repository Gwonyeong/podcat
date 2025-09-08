import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAudioFromScheduler } from '@/lib/audio-generator';

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
      try {
        const result = await generateAudioFromScheduler(scheduler);
        results.push({
          schedulerId: scheduler.id,
          success: result.success,
          audioId: result.audioId,
          error: result.error,
        });
      } catch (error) {
        results.push({
          schedulerId: scheduler.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
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