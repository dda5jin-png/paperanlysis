-- ==========================================
-- 논문분석기 버그 픽스 SQL (2025 v3.1)
-- Supabase SQL Editor에서 전체 실행하세요.
-- ==========================================

-- 1. profiles 테이블이 없을 경우 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user',
    is_exempt BOOLEAN DEFAULT FALSE,
    is_free_whitelist BOOLEAN DEFAULT FALSE,
    free_daily_limit INTEGER DEFAULT 3,
    paid_plan TEXT DEFAULT NULL,
    credits INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. 기존 profiles에 SaaS 컬럼이 없으면 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_free_whitelist BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_daily_limit INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paid_plan TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 자신의 프로필 조회 허용
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);
    END IF;
END $$;

-- 5. RLS 정책: 자신의 프로필 수정 허용
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id);
    END IF;
END $$;

-- 6. RLS 정책: 서비스 롤(admin)은 모든 프로필 접근 허용 (API 서버에서 사용)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can manage all profiles') THEN
        CREATE POLICY "Service role can manage all profiles"
        ON public.profiles FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 7. 신규 가입자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, credits, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        'user',
        5,     -- 가입 즉시 5 크레딧 보너스
        TRUE
    )
    ON CONFLICT (id) DO NOTHING; -- 이미 있으면 무시
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 신규 가입자 트리거 등록
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. 기존 auth.users 중 profiles 없는 유저 일괄 생성 (기존 가입자 보정)
INSERT INTO public.profiles (id, email, role, credits, is_active)
SELECT
    u.id,
    u.email,
    'user',
    5,
    TRUE
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- papers 테이블 컬럼 보정
-- (papers/route.ts 에서 file_hash, model_id, model_name 사용)
-- ==========================================
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS file_hash TEXT;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS model_id TEXT;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS model_name TEXT;

-- ==========================================
-- analyses 테이블 컬럼 보정
-- (papers/route.ts 에서 사용하는 컬럼 추가)
-- ==========================================
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS content JSONB;

-- analyses INSERT 정책 (서버에서 삽입 가능하도록)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analyses' AND policyname = 'Users can insert their own analyses') THEN
        CREATE POLICY "Users can insert their own analyses"
        ON public.analyses FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- usage_logs INSERT 정책
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_logs' AND policyname = 'Users can insert their own usage_logs') THEN
        CREATE POLICY "Users can insert their own usage_logs"
        ON public.usage_logs FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- payments INSERT 정책
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can insert their own payments') THEN
        CREATE POLICY "Users can insert their own payments"
        ON public.payments FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ==========================================
-- Storage: papers 버킷 RLS 확인용 정책
-- (이미 있으면 무시됨)
-- ==========================================
-- Supabase Dashboard > Storage > papers 버킷 > Policies 에서
-- 아래 정책이 없으면 직접 추가하세요:
-- INSERT: auth.uid() IS NOT NULL  (로그인 사용자 업로드 허용)
-- SELECT: auth.uid() IS NOT NULL  (로그인 사용자 다운로드 허용)
-- DELETE: auth.uid() IS NOT NULL  (로그인 사용자 삭제 허용)

SELECT 'SQL 적용 완료! 이제 회원가입한 사용자의 프로필이 자동 생성됩니다.' AS result;
