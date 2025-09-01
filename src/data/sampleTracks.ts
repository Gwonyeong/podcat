export interface SampleTrack {
  id: number;
  title: string;
  artist: string;
  duration: string;
  category: string;
  image: string;
  audioSrc: string;
  description: string;
  longDescription: string;
  tags: string[];
  publishDate: string;
  language: string;
  languageFlag: string;
  quality: string;
}

export const sampleTracks: SampleTrack[] = [
  {
    id: 6,
    title: "[테스트] 2025년 9월 1일 오디오",
    artist: "AI 테스터",
    duration: "01:00",
    category: "테스트",
    image: "/images/logo.png",
    audioSrc: "/sample/테크- 0820.mp3",
    description: "2025년 9월 1일의 테스트 데이터입니다.",
    longDescription: "이 데이터는 2025년 9월 1일에 목록이 정상적으로 출력되는지 확인하기 위한 테스트용입니다.",
    tags: ["테스트"],
    publishDate: "2025-09-01",
    language: "한국어",
    languageFlag: "🇰🇷",
    quality: "HD",
  },
  {
    id: 4,
    title: "겉과 속이 다른 비즈니스: 고객, 팀, 영업의 진짜 Why를 찾아서",
    artist: "Business Insight",
    duration: "17:00",
    category: "비즈니스",
    image: "/images/maskman.png",
    audioSrc:
      "/sample/겉과_속이_다른_비즈니스__고객,_팀,_영업의_진짜__Why_를_찾아서.m4a",
    description: "비즈니스의 본질을 파헤치고 진정한 성공 요인을 탐구합니다.",
    longDescription:
      "겉으로 보이는 화려한 성과 뒤에 숨겨진 비즈니스의 진실을 파헤칩니다. 고객의 진짜 니즈, 팀의 숨겨진 동기, 영업의 본질적 가치를 찾아가는 여정을 담았습니다. 표면적인 지표와 수치를 넘어서 비즈니스의 핵심 동력을 이해하고, 지속가능한 성장을 위한 인사이트를 제공합니다. 실제 사례와 전문가 인터뷰를 통해 현실적이고 실용적인 비즈니스 철학을 전달합니다.",
    tags: ["비즈니스", "경영전략", "고객분석", "팀워크", "영업", "인사이트"],
    publishDate: "2024-08-22",
    language: "한국어",
    languageFlag: "🇰🇷",
    quality: "HD",
  },
  {
    id: 5,
    title:
      "번아웃을 이기는 나만의 리추얼: 지친 마음 다독이는 회복탄력성 키우기",
    artist: "AI ",
    duration: "15:42",
    category: "멘탈헬스",
    image: "/images/coffeeInCafeWithYoungGirl.png",
    audioSrc:
      "/sample/번아웃을_이기는_나만의_리추얼__지친_마음_다독이는_회복탄력성_키우기.m4a",
    description:
      "현대인의 번아웃 극복을 위한 실용적인 회복 전략과 마음 돌봄 방법을 제시합니다.",
    longDescription:
      "바쁜 일상 속에서 지친 마음과 몸을 회복하는 방법을 깊이 있게 탐구합니다. 번아웃의 원인과 증상을 이해하고, 개인별 맞춤형 회복 리추얼을 만드는 구체적인 방법을 제시합니다. 심리학적 연구를 바탕으로 한 과학적 접근과 함께, 실제 적용 가능한 마음챙김 기법, 스트레스 관리법, 에너지 회복 전략을 소개합니다. 작은 변화로도 큰 효과를 얻을 수 있는 일상 속 힐링 루틴을 통해 지속가능한 웰빙 라이프스타일을 구축하는 방법을 안내합니다.",
    tags: [
      "번아웃",
      "멘탈헬스",
      "회복탄력성",
      "스트레스관리",
      "마음챙김",
      "힐링",
    ],
    publishDate: "2024-08-23",
    language: "한국어",
    languageFlag: "🇰🇷",
    quality: "HD",
  },
  {
    id: 1,
    title: "글로벌 3대 뉴스(8월 20일)",
    artist: "AI 아냥운서",
    duration: "03:31",
    category: "뉴스",
    image: "/images/아냥운서.png",
    audioSrc: "/sample/글로벌 3대 뉴스- 0820.mp3",
    description: "세계 각국의 주요 뉴스와 이슈를 AI가 요약하여 제공합니다.",
    longDescription:
      "이번 주 세계 각국에서 주목받은 주요 뉴스를 AI가 분석하고 요약했습니다. 경제, 정치, 사회, 환경 등 다양한 분야의 이슈를 객관적이고 중립적인 관점에서 다루며, 복잡한 세계 정세를 쉽게 이해할 수 있도록 도와줍니다. 각 뉴스의 배경과 영향, 그리고 향후 전망까지 포함하여 종합적인 정보를 제공합니다.",
    tags: ["글로벌", "뉴스", "AI 분석", "세계 이슈"],
    publishDate: "2024-08-20",
    language: "한국어",
    languageFlag: "🇰🇷",
    quality: "HD",
  },
  {
    id: 2,
    title: "쉬어가도 괜찮아요.",
    artist: "AI 힐냥이",
    duration: "02:07",
    category: "라이프",
    image: "/images/힐냥이.png",
    audioSrc: "/sample/라이프스타일- 0820.mp3",
    description: "건강, 취미, 문화 등 일상생활의 다양한 이야기를 담았습니다.",
    longDescription:
      "현대인의 일상에 영감을 주는 다양한 라이프스타일 콘텐츠를 준비했습니다. 건강한 생활 습관부터 새로운 취미 활동, 문화 트렌드까지 실용적이고 흥미로운 정보를 담았습니다. AI가 분석한 최신 트렌드와 전문가들의 조언을 바탕으로, 일상의 질을 높일 수 있는 팁과 아이디어를 제공합니다.",
    tags: ["라이프스타일", "건강", "취미", "문화", "트렌드"],
    publishDate: "2024-08-20",
    language: "한국어",
    languageFlag: "🇰🇷",
    quality: "HD",
  },
  {
    id: 3,
    title: "테크 트렌드, 알기 쉽게 전달합니다. (8월 20일)",
    artist: "AI 태성",
    duration: "03:21",
    category: "태크",
    image: "/images/테크냥.png",
    audioSrc: "/sample/테크- 0820.mp3",
    description: "최신 기술 동향과 IT 업계 소식을 빠르게 전달합니다.",
    longDescription:
      "빠르게 변화하는 기술 세계의 최신 동향을 AI가 분석하여 전달합니다. 인공지능, 블록체인, 클라우드 컴퓨팅 등 혁신적인 기술의 발전과 적용 사례, 그리고 IT 업계의 주요 소식과 트렌드를 다룹니다. 기술에 대한 깊이 있는 이해와 함께, 일상생활에 미치는 영향과 미래 전망까지 포함하여 종합적인 기술 정보를 제공합니다.",
    tags: ["테크", "AI", "블록체인", "클라우드", "혁신기술"],
    publishDate: "2024-08-20",
    language: "한국어",
    languageFlag: "🇰🇷",
    quality: "HD",
  },
];
