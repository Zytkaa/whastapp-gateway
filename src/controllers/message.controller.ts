import { Request, Response } from 'express';
import { addMessageToQueue } from '../services/queue.service';
import whatsappService from '../services/whatsapp.service';
import logger from '../config/logger';

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, to, message } = req.body;

    if (!sessionId || !to || !message) {
      res.status(400).json({ error: 'sessionId, to, and message are required' });
      return;
    }

    // Check if session exists
    if (!whatsappService.sessionExists(sessionId)) {
      res.status(404).json({ error: 'Session not found or not connected' });
      return;
    }

    // Add message to queue for rate limiting
    await addMessageToQueue({
      sessionId,
      to,
      message,
      userId,
    });

    res.status(200).json({ 
      message: 'Message queued successfully',
      sessionId,
      to,
    });
  } catch (error: any) {
    logger.error('Send message controller error:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
};

export const sendMessageDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, to, message } = req.body;

    if (!sessionId || !to || !message) {
      res.status(400).json({ error: 'sessionId, to, and message are required' });
      return;
    }

    const result = await whatsappService.sendMessage(sessionId, to, message);
    
    res.status(200).json({ 
      message: 'Message sent successfully',
      result,
    });
  } catch (error: any) {
    logger.error('Send message direct controller error:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
};
