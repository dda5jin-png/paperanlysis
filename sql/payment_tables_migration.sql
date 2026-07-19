-- ============================================================
-- 토스페이먼츠 실결제 연동을 위한 테이블 마이그레이션
-- Supabase SQL Editor에서 순서대로 실행하세요
-- ============================================================

-- ── 1. orders 테이블 (결제 요청 전 주문 생성) ───────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id    TEXT UNIQUE NOT NULL,          -- 토스에 전달하는 주문 ID (ORD-XXXX)
  plan_id     TEXT NOT NULL,                 -- 'monthly' | 'quarterly' | 'biannual'
  amount      INTEGER NOT NULL,              -- 결제 금액 (KRW)
  status      TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'cancelled'
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 본인 주문만 조회 가능
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can view own orders'
  ) THEN
    CREATE POLICY "Users can view own orders"
      ON public.orders FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 2. subscriptions 테이블 (결제 완료 후 이용권 활성화) ────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id     TEXT NOT NULL,                 -- 'monthly' | 'quarterly' | 'biannual'
  status      TEXT NOT NULL DEFAULT 'active', -- 'active' | 'expired' | 'cancelled'
  start_at    TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at      TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 본인 구독만 조회 가능
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Users can view own subscriptions'
  ) THEN
    CREATE POLICY "Users can view own subscriptions"
      ON public.subscriptions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 3. payments 테이블 재생성 (토스 결제 키/응답 저장용) ────
-- 기존 payments 테이블이 컬럼이 부족할 수 있으므로 DROP 후 재생성
-- (기존에 실결제 데이터가 없으면 안전합니다)
DROP TABLE IF EXISTS public.payments;

CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id          TEXT NOT NULL,            -- orders.order_id 참조
  toss_payment_key  TEXT UNIQUE NOT NULL,     -- 토스 paymentKey
  amount            INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'done', -- 'done' | 'cancelled' | 'partial_cancelled'
  plan_id           TEXT NOT NULL,
  subscription_id   UUID REFERENCES public.subscriptions(id),
  raw_response      JSONB,                    -- 토스 응답 전체 저장
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Users can view own payments'
  ) THEN
    CREATE POLICY "Users can view own payments"
      ON public.payments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── 4. updated_at 자동 갱신 트리거 (orders) ─────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 완료 확인 ────────────────────────────────────────────────
SELECT
  'orders'        AS table_name, COUNT(*) AS rows FROM public.orders
UNION ALL SELECT
  'subscriptions' AS table_name, COUNT(*) AS rows FROM public.subscriptions
UNION ALL SELECT
  'payments'      AS table_name, COUNT(*) AS rows FROM public.payments;
