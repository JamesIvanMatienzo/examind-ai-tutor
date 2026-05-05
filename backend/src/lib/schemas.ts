import { z } from "zod";

export const allowedQuestionTypes = [
  "Multiple Choice",
  "True or False",
  "Identification",
  "Fill in the Blank",
] as const;

export const generatePracticeRequestSchema = z.object({
  subjectId: z.string().uuid("subjectId must be a valid UUID"),
  items: z.number().int().min(1).max(100),
  focus: z.string().min(1).max(120),
  types: z.array(z.enum(allowedQuestionTypes)).min(1).max(allowedQuestionTypes.length),
});

export const aiQuestionSchema = z.object({
  q: z.string().min(1),
  options: z.array(z.string().min(1)).optional(),
  correct: z.number().int().min(0),
  explanation: z.string().min(1),
  topic: z.string().min(1),
  type: z.enum(allowedQuestionTypes),
});

export const generatePracticeResponseSchema = z.object({
  questions: z.array(aiQuestionSchema).min(1),
  sourceSummary: z.object({
    subjectName: z.string(),
    fileCount: z.number().int().nonnegative(),
    excerptCount: z.number().int().nonnegative(),
  }),
});

export type GeneratePracticeRequest = z.infer<typeof generatePracticeRequestSchema>;
export type AIQuestion = z.infer<typeof aiQuestionSchema>;
export type GeneratePracticeResponse = z.infer<typeof generatePracticeResponseSchema>;

