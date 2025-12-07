import { z } from 'zod';

// Onboarding profile validation schema with realistic bounds
export const onboardingSchema = z.object({
  weight: z.number()
    .min(20, 'Weight must be at least 20kg')
    .max(500, 'Weight must be at most 500kg'),
  height: z.number()
    .min(50, 'Height must be at least 50cm')
    .max(300, 'Height must be at most 300cm'),
  age: z.number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Age must be at most 120'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select a gender' })
  }),
  goal: z.enum(['bulk', 'cut', 'maintain'], {
    errorMap: () => ({ message: 'Please select a fitness goal' })
  }),
  experience: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Please select your experience level' })
  }),
  dietaryPreference: z.string().min(1, 'Please select a dietary preference'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Meal description validation schema
export const mealDescriptionSchema = z.object({
  mealDescription: z.string()
    .min(3, 'Meal description must be at least 3 characters')
    .max(500, 'Meal description must be at most 500 characters')
    .trim(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'Please select a valid meal type' })
  }),
});

export type MealLogFormData = z.infer<typeof mealDescriptionSchema>;

// Auth validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be at most 255 characters');

export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be at most 128 characters');

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AuthFormData = z.infer<typeof authSchema>;

// Helper to sanitize text input for AI prompts (basic sanitization)
export function sanitizeForAIPrompt(text: string): string {
  // Trim and limit length
  let sanitized = text.trim().slice(0, 500);
  
  // Remove any potential instruction-like patterns (basic protection)
  // This removes common prompt injection patterns
  sanitized = sanitized
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/assistant\s*:/gi, '')
    .replace(/user\s*:/gi, '');
  
  return sanitized;
}
