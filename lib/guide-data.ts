export type LocalizedText = {
  ko: string;
  en: string;
};

export type GuideCategory = {
  slug: string;
  name: string;
  desc: string;
  seoTitle: string;
};

export type ArchiveSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  sourceType: "institution" | "style-guide" | "library-guide" | "academic-database" | "government";
  language: "en" | "ko";
  authorityNote: string;
  checkedAt: string;
};

export type GuideSection = {
  heading: string;
  content: string[];
};

export type GuideArticle = {
  slug: string;
  category: string;
  title: string;
  lead: string;
  summary: string;
  tags: string[];
  readingMinutes: number;
  updatedAt: string;
  author: string;
  trustScore: number;
  popularity: number;
  sourceIds: string[];
  translationNotice: string;
  bilingualTitle: LocalizedText;
  contentTemplate: {
    oneLineSummary: LocalizedText;
    whenToUse: GuideSection;
    coreConcepts: GuideSection;
    practicalSteps: GuideSection;
    commonMistakes: GuideSection;
    checklist: string[];
  };
  body: GuideSection[];
  related: string[];
  relatedPapers: {
    title: string;
    source: string;
    url: string;
  }[];
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
  {
    slug: "topic",
    name: "주제 설정",
    desc: "관심 분야를 연구 가능한 논문 주제로 좁히는 방법",
    seoTitle: "논문 주제 설정 가이드",
  },
  {
    slug: "literature-review",
    name: "선행연구 조사",
    desc: "문헌 검색, 리뷰 매트릭스, 연구 공백 정리",
    seoTitle: "선행연구 조사 및 문헌 리뷰 가이드",
  },
  {
    slug: "research-question",
    name: "연구질문",
    desc: "좋은 연구질문의 조건과 검증 가능한 질문 만들기",
    seoTitle: "연구질문 설정 가이드",
  },
  {
    slug: "methodology",
    name: "연구설계 / 방법론",
    desc: "질적·양적·혼합 연구와 연구설계 선택 기준",
    seoTitle: "연구방법론 선택 가이드",
  },
  {
    slug: "data-analysis",
    name: "데이터 분석",
    desc: "분석 계획, 결과 해석, 재현 가능한 분석 정리",
    seoTitle: "논문 데이터 분석 가이드",
  },
  {
    slug: "paper-structure",
    name: "논문 구조 작성",
    desc: "서론, 방법, 결과, 논의 섹션의 역할과 작성 순서",
    seoTitle: "논문 구조 작성 가이드",
  },
  {
    slug: "citation",
    name: "인용 / 참고문헌",
    desc: "본문 인용, 참고문헌 목록, APA 기본 원칙",
    seoTitle: "참고문헌 작성 및 인용 가이드",
  },
  {
    slug: "presentation",
    name: "발표자료 / PPT",
    desc: "학회 발표, 심사 발표, 디펜스 슬라이드 구성",
    seoTitle: "논문 발표자료 PPT 구성 가이드",
  },
];

