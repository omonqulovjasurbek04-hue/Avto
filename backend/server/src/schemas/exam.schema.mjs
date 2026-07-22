// Zod validation schemas for exam endpoints.
import { z } from "zod";

export const examSubmitSchema = z.object({
  answers: z
    .array(
      z.object({
        scenarioId: z.string().regex(/^[\w-]+$/).max(20),
        optionId: z.string().regex(/^[\w-]+$/).max(10),
      }),
    )
    .min(1, "Kamida bitta javob talab qilinadi")
    .max(50, "Eng ko'pi bilan 50 ta javob yuborilishi mumkin"),
  durationSeconds: z.number().int().min(0).max(7200).optional().default(0),
});
