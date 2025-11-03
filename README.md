# WhatsApp Gateway - Multi-Device Backend API

A production-ready WhatsApp Gateway Backend API built with [Baileys](https://github.com/WhiskeySockets/Baileys) for multi-device support.

## Features

✨ **Multi-Session Management** - Handle multiple WhatsApp sessions simultaneously
🔐 **JWT Authentication** - Secure token-based authentication system
💾 **MySQL Database** - Production-ready with Drizzle ORM
📨 **Message Queue** - Anti-spam rate limiting with Bull & Redis
🔒 **Session Deduplication** - Prevent duplicate sessions with Redis locks
🔑 **API Key Authentication** - Additional security layer
📝 **Winston Logging** - Structured logging for debugging and monitoring
📚 **Swagger API Documentation** - Interactive API documentation

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **Baileys** - WhatsApp Web API
- **MySQL** - Database
- **Drizzle ORM** - Type-safe ORM
- **Bull** - Message queue
- **Redis** - Cache and queue storage
- **JWT** - Authentication
- **Winston** - Logging
- **Swagger** - API documentation

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Redis (v6 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/Zytkaa/whastapp-gateway.git
cd whastapp-gateway
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=whatsapp_gateway

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API Key Configuration
API_KEY=your-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Set up the database**

Create a MySQL database:

```sql
CREATE DATABASE whatsapp_gateway;
```

Generate and push database schema:

```bash
npm run db:generate
npm run db:push
```

5. **Build the project**

```bash
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

### Session Management

#### Create Session
```http
POST /api/sessions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "sessionId": "my-session-1",
  "name": "My WhatsApp Session"
}
```

#### Get All Sessions
```http
GET /api/sessions
Authorization: Bearer <your_jwt_token>
```

#### Get Specific Session
```http
GET /api/sessions/{sessionId}
Authorization: Bearer <your_jwt_token>
```

#### Delete Session
```http
DELETE /api/sessions/{sessionId}
Authorization: Bearer <your_jwt_token>
```

### Messages

#### Send Message (Queued)
```http
POST /api/messages/send
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "sessionId": "my-session-1",
  "to": "1234567890",
  "message": "Hello from WhatsApp Gateway!"
}
```

#### Send Message (Direct)
```http
POST /api/messages/send-direct
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "sessionId": "my-session-1",
  "to": "1234567890",
  "message": "Hello immediately!"
}
```

## Architecture

### Project Structure

```
whastapp-gateway/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main config
│   │   ├── database.ts  # Database connection
│   │   ├── logger.ts    # Winston logger
│   │   ├── redis.ts     # Redis connection
│   │   └── swagger.ts   # Swagger config
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── session.controller.ts
│   │   └── message.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── apiKey.ts    # API key validation
│   │   └── rateLimit.ts # Rate limiting
│   ├── models/          # Database models
│   │   └── schema.ts    # Drizzle schema
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── session.routes.ts
│   │   └── message.routes.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── session.service.ts
│   │   ├── whatsapp.service.ts
│   │   └── queue.service.ts
│   └── index.ts         # App entry point
├── .env.example         # Environment variables template
├── .gitignore
├── drizzle.config.ts    # Drizzle ORM config
├── package.json
├── tsconfig.json
└── README.md
```

### Key Features Explained

#### Multi-Session Management
- Each user can create multiple WhatsApp sessions
- Sessions are stored in the database and managed in-memory
- QR codes are generated for authentication
- Sessions persist across server restarts (when using file-based auth)

#### JWT Authentication
- Secure token-based authentication
- Tokens expire after configured time (default: 24h)
- Protected routes require valid JWT token

#### Message Queue
- Messages are queued using Bull
- Rate limiting prevents spam
- Automatic retry on failure
- Exponential backoff strategy

#### Session Deduplication
- Redis locks prevent duplicate session creation
- Lock expiry ensures no deadlocks
- Atomic operations guarantee consistency

#### API Key
- Additional security layer for API access
- Each user gets a unique API key on registration
- Can be used for webhook authentication

## Database Schema

### Users Table
- `id` - UUID primary key
- `email` - Unique email
- `password` - Hashed password
- `name` - User's name
- `apiKey` - Unique API key
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Sessions Table
- `id` - UUID primary key
- `userId` - Foreign key to users
- `sessionId` - Unique session identifier
- `name` - Session name
- `phoneNumber` - Connected phone number
- `status` - Connection status
- `qrCode` - QR code for authentication
- `isActive` - Boolean flag
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Messages Table
- `id` - UUID primary key
- `sessionId` - Session identifier
- `messageId` - WhatsApp message ID
- `from` - Sender
- `to` - Recipient
- `message` - Message text
- `type` - Message type
- `status` - Delivery status
- `timestamp` - Timestamp

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Security Best Practices

1. **Change default secrets** - Update JWT_SECRET and API_KEY in production
2. **Use HTTPS** - Always use HTTPS in production
3. **Rate limiting** - Configure appropriate rate limits
4. **Database security** - Use strong passwords and restrict access
5. **Environment variables** - Never commit .env files
6. **Redis security** - Set password for Redis in production
7. **Regular updates** - Keep dependencies updated

## Troubleshooting

### Common Issues

**Issue: Cannot connect to MySQL**
- Verify MySQL is running: `systemctl status mysql`
- Check credentials in .env file
- Ensure database exists

**Issue: Redis connection error**
- Verify Redis is running: `systemctl status redis`
- Check Redis host and port in .env

**Issue: QR code not generating**
- Check session directory permissions
- Verify WhatsApp service is properly initialized
- Check logs for errors

**Issue: Messages not sending**
- Ensure session is connected (status: 'connected')
- Verify phone number format (include country code)
- Check Redis queue for errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- Express.js community
- All contributors

---

**Note**: This is an unofficial implementation and is not affiliated with WhatsApp or Meta. Use at your own risk and ensure compliance with WhatsApp's Terms of Service.