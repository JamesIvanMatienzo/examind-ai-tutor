CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT NOT NULL DEFAULT '#534AB7',
  exam_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subjects"
ON public.subjects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subjects"
ON public.subjects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subjects"
ON public.subjects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own subjects"
ON public.subjects FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_subjects_user_id ON public.subjects(user_id);