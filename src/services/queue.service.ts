import Queue from 'bull';
import redis from '../config/redis';
import logger from '../config/logger';
import whatsappService from './whatsapp.service';

interface MessageJob {
  sessionId: string;
  to: string;
  message: string;
  userId: string;
}

const messageQueue = new Queue<MessageJob>('message-queue', {
  createClient: () => redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

messageQueue.process(async (job) => {
  const { sessionId, to, message, userId } = job.data;
  
  logger.info(`Processing message job for session ${sessionId} to ${to}`);
  
  try {
    const result = await whatsappService.sendMessage(sessionId, to, message);
    logger.info(`Message sent successfully via queue for session ${sessionId}`);
    return result;
  } catch (error) {
    logger.error(`Error processing message job:`, error);
    throw error;
  }
});

messageQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

messageQueue.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

export const addMessageToQueue = async (data: MessageJob): Promise<void> => {
  await messageQueue.add(data, {
    delay: 1000, // 1 second delay for rate limiting
  });
  logger.info(`Message added to queue for session ${data.sessionId}`);
};

export const getQueueStats = async () => {
  const waiting = await messageQueue.getWaitingCount();
  const active = await messageQueue.getActiveCount();
  const completed = await messageQueue.getCompletedCount();
  const failed = await messageQueue.getFailedCount();
  
  return {
    waiting,
    active,
    completed,
    failed,
  };
};

export default messageQueue;
