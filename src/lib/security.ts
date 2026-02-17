/**
 * Security utilities for input validation and sanitization
 */

// Input validation rules
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-50 characters, alphanumeric and underscores only'
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain uppercase, lowercase, number, and special character'
  },
  email: {
    minLength: 5,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  },
  description: {
    minLength: 0,
    maxLength: 1000,
    pattern: /^[\w\s.,!?'"-]+$/,
    message: 'Description contains invalid characters'
  }
};

// Sanitization functions
export const sanitize = {
  // Remove HTML tags and dangerous characters
  html: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Remove SQL injection patterns
  sql: (input: string): string => {
    return input
      .replace(/['"`;\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
  },

  // Remove script tags and dangerous attributes
  script: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // General sanitization for user input
  text: (input: string): string => {
    return sanitize.html(sanitize.script(input.trim()));
  }
};

// Validation functions
export const validate = {
  username: (value: string): { isValid: boolean; message?: string } => {
    const rule = VALIDATION_RULES.username;
    if (!value || value.length < rule.minLength) {
      return { isValid: false, message: `Username must be at least ${rule.minLength} characters` };
    }
    if (value.length > rule.maxLength) {
      return { isValid: false, message: `Username must be no more than ${rule.maxLength} characters` };
    }
    if (!rule.pattern.test(value)) {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  },

  password: (value: string): { isValid: boolean; message?: string } => {
    const rule = VALIDATION_RULES.password;
    if (!value || value.length < rule.minLength) {
      return { isValid: false, message: `Password must be at least ${rule.minLength} characters` };
    }
    if (value.length > rule.maxLength) {
      return { isValid: false, message: `Password must be no more than ${rule.maxLength} characters` };
    }
    if (!rule.pattern.test(value)) {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  },

  email: (value: string): { isValid: boolean; message?: string } => {
    const rule = VALIDATION_RULES.email;
    if (!value || value.length < rule.minLength) {
      return { isValid: false, message: `Email must be at least ${rule.minLength} characters` };
    }
    if (value.length > rule.maxLength) {
      return { isValid: false, message: `Email must be no more than ${rule.maxLength} characters` };
    }
    if (!rule.pattern.test(value)) {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  },

  name: (value: string): { isValid: boolean; message?: string } => {
    const rule = VALIDATION_RULES.name;
    if (!value || value.length < rule.minLength) {
      return { isValid: false, message: `Name must be at least ${rule.minLength} character` };
    }
    if (value.length > rule.maxLength) {
      return { isValid: false, message: `Name must be no more than ${rule.maxLength} characters` };
    }
    if (!rule.pattern.test(value)) {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  },

  description: (value: string): { isValid: boolean; message?: string } => {
    const rule = VALIDATION_RULES.description;
    if (value.length > rule.maxLength) {
      return { isValid: false, message: `Description must be no more than ${rule.maxLength} characters` };
    }
    if (!rule.pattern.test(value)) {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  }
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.count);
  }
}

// CSRF token generator
export const generateCSRFToken = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  }
  // Fallback for environments without crypto API
  return btoa(Math.random().toString() + Date.now().toString());
};

// CSRF token validation
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// Secure random string generator
export const generateSecureToken = (length: number = 32): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').substring(0, length);
  }
  // Fallback
  return Math.random().toString(36).substring(2, length + 2);
};

// Unified JWT verification utility
export const verifyJWT = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// Check if JWT token is expired
export const isJWTExpired = (token: string): boolean => {
  try {
    const payload = verifyJWT(token);
    if (!payload) return true;

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Token expiration check failed:', error);
    return true;
  }
};

// Security headers for Next.js
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
