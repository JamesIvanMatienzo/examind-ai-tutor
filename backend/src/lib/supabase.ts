import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";
import { env } from "./env.js";

const BUCKET = "subject-files";
const MAX_FILES = 5;
const MAX_TEXT_CHARS = 16000;

type SubjectRow = {
  id: string;
  name: string;
  code: string | null;
  color: string;
  exam_date: string | null;
  user_id: string;
};

type SubjectFileRow = {
  id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  file_type: string;
  size_bytes: number | null;
};

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isTextMime(mimeType: string | null, filename: string) {
  const lower = filename.toLowerCase();
  return (
    !!mimeType?.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".json")
  );
}

function isImageMime(mimeType: string | null, filename: string) {
  const lower = filename.toLowerCase();
  return (
    !!mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(lower)
  );
}

async function readFileText(file: SubjectFileRow): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(file.storage_path, 120);

  if (error || !data?.signedUrl) {
    throw new Error(`Unable to access file ${file.name}`);
  }

  const response = await fetch(data.signedUrl);
  if (!response.ok) {
    throw new Error(`Unable to download file ${file.name}`);
  }

  // --- PDF extraction via pdf-parse v2 ---
  if ((file.mime_type === "application/pdf") || file.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await response.arrayBuffer();
    const parser = new PDFParse({ verbosity: 0 });
    try {
      // pdf-parse v2 marks load() as private in types, but it's the documented API
      await (parser as any).load(Buffer.from(arrayBuffer));
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  // --- Image OCR via Tesseract.js ---
  if (isImageMime(file.mime_type, file.name)) {
    const arrayBuffer = await response.arrayBuffer();
    const { data: ocrResult } = await Tesseract.recognize(
      Buffer.from(arrayBuffer),
      "eng",
      { logger: () => {} }, // suppress progress logs
    );
    return ocrResult.text;
  }

  // --- Plain text files ---
  if (isTextMime(file.mime_type, file.name)) {
    return await response.text();
  }

  return "";
}

function normalizeExcerpt(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_CHARS);
}

export async function getSubjectGenerationContext(subjectId: string) {
  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("id,name,code,color,exam_date,user_id")
    .eq("id", subjectId)
    .single<SubjectRow>();

  if (subjectError || !subject) {
    throw new Error("Subject not found");
  }

  const { data: files, error: filesError } = await supabaseAdmin
    .from("subject_files")
    .select("id,name,storage_path,mime_type,file_type,size_bytes")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })
    .limit(MAX_FILES)
    .returns<SubjectFileRow[]>();

  if (filesError) {
    throw new Error("Unable to load subject files");
  }

  const excerpts: Array<{ name: string; fileType: string; excerpt: string }> = [];
  for (const file of files ?? []) {
    try {
      const rawText = await readFileText(file);
      const excerpt = normalizeExcerpt(rawText);
      if (excerpt) {
        excerpts.push({
          name: file.name,
          fileType: file.file_type,
          excerpt,
        });
      }
    } catch (err) {
      console.warn(`[readFileText] Skipped ${file.name}:`, err instanceof Error ? err.message : err);
      // Skip unreadable files; the route validates that enough usable context remains.
    }
  }

  return {
    subject,
    files: files ?? [],
    excerpts,
  };
}
