import { db } from '../config/database';
import { sessions } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import whatsappService from './whatsapp.service';
import redis from '../config/redis';

const SESSION_LOCK_PREFIX = 'session_lock:';
const LOCK_EXPIRY = 10; // 10 seconds

class SessionService {
  async createSession(userId: string, sessionId: string, name: string) {
    try {
      // Session deduplication using Redis lock
      const lockKey = `${SESSION_LOCK_PREFIX}${sessionId}`;
      const lock = await redis.set(lockKey, userId, 'EX', LOCK_EXPIRY, 'NX');
      
      if (!lock) {
        throw new Error('Session creation already in progress');
      }

      // Check if session already exists in database
      const existingSession = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.userId, userId), eq(sessions.sessionId, sessionId)))
        .limit(1);
      
      if (existingSession.length > 0) {
        await redis.del(lockKey);
        
        // Check if WhatsApp session exists
        if (whatsappService.sessionExists(sessionId)) {
          return existingSession[0];
        }
        
        // Recreate WhatsApp session if not exists
        await whatsappService.createSession(sessionId, async (qr) => {
          await this.updateSessionQR(sessionId, qr);
        });
        
        return existingSession[0];
      }

      // Create database record
      const id = uuidv4();
      await db.insert(sessions).values({
        id,
        userId,
        sessionId,
        name,
        status: 'connecting',
      });

      // Create WhatsApp session
      await whatsappService.createSession(sessionId, async (qr) => {
        await this.updateSessionQR(sessionId, qr);
      });

      // Release lock
      await redis.del(lockKey);

      logger.info(`Session created: ${sessionId} for user ${userId}`);

      return {
        id,
        userId,
        sessionId,
        name,
        status: 'connecting',
      };
    } catch (error) {
      logger.error('Create session error:', error);
      throw error;
    }
  }

  async updateSessionQR(sessionId: string, qrCode: string) {
    try {
      await db
        .update(sessions)
        .set({ qrCode, status: 'qr' })
        .where(eq(sessions.sessionId, sessionId));
      
      logger.info(`QR code updated for session ${sessionId}`);
    } catch (error) {
      logger.error('Update session QR error:', error);
    }
  }

  async getSession(userId: string, sessionId: string) {
    try {
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.userId, userId), eq(sessions.sessionId, sessionId)))
        .limit(1);
      
      if (sessionResult.length === 0) {
        return null;
      }

      const session = sessionResult[0];
      const whatsappSession = whatsappService.getSession(sessionId);
      
      return {
        ...session,
        status: whatsappSession?.status || session.status,
        qrCode: whatsappSession?.qrCode || session.qrCode,
        phoneNumber: whatsappSession?.phoneNumber || session.phoneNumber,
      };
    } catch (error) {
      logger.error('Get session error:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string) {
    try {
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId));
      
      return userSessions.map((session) => {
        const whatsappSession = whatsappService.getSession(session.sessionId);
        return {
          ...session,
          status: whatsappSession?.status || session.status,
          phoneNumber: whatsappSession?.phoneNumber || session.phoneNumber,
        };
      });
    } catch (error) {
      logger.error('Get user sessions error:', error);
      throw error;
    }
  }

  async deleteSession(userId: string, sessionId: string) {
    try {
      // Delete WhatsApp session
      await whatsappService.deleteSession(sessionId);

      // Delete from database
      await db
        .delete(sessions)
        .where(and(eq(sessions.userId, userId), eq(sessions.sessionId, sessionId)));
      
      logger.info(`Session deleted: ${sessionId} for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Delete session error:', error);
      throw error;
    }
  }
}

export default new SessionService();
