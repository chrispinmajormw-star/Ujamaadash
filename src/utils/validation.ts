/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export const VALIDATION_RULES: Record<string, ValidationRule> = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (value.length > 254) return "Email address is too long";
      return null;
    }
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
      if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
      if (!/[0-9]/.test(value)) return "Password must contain at least one number";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Password must contain at least one special character";
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    custom: (value) => {
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return null;
    }
  },
  school: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  district: {
    required: true
  },
  zone: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  designation: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  number: {
    required: true,
    pattern: /^\d+$/,
    custom: (value) => {
      const num = parseInt(value);
      if (num < 0) return "Cannot be negative";
      if (num > 10000) return "Value is too large";
      return null;
    }
  }
};

export const validateField = (fieldName: string, value: string): ValidationResult => {
  const rule = VALIDATION_RULES[fieldName];
  if (!rule) return { isValid: true, errors: {} };

  const errors: Record<string, string> = {};

  if (rule.required && !value.trim()) {
    errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    return { isValid: false, errors };
  }

  if (value.trim()) {
    if (rule.minLength && value.length < rule.minLength) {
      errors[fieldName] = `Must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors[fieldName] = `Must be no more than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors[fieldName] = `Invalid ${fieldName} format`;
    }

    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[fieldName] = customError;
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateForm = (fields: Record<string, string>, fieldNames: string[]): ValidationResult => {
  const allErrors: Record<string, string> = {};
  let isValid = true;

  fieldNames.forEach(fieldName => {
    const result = validateField(fieldName, fields[fieldName] || '');
    if (!result.isValid) {
      isValid = false;
      Object.assign(allErrors, result.errors);
    }
  });

  return { isValid, errors: allErrors };
};

export const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: 'None', color: '#9ca3af' };

  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

  if (strength < 30) return { strength, label: 'Weak', color: '#ef4444' };
  if (strength < 60) return { strength, label: 'Fair', color: '#f59e0b' };
  if (strength < 80) return { strength, label: 'Good', color: '#3b82f6' };
  return { strength, label: 'Strong', color: '#10b981' };
};
