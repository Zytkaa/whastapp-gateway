import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Send a message (queued with rate limiting)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - to
 *               - message
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID to use
 *               to:
 *                 type: string
 *                 description: Recipient phone number (with country code)
 *               message:
 *                 type: string
 *                 description: Message text
 *     responses:
 *       200:
 *         description: Message queued successfully
 *       400:
 *         description: Bad request
 */
router.post('/send', authMiddleware, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/send-direct:
 *   post:
 *     summary: Send a message directly (no queue)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - to
 *               - message
 *             properties:
 *               sessionId:
 *                 type: string
 *               to:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post('/send-direct', authMiddleware, messageController.sendMessageDirect);

export default router;
