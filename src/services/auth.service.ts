import { db } from '../config/database';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async register(data: CreateUserData) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
      
      if (existingUser.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Generate API key
      const apiKey = `wag_${uuidv4().replace(/-/g, '')}`;

      // Create user
      const userId = uuidv4();
      await db.insert(users).values({
        id: userId,
        email: data.email,
        password: hashedPassword,
        name: data.name || null,
        apiKey,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: userId, email: data.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      logger.info(`User registered: ${data.email}`);

      return {
        user: {
          id: userId,
          email: data.email,
          name: data.name,
          apiKey,
        },
        token,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(data: LoginData) {
    try {
      // Find user
      const userResult = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
      
      if (userResult.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = userResult[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      logger.info(`User logged in: ${data.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          apiKey: user.apiKey,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (userResult.length === 0) {
        return null;
      }

      const user = userResult[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        apiKey: user.apiKey,
      };
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }
}

export default new AuthService();
