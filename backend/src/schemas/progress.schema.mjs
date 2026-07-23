// Zod validation schemas for progress endpoints.
import { z } from "zod";

export const answerSchema = z.object({
  scenarioId: z
    .string()
    .regex(/^[\w-]+$/, "scenarioId faqat harf, raqam, tire va pastki chiziqdan iborat bo'lishi kerak")
    .max(20),
  optionId: z
    .string()
    .regex(/^[\w-]+$/, "optionId faqat harf, raqam, tire va pastki chiziqdan iborat bo'lishi kerak")
    .max(10),
});
