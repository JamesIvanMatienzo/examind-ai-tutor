import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().default("http://localhost:8080"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  SUPABASE_URL: z.string().default("https://uoqbqbiywlohjfhrxjvo.supabase.co"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

export const env = envSchema.parse(process.env);

