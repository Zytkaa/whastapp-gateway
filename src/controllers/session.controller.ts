import { Request, Response } from 'express';
import sessionService from '../services/session.service';
import logger from '../config/logger';
import { sanitizeSessionId } from '../utils/validation';

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, name } = req.body;

    if (!sessionId || !name) {
      res.status(400).json({ error: 'sessionId and name are required' });
      return;
    }

    // Validate session ID format
    try {
      sanitizeSessionId(sessionId);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
      return;
    }

    const session = await sessionService.createSession(userId, sessionId, name);
    res.status(201).json(session);
  } catch (error: any) {
    logger.error('Create session controller error:', error);
    res.status(400).json({ error: error.message || 'Failed to create session' });
  }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;

    const session = await sessionService.getSession(userId, sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.status(200).json(session);
  } catch (error: any) {
    logger.error('Get session controller error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const sessions = await sessionService.getUserSessions(userId);
    res.status(200).json(sessions);
  } catch (error: any) {
    logger.error('Get sessions controller error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;

    await sessionService.deleteSession(userId, sessionId);
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    logger.error('Delete session controller error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};
