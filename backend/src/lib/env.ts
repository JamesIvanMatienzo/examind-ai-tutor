import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_ORIGIN: z.string().default("http://localhost:8080"),
  GEMINI_API_KEY: z.string().min(1, "AIzaSyBupMd_T5T3pSFwhsGWlx9kBHO68zswYOE"),
  SUPABASE_URL: z.string().("https://uoqbqbiywlohjfhrxjvo.supabase.co"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcWJxYml5d2xvaGpmaHJ4anZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzI3MjcsImV4cCI6MjA5MjYwODcyN30.oZqVsmBlk379fr-_RPyTv8Pp_9jGUrT1bn4PxlUrx50"),
});

export const env = envSchema.parse(process.env);

