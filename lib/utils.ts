/**
 * Generate random alphanumeric string for email local part
 */
export function generateRandomLocalPart(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Parse email address to extract name and email
 * Example: "John Doe <john@example.com>" => { name: "John Doe", email: "john@example.com" }
 */
export function parseEmailAddress(emailString: string): { name: string | null; email: string } {
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, ''),
      email: match[2].trim(),
    };
  }
  return {
    name: null,
    email: emailString.trim(),
  };
}

/**
 * Extract local part from email address
 */
export function extractLocalPart(email: string): string {
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? email.substring(0, atIndex) : email;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
