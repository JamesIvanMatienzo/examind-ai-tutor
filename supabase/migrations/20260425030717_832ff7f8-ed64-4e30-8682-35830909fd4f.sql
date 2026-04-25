
-- Storage bucket for subject files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('subject-files', 'subject-files', false)
ON CONFLICT (id) DO NOTHING;

-- Table tracking uploaded files per subject
CREATE TABLE public.subject_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_bytes BIGINT,
  file_type TEXT NOT NULL DEFAULT 'Notes',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_subject_files_subject ON public.subject_files(subject_id);
CREATE INDEX idx_subject_files_user ON public.subject_files(user_id);

ALTER TABLE public.subject_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subject files"
  ON public.subject_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subject files"
  ON public.subject_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subject files"
  ON public.subject_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own subject files"
  ON public.subject_files FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_subject_files_updated_at
  BEFORE UPDATE ON public.subject_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies: files live under {user_id}/{subject_id}/{filename}
CREATE POLICY "Users view own subject file objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'subject-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own subject file objects"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'subject-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own subject file objects"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'subject-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own subject file objects"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'subject-files' AND auth.uid()::text = (storage.foldername(name))[1]);
