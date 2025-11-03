/**
 * Sanitize session ID to prevent path traversal attacks
 * Only allows alphanumeric characters, hyphens, and underscores
 */
export function sanitizeSessionId(sessionId: string): string {
  // Remove any characters that aren't alphanumeric, hyphen, or underscore
  const sanitized = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  if (sanitized !== sessionId) {
    throw new Error('Invalid session ID format. Only alphanumeric characters, hyphens, and underscores are allowed.');
  }
  
  if (sanitized.length === 0 || sanitized.length > 100) {
    throw new Error('Session ID must be between 1 and 100 characters.');
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (digits only, 10-15 characters)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone);
}
