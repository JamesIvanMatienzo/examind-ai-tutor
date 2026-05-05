import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";
import {
  aiQuestionSchema,
  type AIQuestion,
  type GeneratePracticeRequest,
} from "./schemas.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  },
});

function buildPrompt(input: {
  request: GeneratePracticeRequest;
  subject: { name: string; code: string | null; exam_date: string | null };
  excerpts: Array<{ name: string; fileType: string; excerpt: string }>;
  repairInstructions?: string;
}) {
  const typesList = input.request.types.join(", ");
  const materialBlock = input.excerpts
    .map(
      (item, index) =>
        `Source ${index + 1} (${item.fileType}) - ${item.name}\n${item.excerpt}`,
    )
    .join("\n\n---\n\n");

  return `
You are generating a practice exam for Examind, an AI-powered study platform.

Return ONLY valid JSON with this exact shape:
{
  "questions": [
    {
      "q": "question text",
      "options": ["choice A", "choice B", "choice C", "choice D"],
      "correct": 0,
      "explanation": "why the answer is correct",
      "topic": "topic label",
      "type": "Multiple Choice"
    }
  ]
}

Rules:
- Generate exactly ${input.request.items} questions.
- Allowed question types: ${typesList}.
- Base all questions strictly on the provided study material.
- Every question must include a concise explanation.
- For "Multiple Choice", provide exactly 4 options.
- For "True or False", provide exactly 2 options: ["True","False"] or ["False","True"].
- For "Identification" and "Fill in the Blank", omit "options".
- "correct" must be a zero-based answer index when options exist.
- For option-less questions, set "correct" to 0 and put the expected answer in "explanation" clearly.
- Keep topics specific and consistent with the material.
- Do not include markdown fences or commentary.
- Some source text may come from OCR (scanned images or handwritten notes). Ignore OCR artifacts like garbled characters, line breaks in the middle of words, or formatting noise. Focus on the actual academic content.
- Prioritize topics that appear most frequently across the source material, as they are more likely to appear on the actual exam.
${input.repairInstructions ? `- Additional repair instructions: ${input.repairInstructions}` : ""}

Subject:
- Name: ${input.subject.name}
- Code: ${input.subject.code ?? "N/A"}
- Exam date: ${input.subject.exam_date ?? "N/A"}
- Focus: ${input.request.focus}

Study material:
${materialBlock}
`.trim();
}

function normalizeQuestion(question: AIQuestion): AIQuestion {
  if (question.type === "Multiple Choice") {
    const options = (question.options ?? []).slice(0, 4);
    if (options.length !== 4) {
      throw new Error("Multiple choice questions must include exactly 4 options");
    }
    if (question.correct < 0 || question.correct >= options.length) {
      throw new Error("Correct index is out of bounds");
    }
    return { ...question, options };
  }

  if (question.type === "True or False") {
    const options = question.options ?? ["True", "False"];
    if (options.length !== 2) {
      throw new Error("True or False questions must include exactly 2 options");
    }
    if (question.correct < 0 || question.correct >= options.length) {
      throw new Error("Correct index is out of bounds");
    }
    return { ...question, options };
  }

  return {
    ...question,
    options: undefined,
    correct: 0,
  };
}

async function requestQuestions(prompt: string) {
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const parsed = JSON.parse(text) as { questions?: unknown[] };
  const questions = (parsed.questions ?? []).map((question) =>
    normalizeQuestion(aiQuestionSchema.parse(question)),
  );
  return questions;
}

export async function generatePracticeQuestions(input: {
  request: GeneratePracticeRequest;
  subject: { name: string; code: string | null; exam_date: string | null };
  excerpts: Array<{ name: string; fileType: string; excerpt: string }>;
}) {
  const primaryPrompt = buildPrompt(input);

  try {
    return await requestQuestions(primaryPrompt);
  } catch (err) {
    console.warn("[Gemini] Primary request failed, retrying with repair instructions:", err instanceof Error ? err.message : err);
    const repairPrompt = buildPrompt({
      ...input,
      repairInstructions:
        "The previous response was invalid. Regenerate and strictly obey the JSON schema and option-count rules.",
    });
    return await requestQuestions(repairPrompt);
  }
}
