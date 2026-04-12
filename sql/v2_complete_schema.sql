-- ============================================================
-- 논문분석기 v2 완전 스키마
-- 기반: 출석보상형 무료제 + 기간제 유료이용권 + 토스 일반결제
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. usage_wallets: 무료 업로드 잔여 횟수 지갑
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_wallets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     INT NOT NULL DEFAULT 0,  -- 현재 사용 가능한 횟수
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
-- 2. usage_transactions: 횟수 변동 내역 로그
-- ─────────────────────────────────────────────
CREATE TYPE usage_tx_type AS ENUM (
  'WELCOME',           -- 가입 환영 보너스 (현재는 0)
  'ATTENDANCE_REWARD', -- 출석 3회마다 +2
  'MONTHLY_EVENT',     -- 출석 15회 달성 +5 (월말 만료)
  'USE_UPLOAD',        -- 논문 분석 차감 -1
  'EXPIRE',            -- 만료 처리
  'MANUAL'             -- 운영자 수동 지급
);

CREATE TABLE IF NOT EXISTS usage_transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        usage_tx_type NOT NULL,
  amount      INT NOT NULL,             -- 양수=지급, 음수=차감
  expires_at  TIMESTAMPTZ,              -- 이벤트 보너스 등 만료시각 (null=영구)
  meta        JSONB DEFAULT '{}',       -- 추가 정보 (milestone, orderId 등)
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 3. attendance_logs: 출석 기록
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attended_date   DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, attended_date)
);

-- ─────────────────────────────────────────────
-- 4. monthly_reward_grants: 월별 보상 지급 추적 (중복 방지)
--    milestone: 3, 6, 9, 12 (3회 단위) or 15 (이벤트)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_reward_grants (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month       CHAR(7) NOT NULL,   -- 'YYYY-MM'
  milestone   INT NOT NULL,       -- 3, 6, 9, 12, 15
  granted_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month, milestone)
);

-- ─────────────────────────────────────────────
-- 5. subscriptions: 유료 이용권
-- ─────────────────────────────────────────────
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'canceled');

CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     TEXT NOT NULL,            -- 'monthly' | 'quarterly' | 'biannual'
  start_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at      TIMESTAMPTZ NOT NULL,
  status      subscription_status NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 6. orders: 결제 주문 (결제 요청 전 서버에서 생성)
-- ─────────────────────────────────────────────
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'canceled');

CREATE TABLE IF NOT EXISTS orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        TEXT NOT NULL UNIQUE,   -- 토스 주문번호 (서버 생성)
  plan_id         TEXT NOT NULL,
  amount          INT NOT NULL,
  status          order_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 7. payments: 토스 결제 승인 결과 저장
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        TEXT NOT NULL REFERENCES orders(order_id),
  toss_payment_key TEXT NOT NULL UNIQUE,
  amount          INT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'done',
  plan_id         TEXT NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  raw_response    JSONB,                -- 토스 API 전체 응답 저장
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 8. profiles 테이블 컬럼 추가/정리
--    (기존 테이블에 없는 컬럼만 추가)
-- ─────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_guest_used BOOLEAN DEFAULT FALSE; -- 비회원 1회 사용 여부 (로컬과 병행)

-- ─────────────────────────────────────────────
-- 9. RLS 정책
-- ─────────────────────────────────────────────
ALTER TABLE usage_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reward_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- usage_wallets: 본인만 읽기
CREATE POLICY "wallets_select_own" ON usage_wallets FOR SELECT USING (auth.uid() = user_id);

-- usage_transactions: 본인만 읽기
CREATE POLICY "tx_select_own" ON usage_transactions FOR SELECT USING (auth.uid() = user_id);

-- attendance_logs: 본인만 읽기
CREATE POLICY "attendance_select_own" ON attendance_logs FOR SELECT USING (auth.uid() = user_id);

-- subscriptions: 본인만 읽기
CREATE POLICY "sub_select_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- orders: 본인만 읽기
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 10. 신규 가입자 자동 지갑 생성 트리거
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_usage_wallet_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO usage_wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_profile_create_wallet ON profiles;
CREATE TRIGGER on_new_profile_create_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_usage_wallet_for_new_user();

-- ─────────────────────────────────────────────
-- 11. 기존 사용자 지갑 초기화 (마이그레이션용)
--     기존 profiles의 bonus_uses 값을 지갑으로 이전
-- ─────────────────────────────────────────────
INSERT INTO usage_wallets (user_id, balance)
SELECT id, COALESCE(bonus_uses, 0)
FROM profiles
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;

-- ─────────────────────────────────────────────
-- 12. 기존 daily_checkins → attendance_logs 마이그레이션
-- ─────────────────────────────────────────────
INSERT INTO attendance_logs (user_id, attended_date, created_at)
SELECT user_id, checked_in_date::DATE, created_at
FROM daily_checkins
ON CONFLICT (user_id, attended_date) DO NOTHING;
