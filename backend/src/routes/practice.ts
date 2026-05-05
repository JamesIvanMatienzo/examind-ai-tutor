import { Router } from "express";
import { ZodError } from "zod";
import { generatePracticeQuestions } from "../lib/gemini.js";
import {
  generatePracticeRequestSchema,
  generatePracticeResponseSchema,
} from "../lib/schemas.js";
import { getSubjectGenerationContext } from "../lib/supabase.js";

export const practiceRouter = Router();

practiceRouter.post("/generate", async (req, res) => {
  try {
    const parsedBody = generatePracticeRequestSchema.parse(req.body);
    const context = await getSubjectGenerationContext(parsedBody.subjectId);

    if (context.files.length === 0) {
      return res.status(422).json({
        error: "This subject has no uploaded files yet. Add study materials before generating an exam.",
      });
    }

    if (context.excerpts.length === 0) {
      return res.status(422).json({
        error: "We found files for this subject, but none of them could be read as study material yet.",
      });
    }

    const questions = await generatePracticeQuestions({
      request: parsedBody,
      subject: {
        name: context.subject.name,
        code: context.subject.code,
        exam_date: context.subject.exam_date,
      },
      excerpts: context.excerpts,
    });

    const response = generatePracticeResponseSchema.parse({
      questions,
      sourceSummary: {
        subjectName: context.subject.name,
        fileCount: context.files.length,
        excerptCount: context.excerpts.length,
      },
    });

    return res.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid request or AI response schema",
        details: error.issues,
      });
    }

    if (error instanceof Error && error.message === "Subject not found") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate practice exam",
    });
  }
});

