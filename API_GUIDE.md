# API Usage Guide

This guide provides practical examples for using the WhatsApp Gateway API.

## Getting Started

### 1. Start the Server

First, make sure all services are running:
- MySQL database
- Redis server

Then start the application:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will be available at `http://localhost:3000`

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "apiKey": "wag_xxxxxxxxxxxxx"
  },
  "token": "jwt-token-here"
}
```

**Save the token and apiKey for future requests!**

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### 4. Get User Profile

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WhatsApp Session Management

### Create a New Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-first-session",
    "name": "My WhatsApp Account"
  }'
```

Response:
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "sessionId": "my-first-session",
  "name": "My WhatsApp Account",
  "status": "connecting"
}
```

**Important:** After creating a session, you need to scan the QR code with your WhatsApp mobile app.

### Get Session Details (Including QR Code)

```bash
curl -X GET http://localhost:3000/api/sessions/my-first-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response when QR code is available:
```json
{
  "id": "uuid",
  "sessionId": "my-first-session",
  "name": "My WhatsApp Account",
  "status": "qr",
  "qrCode": "qr-code-string-here",
  "phoneNumber": null
}
```

Response when connected:
```json
{
  "id": "uuid",
  "sessionId": "my-first-session",
  "name": "My WhatsApp Account",
  "status": "connected",
  "qrCode": null,
  "phoneNumber": "1234567890"
}
```

### List All Sessions

```bash
curl -X GET http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete a Session

```bash
curl -X DELETE http://localhost:3000/api/sessions/my-first-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Sending Messages

### Send Message (Queued with Rate Limiting)

Recommended for bulk messaging:

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-first-session",
    "to": "1234567890",
    "message": "Hello from WhatsApp Gateway!"
  }'
```

Response:
```json
{
  "message": "Message queued successfully",
  "sessionId": "my-first-session",
  "to": "1234567890"
}
```

### Send Message (Direct)

For immediate delivery without queue:

```bash
curl -X POST http://localhost:3000/api/messages/send-direct \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-first-session",
    "to": "1234567890",
    "message": "Urgent message!"
  }'
```

## Phone Number Format

Always include the country code without `+` or `00`:
- ✅ Correct: `1234567890` (US number)
- ✅ Correct: `919876543210` (India number)
- ❌ Wrong: `+1234567890`
- ❌ Wrong: `001234567890`

## Session Status Values

- `disconnected` - Session not connected
- `connecting` - Session is connecting
- `qr` - QR code available for scanning
- `connected` - Session fully connected and ready

## Rate Limiting

The API includes rate limiting to prevent abuse:

### General API Rate Limit
- **100 requests per minute** per IP address
- Headers returned with each response:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

### Auth Endpoints Rate Limit
- **5 requests per minute** for `/api/auth/register` and `/api/auth/login`

### Message Queue
Messages sent via `/api/messages/send` are automatically rate-limited:
- 1 second delay between messages
- Automatic retry on failure (3 attempts)
- Exponential backoff on errors

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "sessionId and name are required"
}
```

#### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

#### 404 Not Found
```json
{
  "error": "Session not found"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Best Practices

### 1. Session Management
- Use unique, descriptive session IDs
- Don't create duplicate sessions
- Delete sessions when no longer needed
- Monitor session status regularly

### 2. Message Sending
- Use queued messages (`/api/messages/send`) for bulk operations
- Use direct messages (`/api/messages/send-direct`) only when immediate delivery is critical
- Handle rate limiting gracefully
- Always check if session is connected before sending

### 3. Security
- Keep JWT tokens secure
- Never share your API key
- Use HTTPS in production
- Rotate tokens regularly
- Set appropriate rate limits

### 4. Error Handling
- Always check response status codes
- Implement retry logic with exponential backoff
- Log errors for debugging
- Handle network failures gracefully

## Testing with Postman

1. Import the API into Postman using the Swagger URL:
   - `http://localhost:3000/api-docs`

2. Create an environment with variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: Your JWT token
   - `sessionId`: Your session ID

3. Set Authorization header for protected endpoints:
   - Type: Bearer Token
   - Token: `{{token}}`

## JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
let authToken = '';

// Register
async function register() {
  const response = await axios.post(`${API_BASE}/api/auth/register`, {
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe'
  });
  authToken = response.data.token;
  console.log('API Key:', response.data.user.apiKey);
  return response.data;
}

// Create session
async function createSession() {
  const response = await axios.post(
    `${API_BASE}/api/sessions`,
    {
      sessionId: 'my-session',
      name: 'My WhatsApp'
    },
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

// Get session (to check QR code)
async function getSession(sessionId) {
  const response = await axios.get(
    `${API_BASE}/api/sessions/${sessionId}`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

// Send message
async function sendMessage(sessionId, to, message) {
  const response = await axios.post(
    `${API_BASE}/api/messages/send`,
    {
      sessionId,
      to,
      message
    },
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

// Usage
(async () => {
  try {
    await register();
    await createSession();
    
    // Wait and check for QR code
    const session = await getSession('my-session');
    console.log('Session status:', session.status);
    if (session.qrCode) {
      console.log('Scan this QR code:', session.qrCode);
    }
    
    // After scanning QR code and session is connected
    await sendMessage('my-session', '1234567890', 'Hello!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
```

## Python Example

```python
import requests

API_BASE = 'http://localhost:3000'
auth_token = ''

def register():
    global auth_token
    response = requests.post(f'{API_BASE}/api/auth/register', json={
        'email': 'user@example.com',
        'password': 'securePassword123',
        'name': 'John Doe'
    })
    data = response.json()
    auth_token = data['token']
    print(f"API Key: {data['user']['apiKey']}")
    return data

def create_session():
    response = requests.post(
        f'{API_BASE}/api/sessions',
        json={'sessionId': 'my-session', 'name': 'My WhatsApp'},
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    return response.json()

def get_session(session_id):
    response = requests.get(
        f'{API_BASE}/api/sessions/{session_id}',
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    return response.json()

def send_message(session_id, to, message):
    response = requests.post(
        f'{API_BASE}/api/messages/send',
        json={'sessionId': session_id, 'to': to, 'message': message},
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    return response.json()

# Usage
if __name__ == '__main__':
    register()
    create_session()
    session = get_session('my-session')
    print(f"Session status: {session['status']}")
    
    # After scanning QR and connecting
    send_message('my-session', '1234567890', 'Hello from Python!')
```

## Monitoring and Logs

Logs are stored in the `logs/` directory:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

Monitor logs in real-time:
```bash
tail -f logs/combined.log
```

## Support

For issues and questions:
1. Check the logs first
2. Review this guide
3. Check the Swagger documentation at `/api-docs`
4. Open an issue on GitHub
