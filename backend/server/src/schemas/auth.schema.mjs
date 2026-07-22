// Zod validation schemas for authentication endpoints.
import { z } from "zod";

// Password: minimum 8 chars, maximum 128, any characters allowed (OWASP recommendation)
const passwordSchema = z
  .string()
  .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
  .max(128, "Parol 128 ta belgidan oshmasligi kerak");

export const registerSchema = z.object({
  email: z.string().email("Yaroqli email manzil kiriting").max(255).toLowerCase().trim(),
  password: passwordSchema,
  name: z.string().min(1).max(100).trim().optional(),
  locale: z.enum(["uz", "ru", "en"]).optional().default("uz"),
});

export const loginSchema = z.object({
  email: z.string().email("Yaroqli email manzil kiriting").toLowerCase().trim(),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parol kiritilishi shart"),
  newPassword: passwordSchema,
});
