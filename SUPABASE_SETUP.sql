-- 1. 'papers' 테이블 생성
CREATE TABLE public.papers (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    title TEXT NOT NULL,
    authors TEXT[] DEFAULT '{}',
    year TEXT,
    introduction JSONB NOT NULL,
    methodology JSONB NOT NULL,
    conclusion JSONB NOT NULL,
    domain_keywords JSONB DEFAULT '[]',
    model_id TEXT,
    model_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Row Level Security (RLS) 활성화
-- 활성화하면 본인의 데이터만 접근 가능하게 됩니다.
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 설정 (Policies)

-- [조회] 본인의 논문만 볼 수 있음
CREATE POLICY "Users can view their own papers" 
ON public.papers FOR SELECT 
USING (auth.uid() = user_id);

-- [추가/수정] 본인의 논문만 추가하거나 수정할 수 있음
CREATE POLICY "Users can insert their own papers" 
ON public.papers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own papers" 
ON public.papers FOR UPDATE
USING (auth.uid() = user_id);

-- [삭제] 본인의 논문만 삭제할 수 있음
CREATE POLICY "Users can delete their own papers" 
ON public.papers FOR DELETE 
USING (auth.uid() = user_id);

-- 4. 인덱스 최적화 (검색 속도 향상)
CREATE INDEX idx_papers_user_id ON public.papers(user_id);
CREATE INDEX idx_papers_created_at ON public.papers(created_at DESC);
