import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode-terminal';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';
import { sanitizeSessionId } from '../utils/validation';

interface SessionData {
  socket: WASocket | null;
  qrCode: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr';
  phoneNumber: string | null;
}

class WhatsAppService {
  private sessions: Map<string, SessionData> = new Map();
  private sessionsDir = path.join(process.cwd(), 'sessions');

  constructor() {
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  async createSession(sessionId: string, onQR?: (qr: string) => void): Promise<SessionData> {
    // Sanitize session ID to prevent path traversal
    const sanitized = sanitizeSessionId(sessionId);
    
    // Check if session already exists
    if (this.sessions.has(sanitized)) {
      logger.warn(`Session ${sanitized} already exists`);
      return this.sessions.get(sanitized)!;
    }

    const sessionPath = path.join(this.sessionsDir, sanitized);
    
    // Create session directory
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sessionData: SessionData = {
      socket: null,
      qrCode: null,
      status: 'connecting',
      phoneNumber: null,
    };

    this.sessions.set(sanitized, sessionData);

    const socket = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      printQRInTerminal: false,
      logger: logger as any,
    });

    sessionData.socket = socket;

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        sessionData.qrCode = qr;
        sessionData.status = 'qr';
        QRCode.generate(qr, { small: true });
        logger.info(`QR Code generated for session ${sanitized}`);
        
        if (onQR) {
          onQR(qr);
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        logger.info(`Connection closed for session ${sanitized}, reconnecting: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          sessionData.status = 'connecting';
          await this.createSession(sessionId, onQR);
        } else {
          sessionData.status = 'disconnected';
          this.sessions.delete(sanitized);
        }
      } else if (connection === 'open') {
        sessionData.status = 'connected';
        sessionData.phoneNumber = socket.user?.id?.split(':')[0] || null;
        logger.info(`Session ${sanitized} connected successfully`);
      }
    });

    socket.ev.on('creds.update', saveCreds);

    return sessionData;
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): Map<string, SessionData> {
    return this.sessions;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    // Sanitize session ID to prevent path traversal
    const sanitized = sanitizeSessionId(sessionId);
    const sessionData = this.sessions.get(sanitized);
    
    if (!sessionData) {
      return false;
    }

    // Logout and close connection
    if (sessionData.socket) {
      try {
        await sessionData.socket.logout();
      } catch (error) {
        logger.error(`Error logging out session ${sanitized}:`, error);
      }
    }

    // Remove from active sessions
    this.sessions.delete(sanitized);

    // Delete session files
    const sessionPath = path.join(this.sessionsDir, sanitized);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }

    logger.info(`Session ${sanitized} deleted successfully`);
    return true;
  }

  async sendMessage(sessionId: string, to: string, message: string): Promise<any> {
    const sessionData = this.sessions.get(sessionId);

    if (!sessionData || !sessionData.socket) {
      throw new Error('Session not found or not connected');
    }

    if (sessionData.status !== 'connected') {
      throw new Error('Session is not connected');
    }

    try {
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
      const result = await sessionData.socket.sendMessage(jid, { text: message });
      logger.info(`Message sent to ${to} via session ${sessionId}`);
      return result;
    } catch (error) {
      logger.error(`Error sending message via session ${sessionId}:`, error);
      throw error;
    }
  }

  sessionExists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getSessionStatus(sessionId: string): string {
    const sessionData = this.sessions.get(sessionId);
    return sessionData?.status || 'disconnected';
  }
}

export default new WhatsAppService();
