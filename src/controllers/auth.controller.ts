import { Request, Response } from 'express';
import authService from '../services/auth.service';
import logger from '../config/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await authService.register({ email, password, name });
    res.status(201).json(result);
  } catch (error: any) {
    logger.error('Register controller error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Login controller error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    logger.error('Get profile controller error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
