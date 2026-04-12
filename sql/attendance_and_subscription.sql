-- ================================================================
-- 출석 보너스 + 구독 플랜 스키마 추가 (v2)
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

-- profiles 테이블 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,        -- 'monthly' | 'quarterly' | 'biannual'
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bonus_uses INTEGER DEFAULT 0,  -- 출석 보너스 남은 추가 횟수
  ADD COLUMN IF NOT EXISTS event_bonus_month DATE;        -- 15회 이벤트 지급된 월 (중복 방지)

-- payments 테이블에 구독 관련 컬럼 추가
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS toss_payment_key TEXT,         -- 토스페이먼츠 paymentKey
  ADD COLUMN IF NOT EXISTS toss_order_id TEXT,            -- 토스페이먼츠 orderId
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_months INTEGER,   -- 1 | 3 | 6
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;        -- 구독 만료일

-- daily_checkins 테이블 (이미 있으면 무시)
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_date DATE NOT NULL,
  credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  UNIQUE(user_id, checked_in_date)
);
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
CREATE POLICY "Users can view own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checkins" ON public.daily_checkins;
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON public.daily_checkins(user_id, checked_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end ON public.profiles(subscription_end);