export const ARCHIVE_SOURCES: ArchiveSource[] = [
  {
    id: "purdue-topic",
    title: "Choosing a Topic",
    organization: "Purdue Online Writing Lab",
    url: "https://owl.purdue.edu/owl/general_writing/common_writing_assignments/research_papers/choosing_a_topic.html",
    sourceType: "institution",
    language: "en",
    authorityNote: "Purdue University가 운영하는 대표적인 학술 글쓰기 교육 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "purdue-literature-review",
    title: "Writing a Literature Review",
    organization: "Purdue Online Writing Lab",
    url: "https://owl.purdue.edu/owl/research_and_citation/conducting_research/writing_a_literature_review.html",
    sourceType: "institution",
    language: "en",
    authorityNote: "문헌 리뷰의 목적, 조직 방식, 종합적 읽기를 설명하는 대학 글쓰기 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "fairfield-research-question",
    title: "Develop a Research Question",
    organization: "Fairfield University DiMenna-Nyselius Library",
    url: "https://librarybestbets.fairfield.edu/researchquestion",
    sourceType: "library-guide",
    language: "en",
    authorityNote: "대학 도서관이 제공하는 연구질문 브레인스토밍 및 검토 가이드입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "nih-study-design",
    title: "Choosing a Study Design",
    organization: "National Institutes of Health VideoCast",
    url: "https://videocast.nih.gov/watch=52244",
    sourceType: "government",
    language: "en",
    authorityNote: "NIH 임상연구 교육 과정의 연구설계 선택 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "nih-library-study-design",
    title: "Overview of Study Design",
    organization: "NIH Library",
    url: "https://www.nihlibrary.nih.gov/training/overview-study-design",
    sourceType: "government",
    language: "en",
    authorityNote: "NIH Library가 제공하는 생의학 연구설계 교육 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "apa-reference-list",
    title: "Reference List: Basic Rules",
    organization: "Purdue Online Writing Lab",
    url: "https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/reference_list_basic_rules.html",
    sourceType: "style-guide",
    language: "en",
    authorityNote: "APA 7판 참고문헌 기본 규칙을 설명하는 학술 인용 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "apa-style-references",
    title: "Reference examples",
    organization: "APA Style",
    url: "https://apastyle.apa.org/style-grammar-guidelines/references/examples",
    sourceType: "style-guide",
    language: "en",
    authorityNote: "American Psychological Association의 공식 참고문헌 예시 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "umw-presentation-slides",
    title: "Creating Effective Presentation Slides",
    organization: "University of Mary Washington Speaking and Writing Center",
    url: "https://academics.umw.edu/swc/files/2024/02/Creating-Effective-Presentation-Slides-2.pdf",
    sourceType: "institution",
    language: "en",
    authorityNote: "대학 글쓰기·발표 센터가 제공하는 발표 슬라이드 작성 자료입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "openalex",
    title: "OpenAlex API",
    organization: "OpenAlex",
    url: "https://docs.openalex.org/",
    sourceType: "academic-database",
    language: "en",
    authorityNote: "논문, 저자, 기관, 개념 메타데이터를 제공하는 공개 학술 그래프입니다.",
    checkedAt: "2026-04-22",
  },
  {
    id: "semantic-scholar",
    title: "Semantic Scholar Academic Graph API",
    organization: "Semantic Scholar",
    url: "https://api.semanticscholar.org/api-docs/",
    sourceType: "academic-database",
    language: "en",
    authorityNote: "논문 메타데이터, 인용 관계, 초록 정보를 제공하는 학술 검색 API입니다.",
    checkedAt: "2026-04-22",
  },
];

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "how-to-choose-research-topic",
    category: "topic",
    title: "논문 주제 설정 방법: 관심사에서 연구 가능한 질문으로 좁히기",
    lead: "막연한 관심 분야를 학위논문이나 학술논문으로 완성 가능한 주제로 바꾸는 단계별 절차입니다.",
    summary: "좋은 논문 주제는 흥미로운 주제가 아니라, 자료 접근 가능성·범위·연구 공백·방법론이 함께 맞는 질문입니다.",
    tags: ["논문 주제", "연구 공백", "주제 좁히기", "학위논문"],
    readingMinutes: 11,
    updatedAt: "2026-04-22",
    author: "Paper Analysis Editorial Team",
    trustScore: 92,
    popularity: 98,
    sourceIds: ["purdue-topic", "openalex"],
    translationNotice: "Purdue OWL의 연구 주제 선택 원칙을 직접 번역하지 않고, 한국어 논문 작성 맥락에 맞게 재구성했습니다.",
    bilingualTitle: {
      ko: "논문 주제 설정 방법",
      en: "How to choose and narrow a research topic",
    },
    contentTemplate: {
      oneLineSummary: {
        ko: "논문 주제는 관심사, 자료 접근성, 선행연구 공백, 연구방법의 네 조건이 만나는 지점에서 정해야 합니다.",
        en: "A research topic should sit at the intersection of interest, source availability, research gap, and feasible method.",
      },
      whenToUse: {
        heading: "언제 필요한가",
        content: [
          "학위논문 계획서를 쓰기 전, 연구실 세미나에서 주제 후보를 발표하기 전, 혹은 지도교수에게 첫 연구 아이디어를 보내기 전에 사용합니다.",
          "특히 ‘AI와 교육’, ‘청년 고용’, ‘조직문화’처럼 범위가 큰 키워드만 있는 상태라면 이 가이드를 먼저 적용해야 합니다.",
        ],
      },
      coreConcepts: {
        heading: "핵심 개념",
        content: [
          "관심 분야와 연구 주제는 다릅니다. 관심 분야는 넓은 지형이고, 연구 주제는 그 안에서 실제 자료를 모으고 분석할 수 있는 좁은 문제입니다.",
          "좋은 주제는 새로움만으로 결정되지 않습니다. 이미 연구된 내용과의 차이, 연구 대상의 구체성, 분석 가능한 자료, 윤리적 위험까지 함께 검토해야 합니다.",
        ],
      },
      practicalSteps: {
        heading: "실무 적용 방법",
        content: [
          "먼저 관심 분야를 5개 이하의 하위 주제로 나눕니다. 그다음 각 하위 주제에 대해 최근 5년 논문 10편을 검색해 반복되는 키워드, 대상, 방법, 한계를 표로 정리합니다.",
          "후보 주제마다 ‘누구를 대상으로’, ‘어떤 현상을’, ‘어떤 방법으로’, ‘왜 지금 연구해야 하는지’를 한 문장으로 씁니다. 이 문장이 길어질수록 주제는 아직 덜 좁혀진 것입니다.",
          "마지막으로 데이터 접근성을 확인합니다. 설문 응답자, 인터뷰 대상자, 공개 데이터, 실험 환경 중 하나라도 현실적으로 확보할 수 있어야 논문으로 완성됩니다.",
        ],
      },
      commonMistakes: {
        heading: "자주 하는 실수",
        content: [
          "가장 흔한 실수는 ‘요즘 뜨는 주제’를 그대로 고르는 것입니다. 유행 키워드는 참고점일 뿐, 연구질문과 자료 계획이 없으면 논문 주제가 아닙니다.",
          "두 번째 실수는 범위를 넓게 유지하는 것입니다. ‘한국 대학생의 학습 경험’보다 ‘생성형 AI 사용 경험이 전공 글쓰기 자기효능감에 미치는 영향’이 연구 가능한 주제에 가깝습니다.",
        ],
      },
      checklist: [
        "주제를 한 문장 질문으로 바꿀 수 있다.",
        "연구 대상과 맥락이 명확하다.",
        "최근 선행연구와 다른 지점이 있다.",
        "자료 수집 방법이 현실적이다.",
        "윤리적 위험이나 개인정보 이슈를 설명할 수 있다.",
      ],
    },
    body: [
      {
        heading: "주제 설정은 ‘좁히기’보다 ‘검증하기’에 가깝습니다",
        content: [
          "논문 주제를 정할 때 많은 사람이 브레인스토밍을 오래 하지만, 실제로 중요한 것은 후보를 빠르게 검증하는 일입니다. 관심 있는 영역을 넓게 펼친 뒤, 각 후보가 연구 가능한 조건을 갖췄는지 하나씩 걸러내야 합니다.",
          "이 과정에서 주제의 매력보다 자료의 확보 가능성이 먼저입니다. 자료를 구할 수 없는 주제는 아무리 흥미로워도 연구 설계 단계에서 멈춥니다. 반대로 자료가 있고 선행연구의 빈틈이 보이는 주제는 작은 아이디어라도 강한 논문으로 발전할 수 있습니다.",
        ],
      },
      {
        heading: "선행연구 검색은 초반부터 병행합니다",
        content: [
          "주제를 정한 뒤 문헌을 찾는 방식은 비효율적입니다. 주제 후보를 좁히는 과정 자체가 문헌 검색이어야 합니다. OpenAlex, Semantic Scholar, Google Scholar 같은 검색 도구에서 핵심 키워드를 바꿔가며 어떤 연구가 반복되고 무엇이 비어 있는지 확인합니다.",
          "초기 검색에서는 논문을 정독하지 않아도 됩니다. 제목, 초록, 연구대상, 방법, 한계만 빠르게 훑으면서 후보 주제의 위치를 확인합니다. 이때 발견한 용어가 이후 검색어와 제목 표현의 재료가 됩니다.",
        ],
      },
      {
        heading: "연구 공백은 네 가지 방식으로 찾습니다",
        content: [
          "대상 공백은 같은 질문을 다른 집단에 적용하지 않은 경우입니다. 맥락 공백은 특정 국가, 산업, 시기에서 아직 검증되지 않은 경우입니다. 방법 공백은 양적 연구가 많지만 질적 설명이 부족하거나, 반대로 질적 사례는 많지만 일반화 가능한 분석이 부족한 경우입니다.",
          "이론 공백은 기존 연구가 특정 이론 하나에만 기대고 있을 때 나타납니다. 이 경우 다른 이론과 연결하거나, 같은 현상을 다른 개념으로 설명해볼 수 있습니다. 다만 공백을 주장할 때는 반드시 실제 출처와 검색 결과를 남겨야 합니다.",
        ],
      },
    ],
    related: ["how-to-set-research-question", "how-to-conduct-literature-review"],
    relatedPapers: [
      {
        title: "OpenAlex Works search",
        source: "OpenAlex",
        url: "https://docs.openalex.org/api-entities/works/search-works",
      },
    ],
  },
  {
    slug: "how-to-conduct-literature-review",
    category: "literature-review",
    title: "선행연구 조사 방법: 검색에서 문헌 리뷰 매트릭스까지",
    lead: "논문을 많이 모으는 것에서 끝나지 않고, 연구 흐름과 공백을 설명하는 선행연구 조사 절차를 정리합니다.",
    summary: "선행연구 조사는 출처 수집, 선별, 비교, 종합, 공백 도출의 순서로 진행해야 논문 본문에 바로 연결됩니다.",
    tags: ["선행연구", "문헌 리뷰", "리뷰 매트릭스", "연구 공백"],
    readingMinutes: 12,
    updatedAt: "2026-04-22",
    author: "Paper Analysis Editorial Team",
    trustScore: 94,
    popularity: 95,
    sourceIds: ["purdue-literature-review", "semantic-scholar", "openalex"],
    translationNotice: "Purdue OWL의 문헌 리뷰 설명을 한국어 학위논문 작성 흐름에 맞춰 번역·요약·재구성했습니다.",
    bilingualTitle: {
      ko: "선행연구 조사 방법",
      en: "How to conduct a literature review",
    },
    contentTemplate: {
      oneLineSummary: {
        ko: "선행연구 조사는 논문을 나열하는 작업이 아니라, 기존 연구들이 서로 어떤 대화를 하고 있는지 구조화하는 작업입니다.",
        en: "A literature review is not a list of papers; it is a structured explanation of how existing studies relate to one another.",
      },
      whenToUse: {
        heading: "언제 필요한가",
        content: [
          "연구 주제가 정해진 직후, 연구계획서의 이론적 배경을 작성하기 전, 혹은 논문 서론에서 연구 필요성을 설명해야 할 때 사용합니다.",
          "이미 논문을 20편 이상 모았지만 ‘그래서 내 연구가 왜 필요한지’가 정리되지 않는 상황에도 적합합니다.",
        ],
      },
      coreConcepts: {
        heading: "핵심 개념",
        content: [
          "문헌 리뷰의 핵심은 종합입니다. 각 논문의 결론을 하나씩 요약하는 것이 아니라, 연구들이 어떤 흐름과 충돌, 반복, 한계를 보여주는지 연결해야 합니다.",
          "리뷰 매트릭스는 이 연결을 돕는 도구입니다. 저자, 연도, 표본, 방법, 핵심 결과, 한계, 본 연구와의 관련성을 한 표에 놓으면 공백이 눈에 보이기 시작합니다.",
        ],
      },
      practicalSteps: {
        heading: "실무 적용 방법",
        content: [
          "먼저 검색어를 한국어와 영어로 나눕니다. 주제 키워드, 대상 키워드, 방법 키워드, 이론 키워드를 조합해 검색식을 만듭니다.",
          "다음으로 포함·제외 기준을 정합니다. 예를 들어 최근 10년, 동료심사 논문, 특정 연구대상, 특정 방법론만 포함하는 식입니다.",
          "선정한 문헌은 매트릭스로 정리합니다. 1차 정리에서는 길게 쓰지 말고 비교 가능한 정보만 넣습니다. 이후 본문 작성 단계에서 주제별 문단으로 재조합합니다.",
        ],
      },
      commonMistakes: {
        heading: "자주 하는 실수",
        content: [
          "논문을 읽은 순서대로 요약하는 방식은 문헌 리뷰가 아니라 독서 기록에 가깝습니다. 본문에서는 시간순보다 주제, 방법, 이론, 쟁점별 구조가 더 자주 쓰입니다.",
          "또 다른 실수는 검색 과정을 기록하지 않는 것입니다. 어떤 데이터베이스에서 어떤 검색어로 몇 편을 찾았는지 남겨야 이후 검증과 업데이트가 가능합니다.",
        ],
      },
      checklist: [
        "검색어와 검색 데이터베이스를 기록했다.",
        "포함 기준과 제외 기준을 문서화했다.",
        "핵심 논문을 방법·대상·결과별로 비교했다.",
        "반복되는 한계와 후속 연구 제안을 따로 모았다.",
        "내 연구가 채울 공백을 한 문장으로 썼다.",
      ],
    },
    body: [
      {
        heading: "문헌 리뷰는 ‘요약’보다 ‘배치’가 중요합니다",
        content: [
          "좋은 문헌 리뷰는 여러 연구를 무대 위에 올려 서로 대화하게 만듭니다. 어떤 연구는 같은 결론을 지지하고, 어떤 연구는 다른 방법으로 비슷한 결론에 도달하며, 어떤 연구는 기존 설명의 한계를 보여줍니다.",
          "따라서 문헌 리뷰 문단은 ‘A는 이렇게 말했다, B는 이렇게 말했다’로 끝나면 약합니다. ‘이 연구들은 공통적으로 무엇을 전제하는가’, ‘어떤 대상이 빠져 있는가’, ‘어떤 방법이 아직 덜 쓰였는가’를 보여줘야 합니다.",
        ],
      },
      {
        heading: "데이터베이스별 역할을 나누면 검색이 빨라집니다",
        content: [
          "OpenAlex는 넓은 학술 메타데이터 탐색에 유용하고, Semantic Scholar는 인용 관계와 관련 논문 탐색에 강점이 있습니다. Crossref는 DOI 중심의 서지 정보를 확인할 때 좋고, arXiv는 최신 프리프린트 흐름을 볼 때 사용할 수 있습니다.",
          "다만 모든 데이터베이스가 같은 품질의 본문 정보를 제공하는 것은 아닙니다. 따라서 최종 인용 전에는 반드시 원문, DOI, 출판 정보, 저널명, 연도, 저자를 다시 확인해야 합니다.",
        ],
      },
      {
        heading: "리뷰 매트릭스는 본문 구조의 초안입니다",
        content: [
          "매트릭스의 열을 잘 설계하면 논문 목차가 자연스럽게 나옵니다. 예를 들어 연구대상별로 결과가 다르면 대상 기준으로 문단을 나눌 수 있고, 방법론에 따라 결론이 갈리면 방법 기준으로 문헌 리뷰를 구성할 수 있습니다.",
          "마지막 열에는 ‘내 연구와의 관계’를 반드시 둡니다. 이 열이 비어 있는 논문은 배경지식으로는 의미가 있어도 본문에 길게 넣을 필요가 없을 수 있습니다.",
        ],
      },
    ],
    related: ["how-to-choose-research-topic", "how-to-set-research-question"],
    relatedPapers: [
      {
        title: "Semantic Scholar Recommendations API",
        source: "Semantic Scholar",
        url: "https://api.semanticscholar.org/api-docs/",
      },
    ],
  },
  {
    slug: "how-to-set-research-question",
    category: "research-question",
    title: "연구질문 설정: 좋은 질문을 만드는 기준과 예시",
    lead: "좋은 연구질문은 흥미로운 질문이 아니라, 자료로 답할 수 있고 논문 전체를 이끄는 질문입니다.",
    summary: "연구질문은 범위, 분석 가능성, 개념 명확성, 학술적 기여를 동시에 갖춰야 합니다.",
    tags: ["연구질문", "연구문제", "FINER", "연구계획서"],
    readingMinutes: 10,
    updatedAt: "2026-04-22",
    author: "Paper Analysis Editorial Team",
    trustScore: 91,
    popularity: 92,
    sourceIds: ["fairfield-research-question", "purdue-topic"],
    translationNotice: "대학 도서관의 연구질문 개발 원칙을 한국어 논문계획서 문맥에 맞게 정리했습니다.",
    bilingualTitle: {
      ko: "연구질문 설정",
      en: "How to formulate a research question",
    },
    contentTemplate: {
      oneLineSummary: {
        ko: "연구질문은 연구 대상, 핵심 개념, 관계 또는 차이, 분석 가능한 자료가 한 문장 안에 드러나야 합니다.",
        en: "A research question should reveal the population, key concepts, relationship or difference, and available evidence.",
      },
      whenToUse: {
        heading: "언제 필요한가",
        content: [
          "주제는 정했지만 서론, 가설, 방법론이 따로 노는 느낌이 들 때 사용합니다.",
          "지도교수에게 ‘그래서 정확히 무엇을 밝히려는 연구인가’라는 피드백을 받았다면 연구질문을 다시 써야 합니다.",
        ],
      },
      coreConcepts: {
        heading: "핵심 개념",
        content: [
          "연구질문은 논문 전체의 기준점입니다. 문헌 리뷰는 질문의 배경을 설명하고, 방법론은 질문에 답하기 위한 절차이며, 결과는 질문에 대한 증거입니다.",
          "좋은 질문은 너무 넓지도, 너무 닫혀 있지도 않습니다. 단순 사실 확인 질문보다 원인, 관계, 변화, 의미, 경험을 탐색하는 질문이 연구로 확장되기 쉽습니다.",
        ],
      },
      practicalSteps: {
        heading: "실무 적용 방법",
        content: [
          "먼저 일반 질문을 씁니다. 예를 들어 ‘대학생은 왜 생성형 AI를 쓰는가?’라고 적습니다.",
          "그다음 대상, 맥락, 개념을 좁힙니다. ‘국내 인문사회계열 대학생의 생성형 AI 활용 경험은 전공 글쓰기 자기효능감과 어떤 관련이 있는가?’처럼 바꿉니다.",
          "마지막으로 데이터와 방법을 연결합니다. 설문으로 측정할 것인지, 인터뷰로 경험을 해석할 것인지, 기존 로그 데이터를 분석할 것인지 결정합니다.",
        ],
      },
      commonMistakes: {
        heading: "자주 하는 실수",
        content: [
          "가설을 먼저 세우고 나중에 연구질문을 끼워 맞추면 논리 흐름이 약해집니다. 질문이 먼저이고, 가설은 질문에 대한 검증 가능한 예상입니다.",
          "또한 ‘영향을 미치는가?’만 반복하면 모든 질문이 비슷해집니다. 차이, 과정, 조건, 의미, 매개 경로처럼 질문 유형을 다양하게 검토해야 합니다.",
        ],
      },
      checklist: [
        "질문에 연구 대상이 포함되어 있다.",
        "핵심 개념이 측정 또는 해석 가능하다.",
        "답하기 위해 필요한 자료를 확보할 수 있다.",
        "질문이 기존 연구와 연결된다.",
        "질문 하나가 논문 전체 목차를 이끌 수 있다.",
      ],
    },
    body: [
      {
        heading: "질문이 모호하면 모든 장이 흔들립니다",
        content: [
          "연구질문이 흐릿하면 문헌 리뷰는 넓어지고, 방법론은 설명적 나열이 되며, 결과 해석은 방향을 잃습니다. 반대로 질문이 선명하면 어떤 문헌을 넣고 뺄지, 어떤 분석을 해야 할지, 결론에서 무엇을 주장해야 할지가 분명해집니다.",
          "따라서 연구질문은 논문 초반에 잠깐 쓰는 문장이 아니라, 작성 내내 돌아와 확인해야 하는 기준문입니다.",
        ],
      },
      {
        heading: "좋은 질문은 답변 가능성과 확장성을 함께 갖습니다",
        content: [
          "너무 좁은 질문은 단순 사실 확인으로 끝납니다. 너무 넓은 질문은 한 편의 논문에서 답하기 어렵습니다. 좋은 질문은 한정된 자료로 답할 수 있으면서도 이론적·실무적 의미를 남깁니다.",
          "예를 들어 ‘AI는 교육에 좋은가?’는 너무 넓습니다. ‘생성형 AI 피드백을 반복적으로 사용한 대학 글쓰기 수업에서 학생의 수정 전략은 어떻게 변화하는가?’는 대상, 맥락, 변화, 자료가 더 분명합니다.",
        ],
      },
    ],
    related: ["how-to-choose-research-topic", "how-to-select-research-methodology"],
    relatedPapers: [],
  },
  {
    slug: "how-to-select-research-methodology",
    category: "methodology",
    title: "연구방법론 선택: 질적·양적·혼합 연구를 고르는 기준",
    lead: "연구방법은 취향이 아니라 연구질문, 자료, 윤리, 시간, 분석 역량에 따라 선택해야 합니다.",
    summary: "방법론 선택은 연구질문에 가장 설득력 있게 답할 수 있는 증거 형태를 고르는 과정입니다.",
    tags: ["연구방법론", "연구설계", "질적 연구", "양적 연구", "혼합 연구"],
    readingMinutes: 11,
    updatedAt: "2026-04-22",
    author: "Paper Analysis Editorial Team",
    trustScore: 93,
    popularity: 88,
    sourceIds: ["nih-study-design", "nih-library-study-design"],
    translationNotice: "NIH 연구설계 교육 자료의 원칙을 일반 논문작성 맥락에 맞춰 설명했습니다. 임상연구 세부 지침은 원문을 확인해야 합니다.",
    bilingualTitle: {
      ko: "연구방법론 선택",
      en: "How to choose a research methodology",
    },
    contentTemplate: {
      oneLineSummary: {
        ko: "연구방법론은 질문이 요구하는 증거의 종류에 맞춰 선택해야 하며, 방법이 먼저 오면 연구가 흔들립니다.",
        en: "Methodology should follow the kind of evidence your research question requires, not the other way around.",
      },
      whenToUse: {
        heading: "언제 필요한가",
        content: [
          "연구질문은 정했지만 설문, 인터뷰, 실험, 사례연구 중 무엇을 해야 할지 결정하지 못했을 때 사용합니다.",
          "연구계획서의 방법론 장을 쓰기 전, 연구윤리 심의나 표본 모집 계획을 세우기 전에도 필요합니다.",
        ],
      },
      coreConcepts: {
        heading: "핵심 개념",
        content: [
          "양적 연구는 관계, 차이, 효과 크기를 수치 자료로 검증하는 데 강합니다. 질적 연구는 경험, 의미, 과정, 맥락을 깊게 이해하는 데 강합니다.",
          "혼합 연구는 두 접근을 함께 사용하지만, 단순히 설문과 인터뷰를 모두 한다는 뜻은 아닙니다. 왜 두 자료가 모두 필요한지 명확한 논리가 있어야 합니다.",
        ],
      },
      practicalSteps: {
        heading: "실무 적용 방법",
        content: [
          "질문이 ‘얼마나’, ‘차이가 있는가’, ‘영향을 미치는가’라면 양적 설계를 우선 검토합니다. 질문이 ‘어떻게 경험하는가’, ‘어떤 의미를 부여하는가’라면 질적 설계를 검토합니다.",
          "자료 접근성을 확인합니다. 설문 표본을 충분히 모을 수 있는지, 인터뷰 대상자를 윤리적으로 모집할 수 있는지, 공개 데이터를 사용할 수 있는지 따져야 합니다.",
          "분석 역량도 현실적으로 봅니다. 복잡한 통계모형이나 질적 코딩 체계를 사용할 경우 지도 가능성, 소프트웨어, 검증 절차를 함께 확보해야 합니다.",
        ],
      },
      commonMistakes: {
        heading: "자주 하는 실수",
        content: [
          "방법론을 유행이나 편의로 고르는 것이 가장 위험합니다. 설문을 빨리 돌릴 수 있다고 해서 모든 질문이 양적 연구에 맞는 것은 아닙니다.",
          "혼합 연구를 ‘더 있어 보이는 방법’으로 선택하는 것도 문제입니다. 두 자료가 서로 보완하는 구체적 이유가 없으면 연구 부담만 커집니다.",
        ],
      },
      checklist: [
        "연구질문이 요구하는 증거 형태를 설명할 수 있다.",
        "자료 수집 대상과 절차가 현실적이다.",
        "윤리적 위험과 동의 절차를 검토했다.",
        "분석 방법을 수행할 역량과 도구가 있다.",
        "방법론 선택 이유를 선행연구와 연결했다.",
      ],
    },
    body: [
      {
        heading: "방법론은 연구질문의 답변 방식입니다",
        content: [
          "연구방법론은 논문에서 가장 기술적으로 보이는 부분이지만, 출발점은 단순합니다. 내 질문에 답하려면 어떤 종류의 증거가 필요한가를 묻는 것입니다.",
          "수치로 비교해야 하는 질문에 인터뷰만 쓰면 설득력이 부족할 수 있고, 경험의 의미를 이해해야 하는 질문에 설문 평균만 제시하면 핵심을 놓칠 수 있습니다.",
        ],
      },
      {
        heading: "연구설계는 타당성과 실행 가능성 사이의 균형입니다",
        content: [
          "가장 이상적인 설계가 항상 최선은 아닙니다. 시간, 예산, 표본 접근성, 윤리 심의, 지도 환경을 고려해야 실제로 완성 가능한 논문이 됩니다.",
          "방법론 장에서는 선택한 방법의 장점뿐 아니라 한계도 정직하게 설명해야 합니다. 한계를 미리 인정하고 보완 절차를 제시하는 것이 신뢰도를 높입니다.",
        ],
      },
    ],
    related: ["how-to-set-research-question", "how-to-conduct-literature-review"],
    relatedPapers: [
      {
        title: "NIH Research Methods Resources",
        source: "NIH",
        url: "https://researchmethodsresources.nih.gov/",
      },
    ],
  },
  {
    slug: "how-to-write-references",
    category: "citation",
    title: "참고문헌 작성: APA 스타일 기본 원칙과 점검법",
    lead: "본문 인용과 참고문헌 목록을 일치시키고, 출처를 투명하게 남기기 위한 APA 기반 참고문헌 작성 가이드입니다.",
    summary: "참고문헌은 형식 작업이 아니라 독자가 원천 자료를 추적할 수 있게 하는 신뢰 장치입니다.",
    tags: ["참고문헌", "APA", "본문 인용", "출처 표기"],
    readingMinutes: 10,
    updatedAt: "2026-04-22",
    author: "Paper Analysis Editorial Team",
    trustScore: 95,
    popularity: 90,
    sourceIds: ["apa-reference-list", "apa-style-references"],
    translationNotice: "APA 및 Purdue OWL 자료의 원칙을 한국어 사용자를 위해 설명했으며, 최종 제출 전 학교·학회 양식을 반드시 확인해야 합니다.",
    bilingualTitle: {
      ko: "참고문헌 작성",
      en: "How to write references",
    },
    contentTemplate: {
      oneLineSummary: {
        ko: "본문에서 인용한 모든 자료는 참고문헌 목록에 있어야 하고, 참고문헌 목록의 모든 자료는 본문에서 실제로 인용되어야 합니다.",
        en: "Every source cited in the text should appear in the reference list, and every reference list entry should be cited in the text.",
      },
      whenToUse: {
        heading: "언제 필요한가",
        content: [
          "논문 초안을 완성한 뒤 참고문헌을 정리할 때, 투고 전 형식 점검을 할 때, 혹은 AI나 참고문헌 관리 도구가 만든 인용을 검증할 때 사용합니다.",
          "특히 본문 인용은 많은데 참고문헌 목록이 자동으로 생성되어 정확성을 확신하기 어려운 경우 필수입니다.",
        ],
      },
      coreConcepts: {
        heading: "핵심 개념",
        content: [
          "참고문헌의 목적은 독자가 원자료를 찾을 수 있도록 충분한 정보를 제공하는 것입니다. 저자, 연도, 제목, 출처 정보가 핵심입니다.",
          "APA 스타일은 저자-연도 체계를 사용합니다. 본문에서 저자와 연도로 간단히 표시하고, 참고문헌 목록에서 상세 정보를 제공합니다.",
        ],
      },
      practicalSteps: {
        heading: "실무 적용 방법",
        content: [
          "먼저 본문 인용과 참고문헌 목록을 대조합니다. 본문에는 있는데 목록에 없는 자료, 목록에는 있는데 본문에서 쓰이지 않은 자료를 제거하거나 보완합니다.",
          "DOI가 있는 학술논문은 DOI를 확인합니다. 웹페이지는 작성 기관, 제목, 날짜, URL을 확인합니다. 자동 생성 결과는 대소문자, 이탤릭, 저자 순서에서 오류가 자주 납니다.",
          "마지막으로 학교나 학회 양식을 확인합니다. APA를 기본으로 하더라도 국내 학회지는 세부 표기법이 다를 수 있습니다.",
        ],
      },
      commonMistakes: {
        heading: "자주 하는 실수",
        content: [
          "본문에서 실제로 읽지 않은 자료를 참고문헌에 넣는 것은 피해야 합니다. 참고문헌 수를 늘리기 위한 목록은 심사에서 신뢰도를 낮춥니다.",
          "또한 AI가 제안한 참고문헌은 반드시 검증해야 합니다. 존재하지 않는 논문, 틀린 DOI, 잘못된 저널명이 섞일 수 있습니다.",
        ],
      },
      checklist: [
        "본문 인용과 참고문헌 목록이 1:1로 대응한다.",
        "저자명, 연도, 제목, 출처 정보를 원문과 대조했다.",
        "DOI와 URL이 실제로 열리는지 확인했다.",
        "학교·학회 양식의 세부 규칙을 확인했다.",
        "AI가 생성한 서지는 원문 데이터베이스에서 다시 검증했다.",
      ],
    },
    body: [
      {
        heading: "참고문헌은 독자의 추적 가능성을 위한 장치입니다",
        content: [
          "참고문헌 작성은 문장 끝을 예쁘게 정리하는 일이 아닙니다. 독자가 내가 근거로 삼은 자료를 직접 찾아볼 수 있도록 경로를 남기는 일입니다.",
          "그래서 참고문헌의 핵심은 일관성과 정확성입니다. 형식이 조금 다르더라도 원자료를 찾을 수 있으면 의미가 있지만, 저자나 제목, DOI가 틀리면 출처 추적이 어려워집니다.",
        ],
      },
      {
        heading: "자동 도구를 쓰더라도 검증은 사람이 해야 합니다",
        content: [
          "Zotero, EndNote, Mendeley 같은 도구는 매우 유용하지만 가져온 메타데이터가 항상 완벽하지는 않습니다. 특히 웹페이지, 보고서, 번역서, 학위논문은 필드 누락이 잦습니다.",
          "최종 제출 전에는 참고문헌 목록을 원문 PDF나 DOI 페이지와 대조하는 습관이 필요합니다. 이 과정은 시간이 걸리지만, 논문의 기본 신뢰도를 지키는 가장 확실한 방법입니다.",
        ],
      },
    ],
    related: ["how-to-conduct-literature-review", "how-to-create-research-presentation"],
    relatedPapers: [],
  },
  {
    slug: "how-to-create-research-presentation",
    category: "presentation",
    title: "발표자료 구성: 논문 내용을 심사·학회 발표용 PPT로 바꾸는 법",
    lead: "논문 전체를 슬라이드에 옮기지 않고, 청중이 따라올 수 있는 발표 흐름으로 재구성하는 방법입니다.",
    summary: "좋은 발표자료는 논문을 축소한 문서가 아니라, 연구 질문과 핵심 근거를 청중에게 전달하는 시각적 구조입니다.",
    tags: ["발표자료", "PPT", "학회 발표", "디펜스"],
    readingMinutes: 10,
    updatedAt: "2026-04-22",
    author: "Paper Analysis Editorial Team",
    trustScore: 88,
    popularity: 86,
    sourceIds: ["umw-presentation-slides"],
    translationNotice: "대학 발표자료 작성 원칙을 논문 심사·학회 발표 상황에 맞게 한국어로 재구성했습니다.",
    bilingualTitle: {
      ko: "발표자료 구성",
      en: "How to create research presentation slides",
    },
    contentTemplate: {
      oneLineSummary: {
        ko: "논문 발표자료는 연구 배경, 질문, 방법, 핵심 결과, 기여를 짧은 이야기 구조로 재배열해야 합니다.",
        en: "Research slides should reorganize the paper into a short story: context, question, method, key findings, and contribution.",
      },
      whenToUse: {
        heading: "언제 필요한가",
        content: [
          "학위논문 예비심사, 본심사, 학회 발표, 연구실 세미나 발표자료를 만들 때 사용합니다.",
          "논문은 완성했지만 발표 시간이 10분 또는 15분으로 제한되어 무엇을 빼야 할지 막막할 때 특히 유용합니다.",
        ],
      },
      coreConcepts: {
        heading: "핵심 개념",
        content: [
          "슬라이드는 원고가 아닙니다. 청중이 발표자의 말을 따라갈 수 있도록 핵심 메시지, 구조, 시각적 단서를 제공하는 도구입니다.",
          "한 장의 슬라이드는 하나의 역할만 가져야 합니다. 배경을 설명하는 슬라이드, 방법을 보여주는 슬라이드, 결과를 비교하는 슬라이드가 섞이면 청중의 집중이 흐려집니다.",
        ],
      },
      practicalSteps: {
        heading: "실무 적용 방법",
        content: [
          "먼저 발표 시간을 기준으로 슬라이드 수를 제한합니다. 10분 발표라면 보통 8~12장 안에서 핵심을 전달하는 편이 안전합니다.",
          "구성은 문제 제기, 연구질문, 선행연구 공백, 방법, 결과, 해석, 기여, 질의응답 순서가 기본입니다. 심사 발표라면 한계와 향후 연구를 분명히 넣습니다.",
          "텍스트는 문장보다 구문 중심으로 줄이고, 표는 그대로 붙이지 말고 핵심 수치와 해석을 강조합니다. 복잡한 모형은 단계적으로 보여주는 것이 좋습니다.",
        ],
      },
      commonMistakes: {
        heading: "자주 하는 실수",
        content: [
          "논문 본문을 그대로 복사해 슬라이드에 붙이는 것이 가장 흔한 실수입니다. 발표자는 읽는 사람이 아니라 설명하는 사람이어야 합니다.",
          "결과표를 축소해 한 장에 넣는 것도 위험합니다. 청중은 작은 표를 읽지 못합니다. 핵심 비교, 유의한 경로, 가장 중요한 수치만 남겨야 합니다.",
        ],
      },
      checklist: [
        "발표 시간이 슬라이드 수와 맞는다.",
        "첫 2장 안에 연구 질문과 필요성이 드러난다.",
        "각 슬라이드에 핵심 메시지가 하나씩 있다.",
        "표와 그림은 발표 화면에서 읽을 수 있다.",
        "마지막 장에 기여, 한계, 후속 질문이 정리되어 있다.",
      ],
    },
    body: [
      {
        heading: "발표자료는 논문의 압축본이 아닙니다",
        content: [
          "논문은 읽기 위해 쓰이고, 발표자료는 듣고 이해하기 위해 만들어집니다. 따라서 논문의 모든 내용을 빠짐없이 넣으려는 태도는 발표 품질을 떨어뜨립니다.",
          "청중은 논문 전체를 검토하는 것이 아니라, 제한된 시간 안에 연구의 질문과 핵심 근거를 이해하려고 합니다. 발표자료는 이 이해 과정을 설계해야 합니다.",
        ],
      },
      {
        heading: "슬라이드 제목을 주장형으로 쓰면 흐름이 좋아집니다",
        content: [
          "‘분석 결과’보다 ‘AI 피드백 사용 빈도가 수정 전략 다양성과 관련된다’처럼 제목 자체에 메시지를 넣으면 청중이 화면을 보는 즉시 핵심을 파악할 수 있습니다.",
          "모든 슬라이드 제목을 이어 읽었을 때 발표 전체의 논리가 보이면 좋은 구성입니다. 반대로 제목만 봐서는 흐름이 보이지 않는다면 아직 논문 목차를 그대로 옮긴 상태일 가능성이 큽니다.",
        ],
      },
    ],
    related: ["how-to-write-references", "how-to-select-research-methodology"],
    relatedPapers: [],
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
    features: ["월 30회 분석", "섹션별 상세 요약", "발표자료용 요약", "내 서고 보관", "관련 가이드 추천"],
    ctaLabel: "Standard 시작",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "19,900원",
    priceSuffix: "/월",
    desc: "연구실, 그룹 리서치",
    features: ["월 150회 분석", "구조화 템플릿 맞춤", "내보내기", "우선 분석 큐", "팀 공유 링크"],
    ctaLabel: "Pro 시작",
    highlight: false,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "이 사이트의 가이드는 AI가 자동으로 쓴 글인가요?",
    a: "아니요. AI는 초안 구조화와 번역 보조에 사용될 수 있지만, 모든 공개 가이드는 출처 확인, 한국어 문맥 정리, 편집 검토를 거칩니다.",
  },
  {
    q: "출처는 어떻게 확인하나요?",
    a: "각 가이드 하단의 출처·번역 고지 블록에서 원문 기관, 링크, 확인일, 신뢰 근거를 확인할 수 있습니다.",
  },
  {
    q: "논문분석기와 가이드 아카이브는 어떻게 연결되나요?",
    a: "가이드는 작성 방법을 설명하고, 논문분석기는 실제 PDF를 업로드해 구조와 핵심 내용을 확인하는 도구입니다.",
  },
  {
    q: "가이드 내용을 그대로 과제나 논문에 인용해도 되나요?",
    a: "가이드는 학습용 2차 정리입니다. 실제 논문 인용에는 반드시 가이드에 표시된 원문 출처나 해당 분야의 1차 문헌을 확인하세요.",
  },
];

export function getCategory(slug: string) {
  return GUIDE_CATEGORIES.find((category) => category.slug === slug);
}

export function getGuide(slug: string) {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}

export function getGuideSources(article: GuideArticle) {
  return article.sourceIds
    .map((id) => ARCHIVE_SOURCES.find((source) => source.id === id))
    .filter((source): source is ArchiveSource => Boolean(source));
}

export function getRelatedGuides(article: GuideArticle) {
  return article.related
    .map((slug) => getGuide(slug))
    .filter((guide): guide is GuideArticle => Boolean(guide));
}

export function getGuidesByCategory(categorySlug: string) {
  return GUIDE_ARTICLES.filter((article) => article.category === categorySlug);
}

export function getLatestGuides(limit = GUIDE_ARTICLES.length) {
  return [...GUIDE_ARTICLES]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, limit);
}

export function getPopularGuides(limit = GUIDE_ARTICLES.length) {
  return [...GUIDE_ARTICLES].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}
