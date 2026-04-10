-- ==========================================
-- 논문 분석 SaaS 통합 데이터베이스 스키마 (v3.0)
-- 기존 테이블 유지 및 SaaS 기능 확장용
-- ==========================================

-- 1. ENUM 타입 정의 (분석 타입)
DO $$ BEGIN
    CREATE TYPE analysis_category AS ENUM ('summary', 'deep', 'compare', 'followup', 'pdf_export', 'ppt_outline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. profiles 확장 (SaaS 필드 추가)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_free_whitelist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS free_daily_limit INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS paid_plan TEXT DEFAULT NULL, -- 'pro', 'enterprise' 등
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. analyses 테이블 (고도화 버전)
-- 기존에 analyses가 있다면 컬럼만 추가, 없으면 생성
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL, -- documents 테이블의 id 참조 (FK는 상황에 따라 조정)
    analysis_type analysis_category NOT NULL DEFAULT 'summary',
    input_hash TEXT NOT NULL, -- 요청 데이터의 해시 (캐싱 키)
    prompt_version TEXT NOT NULL, -- 프롬프트 버전 관리
    result_json JSONB NOT NULL, -- 분석 결과 데이터
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    cached_from_analysis_id UUID DEFAULT NULL, -- 캐시된 원본 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. usage_logs (사용량 추적)
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'analysis_summary', 'analysis_deep', 'ppt_gen' 등
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. payments (결제 내역)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'KRW',
    status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed'
    plan_name TEXT,
    order_id TEXT UNIQUE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. followup_threads (챗봇 세션)
CREATE TABLE IF NOT EXISTS public.followup_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. followup_messages (챗봇 메시지)
CREATE TABLE IF NOT EXISTS public.followup_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.followup_threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- RLS (Row Level Security) 정책 설정
-- ==========================================

-- RLS 활성화
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_messages ENABLE ROW LEVEL SECURITY;

-- 자신의 데이터만 조회/관리 가능하게 설정
DO $$ 
BEGIN
    -- analyses 정책
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own analyses') THEN
        CREATE POLICY "Users can view their own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- usage_logs 정책
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own logs') THEN
        CREATE POLICY "Users can view their own logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- payments 정책
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own payments') THEN
        CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- followup_threads 정책
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own threads') THEN
        CREATE POLICY "Users can view their own threads" ON public.followup_threads FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own threads') THEN
        CREATE POLICY "Users can manage their own threads" ON public.followup_threads FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- followup_messages 정책
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own messages') THEN
        CREATE POLICY "Users can view their own messages" ON public.followup_messages FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.followup_threads WHERE id = thread_id AND user_id = auth.uid())
        );
    END IF;
END $$;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_analyses_input_hash ON public.analyses(input_hash);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_followup_messages_thread_id ON public.followup_messages(thread_id);
