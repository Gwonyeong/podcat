import * as cron from 'node-cron';
import prisma from './prisma';
import { generateAudioFromScheduler, AudioSchedulerWithCategory } from './audio-generator';

let isSchedulerInitialized = false;
const activeTasks = new Map<number, cron.ScheduledTask>();

export async function initializeCronScheduler() {
  if (isSchedulerInitialized) {
    console.log('Cron scheduler already initialized');
    return;
  }

  try {
    console.log('Initializing cron scheduler...');
    
    // Get all active schedulers
    const schedulers = await prisma.audioScheduler.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    // Schedule each active scheduler
    for (const scheduler of schedulers) {
      scheduleTask(scheduler as AudioSchedulerWithCategory);
    }

    isSchedulerInitialized = true;
    console.log(`Cron scheduler initialized with ${schedulers.length} active tasks`);
  } catch (error) {
    console.error('Error initializing cron scheduler:', error);
  }
}

export function scheduleTask(scheduler: AudioSchedulerWithCategory) {
  // Stop existing task if it exists
  const existingTask = activeTasks.get(scheduler.id);
  if (existingTask) {
    existingTask.stop();
    activeTasks.delete(scheduler.id);
  }

  try {
    const task = cron.schedule(scheduler.cronExpression, async () => {
      console.log(`Executing scheduler: ${scheduler.name} (ID: ${scheduler.id})`);
      
      try {
        const result = await generateAudioFromScheduler(scheduler);
        if (result.success) {
          console.log(`Successfully generated audio for scheduler ${scheduler.id}, audio ID: ${result.audioId}`);
        } else {
          console.error(`Failed to generate audio for scheduler ${scheduler.id}:`, result.error);
        }
      } catch (error) {
        console.error(`Error executing scheduler ${scheduler.id}:`, error);
      }
    }, {
      timezone: 'Asia/Seoul',
    });

    activeTasks.set(scheduler.id, task);
    console.log(`Scheduled task for scheduler: ${scheduler.name} (${scheduler.cronExpression})`);
  } catch (error) {
    console.error(`Error scheduling task for scheduler ${scheduler.id}:`, error);
  }
}

export function stopTask(schedulerId: number) {
  const task = activeTasks.get(schedulerId);
  if (task) {
    task.stop();
    activeTasks.delete(schedulerId);
    console.log(`Stopped task for scheduler ${schedulerId}`);
  }
}

export async function refreshScheduler(schedulerId: number) {
  try {
    const scheduler = await prisma.audioScheduler.findUnique({
      where: { id: schedulerId },
      include: {
        category: true,
      },
    });

    if (!scheduler) {
      stopTask(schedulerId);
      return;
    }

    if (scheduler.isActive) {
      scheduleTask(scheduler as AudioSchedulerWithCategory);
    } else {
      stopTask(schedulerId);
    }
  } catch (error) {
    console.error(`Error refreshing scheduler ${schedulerId}:`, error);
  }
}

export function getActiveTasksCount(): number {
  return activeTasks.size;
}

// Initialize scheduler when the module is loaded in production
if (process.env.NODE_ENV === 'production') {
  // Use setTimeout to avoid blocking the module loading
  setTimeout(() => {
    initializeCronScheduler();
  }, 1000);
}