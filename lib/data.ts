export type GuideCategory = {
  slug: string;
  name: string;
  desc: string;
};

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export type GuideArticle = {
  slug: string;
  category: string;
  title: string;
  lead: string;
  readingMinutes: number;
  updatedAt: string;
  author: string;
  body: GuideBlock[];
  related: string[];
};

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  priceSuffix: string;
  desc: string;
  features: string[];
  ctaLabel: string;
  highlight: boolean;
};

export type FaqItem = { q: string; a: string };

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { slug: "topic", name: "논문 주제 설정", desc: "분야별 주제 좁히기, 연구 공백 찾기" },
  { slug: "question", name: "연구문제 정의", desc: "좋은 연구문제의 조건과 예시" },
  { slug: "review", name: "선행연구 정리", desc: "문헌 정리, 리뷰 매트릭스 작성법" },
  { slug: "framework", name: "연구모형 설계", desc: "이론 기반 모형, 변수 관계 도식화" },
  { slug: "hypothesis", name: "가설 설정", desc: "방향·영가설, 검정 절차 개요" },
  { slug: "survey", name: "설문 설계", desc: "척도, 표본, 응답 편향 관리" },
  { slug: "stats", name: "통계 해석", desc: "회귀·요인분석·매개/조절 해석" },
  { slug: "writing", name: "논문 작성 순서", desc: "서론~결론, 투고 체크리스트" },
  { slug: "slides", name: "발표자료 정리", desc: "디펜스·학회 발표용 슬라이드" },
];

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "how-to-narrow-research-topic",
    category: "topic",
    title: "연구 주제를 좁히는 4단계: 관심 영역에서 연구문제까지",
    lead: "막연한 관심에서 출발해 구체적인 연구문제까지 도달하는 실무 절차를 정리합니다.",
    readingMinutes: 8,
    updatedAt: "2026-04-12",
    author: "편집팀",
    body: [
      { type: "p", text: '많은 연구자가 처음 주제를 잡을 때 "관심 분야"와 "연구문제"를 같은 것으로 착각합니다. 관심 분야는 "청년 고용"처럼 광범위한 영역이고, 연구문제는 "특정 산업에서 원격근무 도입이 2~3년차 개발자의 이직의도에 미치는 영향"처럼 변수와 대상이 명확한 질문입니다.' },
      { type: "h2", text: "1단계. 관심 영역을 3~5개로 쪼개기" },
      { type: "p", text: '관심 분야를 한 문장으로 쓰고, 그 안에 포함된 하위 영역을 최소 3개 이상 나열합니다. 이 단계의 목적은 "어느 하위 영역이 실제로 가장 재밌는지"를 드러내는 것입니다.' },
      { type: "h2", text: "2단계. 각 하위 영역의 선행연구를 빠르게 스캔" },
      { type: "p", text: '구글 스칼라에서 최근 5년 내, 인용 30회 이상 논문을 10편 정도 훑어봅니다. 목표는 "무엇이 이미 연구되었는가"를 아는 것이 아니라 "어떤 질문이 아직 남아있는가"를 찾는 것입니다.' },
      { type: "h3", text: "연구 공백(gap)의 네 가지 형태" },
      { type: "ul", items: [
        "대상 공백: 같은 질문을 다른 집단에는 적용하지 않음",
        "맥락 공백: 특정 산업·국가·시기에서만 검증됨",
        "방법 공백: 질적 또는 양적 방법 중 한 쪽만 사용됨",
        "이론 공백: 한 이론만으로 설명하고 다른 이론과의 통합이 없음",
      ]},
      { type: "h2", text: "3단계. 변수와 대상 명시하기" },
      { type: "p", text: "좋은 연구문제에는 (1) 독립·종속 변수, (2) 대상 집단, (3) 맥락이 모두 드러나야 합니다. 이 중 하나라도 빠지면 다음 단계에서 문헌 검색과 연구 설계가 모호해집니다." },
      { type: "h2", text: "4단계. 지도교수·동료 피드백으로 검증" },
      { type: "p", text: '최종 연구문제 후보 2~3개를 정리해 지도교수와 논의합니다. 이때 "어떤 데이터로 검증할 수 있는가"라는 질문을 먼저 통과해야 합니다. 데이터 확보가 현실적이지 않은 문제는, 아무리 학술적으로 흥미로워도 논문으로 완성되기 어렵습니다.' },
      { type: "quote", text: "관심 영역을 쪼개고, 공백을 찾고, 변수와 대상을 박아 넣는 순서를 지키세요. 이 순서만 지켜도 주제 설정 기간이 평균 절반으로 줄어듭니다." },
    ],
    related: ["define-research-question", "literature-matrix"],
  },
  {
    slug: "define-research-question",
    category: "question",
    title: "좋은 연구문제의 조건: FINER 프레임워크로 점검하기",
    lead: "Feasible, Interesting, Novel, Ethical, Relevant. 연구문제 초안을 평가하는 다섯 기준을 실제 예시와 함께 살펴봅니다.",
    readingMinutes: 6,
    updatedAt: "2026-04-09",
    author: "편집팀",
    body: [
      { type: "p", text: "FINER 프레임워크는 의학 연구 방법론에서 유래했지만, 사회과학·경영·교육 등 대부분의 분야에서 연구문제의 품질을 점검하는 데 사용할 수 있습니다. 다섯 개의 기준을 통과하지 못한 연구문제는 본 연구를 시작하기 전에 반드시 재검토해야 합니다." },
      { type: "h2", text: "Feasible — 실행 가능한가" },
      { type: "p", text: '연구 대상의 규모, 데이터 접근성, 분석에 필요한 기간, 예산을 현실적으로 산정합니다. 학위논문의 경우 "1학기 안에 데이터 수집이 완료될 수 있는가"를 가장 먼저 검증해야 합니다.' },
      { type: "h2", text: "Interesting — 학술적으로 흥미로운가" },
      { type: "p", text: '연구자 본인뿐 아니라, 지도교수와 동료 연구자가 "결과가 궁금하다"고 말할 수 있어야 합니다. 여기서 말하는 흥미는 감정적 끌림이 아니라, 기존 이론을 확장하거나 반박할 여지가 있는가의 문제입니다.' },
      { type: "h2", text: "Novel — 새로운가" },
      { type: "p", text: '완전히 새로운 주제일 필요는 없습니다. 기존 연구를 다른 대상·맥락·방법으로 확장하는 것도 novelty입니다. 다만 "누가 이미 했다"로 끝나면 안 되고, "기존 연구와 어떤 점에서 다른가"를 한 문장으로 설명할 수 있어야 합니다.' },
      { type: "h2", text: "Ethical — 윤리적으로 문제가 없는가" },
      { type: "p", text: "특히 인간 대상 연구는 기관생명윤리위원회(IRB) 승인을 받을 수 있는 설계인지 사전에 점검합니다. 민감 정보 수집, 취약 집단 모집, 이해관계 상충 여부를 확인합니다." },
      { type: "h2", text: "Relevant — 현실적 의의가 있는가" },
      { type: "p", text: '실무자·정책결정자·교육 현장 중 최소 한 집단에 유의미한 시사점을 제공할 수 있어야 합니다. "이 연구가 끝난 뒤 누가 그 결과를 읽을 이유가 있는가"를 스스로 답해보세요.' },
    ],
    related: ["how-to-narrow-research-topic", "literature-matrix"],
  },
  {
    slug: "literature-matrix",
    category: "review",
    title: "문헌 리뷰 매트릭스 만들기: 스프레드시트 한 장으로 선행연구 정리",
    lead: '50편의 논문을 읽고 나서 "무엇을 읽었는지 기억나지 않는" 문제를 예방하는 실무 도구.',
    readingMinutes: 7,
    updatedAt: "2026-04-03",
    author: "편집팀",
    body: [
      { type: "p", text: "선행연구 정리의 품질은 논문 전체의 논리 구조를 결정합니다. 단순히 논문 제목과 초록을 모으는 것이 아니라, 각 논문이 어떤 변수를 어떤 방법으로 분석했고 어떤 결과를 얻었는지 한 눈에 비교할 수 있도록 표로 정리해야 합니다." },
      { type: "h2", text: "리뷰 매트릭스의 최소 구성 컬럼" },
      { type: "ul", items: [
        "저자 · 연도 · 저널",
        "연구 대상 (표본, 산업, 국가)",
        "독립변수 · 종속변수 · 통제변수",
        "사용한 방법론 (설계, 통계 기법)",
        "주요 결과 (1~2문장)",
        "한계 및 후속 연구 제언",
        "본 연구와의 관계 (어떤 점에서 참고할 것인가)",
      ]},
      { type: "h2", text: "매트릭스 작성 시 주의점" },
      { type: "p", text: '처음 10편 정도를 정리할 때는 각 칸을 지나치게 길게 쓰지 마세요. "훑어보기 위한 도구"라는 본질이 무너집니다. 각 셀은 50자 이내를 목표로 합니다. 깊이 있는 해석은 별도 노트에 분리해서 관리하는 편이 좋습니다.' },
      { type: "h2", text: "매트릭스를 읽을 때" },
      { type: "p", text: '완성된 매트릭스를 세로로 훑으면서 "공통된 가정", "반복되는 한계", "누락된 변수"를 찾습니다. 이 시점에서 본 연구의 기여점이 자연스럽게 드러납니다.' },
    ],
    related: ["define-research-question", "how-to-narrow-research-topic"],
  },
  {
    slug: "regression-interpretation",
    category: "stats",
    title: "회귀분석 결과표 읽는 법: 계수, 표준오차, p값의 의미",
    lead: "통계 수업이 오래됐더라도 결과표를 스스로 해석할 수 있도록 핵심만 정리합니다.",
    readingMinutes: 9,
    updatedAt: "2026-03-28",
    author: "편집팀",
    body: [
      { type: "p", text: "회귀분석 결과표는 항상 같은 구조를 가집니다. 변수명, 비표준화 계수(B), 표준오차(SE), 표준화 계수(β), t값, p값, 그리고 모형 적합도 지표(R², F, VIF 등). 각 숫자가 무엇을 의미하는지 안다면 논문 심사와 학위 디펜스에서 훨씬 자신 있게 대응할 수 있습니다." },
      { type: "h2", text: "비표준화 계수 B" },
      { type: "p", text: '독립변수가 1 단위 증가할 때 종속변수가 얼마나 변하는지를 원래 단위로 나타냅니다. 실무적 의미를 해석할 때 유용합니다. 예를 들어 "근무시간이 1시간 늘어날 때 이직의도 점수가 0.12점 증가"처럼 말할 수 있습니다.' },
      { type: "h2", text: "표준화 계수 β" },
      { type: "p", text: "단위를 제거한 값이라 변수 간 상대적 영향력을 비교할 때 사용합니다. |β|가 클수록 상대적 영향이 크다고 해석합니다. 논문 본문에서는 B와 β를 모두 보고하되, 해석 문장은 β 중심으로 쓰는 경우가 많습니다." },
      { type: "h2", text: "p값" },
      { type: "p", text: "해당 계수가 0이라는 귀무가설을 기각할 수 있는 증거의 강도입니다. 통상 .05를 기준으로 유의성을 판단하지만, .05/.01/.001 세 단계로 별표를 표기하는 것이 더 일반적입니다. p값만 보고 효과의 크기를 판단하면 안 됩니다." },
      { type: "h2", text: "모형 적합도 — R², F, VIF" },
      { type: "p", text: "R²는 설명된 분산 비율, F는 모형 전체의 유의성, VIF는 다중공선성 지표입니다. VIF가 10을 넘으면 변수 간 중복이 심각하다고 판단해 변수 선정을 재검토합니다." },
    ],
    related: ["hypothesis-setting", "survey-design-basics"],
  },
  {
    slug: "hypothesis-setting",
    category: "hypothesis",
    title: "가설 설정의 세 가지 원칙: 방향성, 이론 근거, 검정 가능성",
    lead: "가설은 직관이 아니라 이론에서 도출해야 합니다. 실제 논문 예시와 함께 살펴봅니다.",
    readingMinutes: 6,
    updatedAt: "2026-03-21",
    author: "편집팀",
    body: [
      { type: "p", text: '가설은 연구문제를 통계적으로 검증 가능한 형태로 바꾼 것입니다. 좋은 가설은 항상 이론적 근거가 선행되며, 단순히 "영향을 미친다"가 아니라 "어느 방향으로, 어떤 이유로 영향을 미치는지" 명시합니다.' },
      { type: "h2", text: "원칙 1. 방향성을 명시한다" },
      { type: "p", text: '"X는 Y에 영향을 미친다"는 약한 가설입니다. "X가 증가할수록 Y는 증가한다" 또는 "X 집단의 Y가 비X 집단보다 높다"와 같이 방향을 제시해야 검정 결과를 명확하게 해석할 수 있습니다.' },
      { type: "h2", text: "원칙 2. 이론적 근거를 제시한다" },
      { type: "p", text: '가설 바로 앞 문단에서 왜 그런 방향성을 예상하는지 이론으로 설명합니다. 직관이나 "그렇게 보인다"만으로 세운 가설은 논문 심사에서 가장 많이 지적되는 부분입니다.' },
      { type: "h2", text: "원칙 3. 데이터로 검정 가능해야 한다" },
      { type: "p", text: '가설의 용어가 측정 가능한 개념으로 정의되어야 합니다. "조직 분위기가 좋을수록"처럼 측정 척도가 없는 표현 대신, "조직지원인식(POS) 점수가 높을수록" 같은 구체적 표현을 사용합니다.' },
    ],
    related: ["regression-interpretation", "survey-design-basics"],
  },
  {
    slug: "survey-design-basics",
    category: "survey",
    title: "설문 설계의 기초: 척도 선택부터 응답 편향 관리까지",
    lead: "설문 설계의 실수는 분석 단계에서 회복이 거의 불가능합니다. 설계 단계에서 점검할 체크리스트를 정리합니다.",
    readingMinutes: 8,
    updatedAt: "2026-03-14",
    author: "편집팀",
    body: [
      { type: "p", text: "설문은 도구가 먼저가 아니라 측정하려는 개념(construct)이 먼저입니다. 개념을 명확히 정의한 뒤, 그 개념을 측정한 선행연구의 척도를 그대로 가져오거나 최소한의 수정만 가하는 것이 안전합니다." },
      { type: "h2", text: "척도 선택" },
      { type: "p", text: "리커트 5점 vs 7점은 연구 분야의 관행과 선행연구를 따르는 것이 좋습니다. 분석 시 상관·회귀에서 큰 차이는 없지만, 문항 내적일관성을 비교할 때 기준을 맞춰주면 해석이 깔끔합니다." },
      { type: "h2", text: "공통방법편향(CMB) 관리" },
      { type: "p", text: "동일 응답자에게 독립변수와 종속변수를 함께 묻는 설계는 공통방법편향에 취약합니다. 시점을 분리하거나, 응답자를 달리하거나, 최소한 Harman의 단일요인 검정을 통해 편향 정도를 보고해야 합니다." },
      { type: "h2", text: "표본 크기" },
      { type: "p", text: "회귀분석 기준 최소 10~20 × 독립변수 수를 권장합니다. 구조방정식(SEM)은 200명 이상이 관행이며, 경로 복잡도가 높을수록 더 큰 표본이 필요합니다." },
    ],
    related: ["regression-interpretation", "hypothesis-setting"],
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "0원",
    priceSuffix: "",
    desc: "간단한 체험, 핵심 기능 확인",
    features: ["월 3회 분석", "기본 섹션 요약", "결과 7일 보관"],
    ctaLabel: "지금 시작",
    highlight: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: "9,900원",
    priceSuffix: "/월",
    desc: "학위논문, 정기 리뷰에 적합",
    features: [
      "월 30회 분석",
      "섹션별 상세 요약",
      "발표자료용 요약",
      "내 서고 무제한 보관",
      "관련 가이드 추천",
    ],
    ctaLabel: "Standard 시작",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "19,900원",
    priceSuffix: "/월",
    desc: "연구실, 그룹 리서치",
    features: [
      "월 150회 분석",
      "구조화 템플릿 맞춤",
      "내보내기(Word/PDF)",
      "우선 분석 큐",
      "팀 공유 링크",
    ],
    ctaLabel: "Pro 시작",
    highlight: false,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  { q: "어떤 형식의 파일을 올릴 수 있나요?", a: "텍스트 추출이 가능한 PDF 파일을 기준으로 합니다. 스캔본 이미지 PDF는 정확도가 떨어질 수 있으며, 한국어·영어 논문을 지원합니다." },
  { q: "분석 결과의 정확도는 어느 정도인가요?", a: "섹션 구조가 명확한 학술 논문(IMRaD 구조)에서 섹션 구분과 요약의 일치도가 가장 높습니다. 분야와 논문 길이에 따라 차이가 있을 수 있으므로, 결과는 참고 자료로 활용하고 최종 인용·해석은 직접 원문을 확인하시길 권장합니다." },
  { q: "분석 결과를 저장할 수 있나요?", a: '로그인한 사용자는 "내 서고"에 결과를 영구 보관할 수 있으며, 요금제에 따라 보관 한도가 다릅니다.' },
  { q: "요금은 언제 청구되나요?", a: "결제는 Toss Payments로 처리되며, 월간 요금제는 결제일 기준 매월 동일 날짜에 자동 청구됩니다. 해지는 마이페이지에서 언제든 가능합니다." },
  { q: "결제 후 환불이 가능한가요?", a: "결제일로부터 7일 이내이며 서비스 이용 이력이 없는 경우 전액 환불이 가능합니다. 상세 조건은 환불 정책 페이지를 참고해주세요." },
  { q: "논문 내용이 외부에 공개되지는 않나요?", a: "업로드된 파일과 분석 결과는 이용자 본인에게만 노출되며, 다른 이용자에게 공개되지 않습니다. 상세 사항은 개인정보처리방침을 참고해주세요." },
];
