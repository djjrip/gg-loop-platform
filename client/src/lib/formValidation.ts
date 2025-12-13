/**
 * Enhanced Form Validation Library
 * Provides consistent, user-friendly validation across the platform
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    errors.length = 'Password must be at least 8 characters';
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.uppercase = 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(password)) {
    errors.lowercase = 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    errors.number = 'Password must contain at least one number';
  }
  
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true };
};

/**
 * Username validation
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { valid: true };
};

/**
 * Riot ID validation (GameName#TagLine)
 */
export const validateRiotId = (riotId: string): ValidationResult => {
  if (!riotId || riotId.trim() === '') {
    return { valid: false, error: 'Riot ID is required' };
  }
  
  const [gameName, tagLine] = riotId.split('#');
  
  if (!gameName || !tagLine) {
    return { 
      valid: false, 
      error: 'Riot ID must be in format: GameName#Tag (e.g., "SummonerName#NA1")' 
    };
  }
  
  if (gameName.length < 3 || gameName.length > 16) {
    return { valid: false, error: 'Game name must be between 3 and 16 characters' };
  }
  
  if (tagLine.length < 1 || tagLine.length > 5) {
    return { valid: false, error: 'Tag must be between 1 and 5 characters' };
  }
  
  return { valid: true };
};

/**
 * Number validation with optional min/max
 */
export const validateNumber = (
  value: string | number,
  options?: { min?: number; max?: number; label?: string }
): ValidationResult => {
  const label = options?.label || 'Value';
  
  if (value === '' || value === null || value === undefined) {
    return { valid: false, error: `${label} is required` };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: `${label} must be a valid number` };
  }
  
  if (options?.min !== undefined && num < options.min) {
    return { valid: false, error: `${label} must be at least ${options.min}` };
  }
  
  if (options?.max !== undefined && num > options.max) {
    return { valid: false, error: `${label} must be no more than ${options.max}` };
  }
  
  return { valid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (
  value: string | number | undefined,
  fieldName: string = 'This field'
): ValidationResult => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true };
};

/**
 * Validate form object against schema
 */
export const validateForm = (
  formData: Record<string, any>,
  schema: Record<string, (value: any) => ValidationResult>
): ValidationResult => {
  const errors: Record<string, string> = {};
  
  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(formData[field]);
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true };
};
