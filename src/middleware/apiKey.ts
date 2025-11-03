import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import logger from '../config/logger';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return;
    }

    if (apiKey !== config.apiKey) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    next();
  } catch (error) {
    logger.error('API key middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
