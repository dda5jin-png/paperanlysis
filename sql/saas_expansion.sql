-- 1. 기존 profiles 테이블 필드 확장
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_free_whitelist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS free_daily_limit INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS paid_plan TEXT, -- 'basic', 'pro', 'enterprise' 등
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. 사용량 로그 테이블 (Usage Tracking)
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'analysis_free', 'analysis_premium', 'compare', 'followup', 'export_pdf', 'export_ppt'
  resource_id UUID, -- paper_id 또는 관련 ID
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  cost_estimate DECIMAL(10, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 후속 질문 (Discussion Threads)
CREATE TABLE IF NOT EXISTS public.followup_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES public.papers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.followup_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.followup_threads(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 결제 이력 (Payments - Basic Structure)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KRW',
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. RLS 보안 설정 업데이트
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 본인 것만 보기 정책
CREATE POLICY "Users can view own usage_logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own followup_threads" ON public.followup_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own followup_messages" ON public.followup_messages FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.followup_threads WHERE id = thread_id AND user_id = auth.uid()
));
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- 인서트 정책 (어플리케이션단에서 수행)
CREATE POLICY "Users can insert own usage_logs" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own followup_threads" ON public.followup_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own followup_messages" ON public.followup_messages FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM public.followup_threads WHERE id = thread_id AND user_id = auth.uid()
));
