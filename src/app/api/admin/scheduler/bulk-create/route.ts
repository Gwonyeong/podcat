import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface SchedulerTemplate {
  name: string;
  categoryName: string;
  cronExpression: string;
  promptMode: 'single' | 'perplexity' | 'list';
  prompt?: string;
  perplexitySystemPrompt?: string;
  topicList?: Array<{title: string; description: string}>;
  publishDateOffset?: number;
}

const schedulerTemplates: SchedulerTemplate[] = [
  {
    name: '테크 트렌드 브리핑 - 매일 오전',
    categoryName: '테크 트렌드 브리핑',
    cronExpression: '0 7 * * *',
    promptMode: 'perplexity',
    prompt: '오늘의 주요 IT 기술 뉴스와 트렌드 korea tech news ai startup',
    perplexitySystemPrompt: '한국과 글로벌 최신 기술 뉴스 중 가장 중요하고 흥미로운 3가지를 선정하여 5분 분량의 팟캐스트로 요약해줘. AI, 스타트업, 신기술, 테크 기업 동향을 중심으로 검색하고, IT 업계 종사자들이 알아야 할 핵심 정보 위주로 구성해줘.',
    publishDateOffset: 0
  },
  {
    name: '아침 명상 가이드',
    categoryName: '오늘의 명상과 마음챙김',
    cronExpression: '0 6 * * *',
    promptMode: 'list',
    topicList: [
      {"title": "호흡 명상", "description": "깊은 복식호흡을 통한 마음 안정법과 하루 시작 준비"},
      {"title": "바디스캔 명상", "description": "신체 각 부위를 차례로 인식하며 긴장을 풀고 몸의 감각에 집중하기"},
      {"title": "감사 명상", "description": "일상의 작은 것들에 감사하는 마음을 기르고 긍정적 에너지 충전하기"},
      {"title": "자애 명상", "description": "자신과 타인을 향한 사랑과 연민의 마음 키우기"},
      {"title": "걷기 명상", "description": "일상 속 걷기를 마음챙김 명상으로 전환하는 실용적 방법"},
      {"title": "수면 명상", "description": "편안한 잠을 위한 몸과 마음의 이완 가이드"},
      {"title": "스트레스 해소 명상", "description": "쌓인 긴장과 스트레스를 날려보내는 힐링 시간"},
      {"title": "집중력 향상 명상", "description": "산만한 마음을 모으고 집중력을 높이는 명상법"},
      {"title": "분노 조절 명상", "description": "화를 다스리고 감정을 조절하는 마음챙김 기법"},
      {"title": "자신감 회복 명상", "description": "내면의 힘을 발견하고 자존감을 높이는 시간"}
    ],
    publishDateOffset: 0
  },
  {
    name: '출근길 경제 브리핑',
    categoryName: '5분 경제 뉴스',
    cronExpression: '0 8 * * 1-5',
    promptMode: 'perplexity',
    prompt: '오늘의 주요 경제 뉴스 korea economy stock market',
    perplexitySystemPrompt: '한국과 글로벌 경제 뉴스, 주식시장, 부동산, 금리, 환율, 암호화폐 동향을 5분으로 요약해줘. 직장인과 투자자가 출근길에 알아야 할 핵심 경제 정보 위주로 구성하고, 복잡한 경제 이슈를 쉽게 설명해줘.',
    publishDateOffset: 0
  },
  {
    name: '저녁 심리학 카페',
    categoryName: '일상 속 심리학',
    cronExpression: '0 19 * * 1,3,5',
    promptMode: 'list',
    topicList: [
      {"title": "첫인상의 심리학", "description": "7초 만에 결정되는 첫인상의 비밀과 좋은 인상을 남기는 방법"},
      {"title": "미루기 습관 극복하기", "description": "프로크라스티네이션의 심리적 원인과 실용적 해결책"},
      {"title": "건강한 인간관계 만들기", "description": "애착 이론으로 이해하는 관계 패턴과 소통법"},
      {"title": "감정 조절의 기술", "description": "분노, 불안, 우울을 다스리는 심리학적 방법들"},
      {"title": "자존감 높이기", "description": "건강한 자아상과 자신감을 만드는 심리학적 접근"},
      {"title": "스트레스와 번아웃 극복", "description": "현대인의 정신건강을 지키는 실용적 방법"},
      {"title": "소통의 심리학", "description": "상대방의 마음을 읽고 효과적으로 소통하는 기술"},
      {"title": "행복의 과학", "description": "긍정심리학이 알려주는 행복해지는 방법"},
      {"title": "습관의 심리학", "description": "좋은 습관을 만들고 나쁜 습관을 끊는 과학적 방법"},
      {"title": "집중력과 몰입", "description": "플로우 상태에 들어가는 심리학적 조건들"}
    ],
    publishDateOffset: 0
  },
  {
    name: '커리어 성장 워크샵',
    categoryName: '커리어 성장 인사이트',
    cronExpression: '0 18 * * 2,4',
    promptMode: 'list',
    topicList: [
      {"title": "이력서 작성의 기술", "description": "HR이 주목하는 이력서 작성법과 포트폴리오 구성"},
      {"title": "면접 성공 전략", "description": "면접관의 마음을 사로잡는 답변 기법과 태도"},
      {"title": "네트워킹의 힘", "description": "인맥 관리와 관계 구축을 통한 커리어 발전"},
      {"title": "리더십 스킬 개발", "description": "팀을 이끄는 리더가 되기 위한 필수 능력들"},
      {"title": "협상과 커뮤니케이션", "description": "직장에서 원하는 것을 얻는 설득과 협상 기술"},
      {"title": "시간 관리와 생산성", "description": "효율적인 업무 처리와 워라밸 실현 방법"},
      {"title": "전문성 개발하기", "description": "자신만의 전문 영역을 만들고 발전시키는 방법"},
      {"title": "이직과 전직 전략", "description": "성공적인 커리어 전환을 위한 준비와 실행"},
      {"title": "급여 협상 노하우", "description": "연봉 인상과 처우 개선을 위한 협상 전략"},
      {"title": "워크라이프 밸런스", "description": "일과 삶의 균형을 맞추는 현실적 방법"}
    ],
    publishDateOffset: 0
  },
  {
    name: 'K-컬처 핫이슈',
    categoryName: 'K-컬처 데일리',
    cronExpression: '0 17 * * *',
    promptMode: 'perplexity',
    prompt: '오늘의 K-POP 드라마 영화 한류 뉴스 kpop korean drama',
    perplexitySystemPrompt: 'K-POP, 한국 드라마, 영화, 한류 스타들의 최신 소식과 트렌드를 5분으로 요약해줘. 신곡 발매, 드라마 시청률, 해외 진출 소식, 시상식, 패션 등 한류 팬들이 관심 가질만한 핫이슈 위주로 구성해줘.',
    publishDateOffset: 0
  },
  {
    name: '건강 라이프 가이드',
    categoryName: '건강한 라이프스타일',
    cronExpression: '0 9 * * 1,3,5',
    promptMode: 'list',
    topicList: [
      {"title": "홈트레이닝 완벽 가이드", "description": "집에서 할 수 있는 효과적인 운동법과 루틴 구성"},
      {"title": "건강한 식단 관리", "description": "영양 균형을 맞춘 식사법과 다이어트 팁"},
      {"title": "수면의 과학", "description": "질 좋은 잠을 위한 수면 위생과 생활 습관"},
      {"title": "스트레칭과 요가", "description": "몸의 유연성을 높이고 근육 긴장을 푸는 방법"},
      {"title": "금연과 금주", "description": "건강한 생활을 위한 중독 극복 전략"},
      {"title": "면역력 강화하기", "description": "자연스럽게 면역 시스템을 강화하는 생활 습관"},
      {"title": "정신 건강 관리", "description": "스트레스 해소와 마음 건강을 위한 실용적 방법"},
      {"title": "물과 건강", "description": "충분한 수분 섭취의 중요성과 올바른 물 마시기"},
      {"title": "계절별 건강 관리", "description": "시기에 따른 건강 관리법과 주의사항"},
      {"title": "건강 검진과 예방", "description": "정기 검진의 중요성과 질병 예방법"}
    ],
    publishDateOffset: 0
  },
  {
    name: '주말 창업 이야기',
    categoryName: '창업가 스토리',
    cronExpression: '0 10 * * 6',
    promptMode: 'list',
    topicList: [
      {"title": "스타트업 아이디어 발굴", "description": "좋은 비즈니스 아이디어를 찾고 검증하는 방법"},
      {"title": "투자 유치의 기술", "description": "벤처캐피털과 엔젤투자자를 설득하는 피칭 전략"},
      {"title": "팀 빌딩과 인재 영입", "description": "초기 스타트업에서 핵심 인재를 찾고 관리하는 법"},
      {"title": "제품 개발과 MVP", "description": "최소기능제품으로 빠르게 시장을 테스트하는 방법"},
      {"title": "마케팅과 고객 확보", "description": "적은 비용으로 효과적인 마케팅을 하는 그로스해킹"},
      {"title": "재무 관리와 현금흐름", "description": "스타트업의 생존을 위한 자금 관리 전략"},
      {"title": "실패에서 배우기", "description": "창업 실패 사례와 그로부터 얻은 교훈들"},
      {"title": "스케일업 전략", "description": "성공한 스타트업이 더 큰 회사로 성장하는 방법"},
      {"title": "글로벌 진출하기", "description": "해외 시장 진출을 위한 준비와 전략"},
      {"title": "엑시트 전략", "description": "IPO와 M&A를 통한 성공적인 출구 전략"}
    ],
    publishDateOffset: 0
  },
  {
    name: 'AI와의 철학적 대화',
    categoryName: 'AI와 대화하기',
    cronExpression: '0 20 * * 0',
    promptMode: 'single',
    prompt: '오늘은 AI의 관점에서 인간과 기술, 미래 사회에 대해 깊이 있는 성찰을 해보겠습니다. 현재 우리가 살고 있는 시대의 기술적 변화가 인간성에 미치는 영향, 인공지능과 인간이 공존하는 미래 사회의 모습, 그리고 기술 발전이 가져올 윤리적 딜레마들에 대해 함께 생각해보는 시간을 가져보겠습니다.',
    publishDateOffset: 0
  },
  {
    name: '육아 멘토링',
    categoryName: '부모를 위한 육아 가이드',
    cronExpression: '0 20 * * 2,4,6',
    promptMode: 'list',
    topicList: [
      {"title": "영아기 발달과 돌봄", "description": "0-24개월 아기의 신체적, 인지적 발달 특성과 돌봄 방법"},
      {"title": "유아기 언어 발달", "description": "말이 늦은 아이, 언어 발달을 촉진하는 상호작용 방법"},
      {"title": "올바른 훈육과 훈계", "description": "아이의 연령별 적절한 훈육 방법과 긍정적 훈계법"},
      {"title": "형제자매 갈등 해결", "description": "형제간 다툼과 질투를 현명하게 해결하는 방법"},
      {"title": "아이와의 소통법", "description": "연령별 효과적인 대화법과 감정 소통 기술"},
      {"title": "학습 동기 부여하기", "description": "공부에 흥미를 잃은 아이에게 동기를 심어주는 방법"},
      {"title": "디지털 기기와 아이", "description": "스마트폰, 태블릿 사용 시간 관리와 올바른 활용법"},
      {"title": "아이의 감정 이해하기", "description": "화, 슬픔, 두려움 등 아이 감정의 이해와 대처법"},
      {"title": "독립성 기르기", "description": "연령별 자립심과 책임감을 기르는 육아법"},
      {"title": "부모의 스트레스 관리", "description": "육아 스트레스 해소와 부모 자신을 돌보는 방법"}
    ],
    publishDateOffset: 0
  }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { categoryNames, overwrite = false } = body;

    // 특정 카테고리만 선택하거나 전체 생성
    const templatesToCreate = categoryNames && categoryNames.length > 0
      ? schedulerTemplates.filter(template => categoryNames.includes(template.categoryName))
      : schedulerTemplates;

    const results = [];
    const errors = [];

    for (const template of templatesToCreate) {
      try {
        // 카테고리 찾기
        const category = await prisma.category.findUnique({
          where: { name: template.categoryName }
        });

        if (!category) {
          errors.push(`카테고리를 찾을 수 없습니다: ${template.categoryName}`);
          continue;
        }

        if (!category.presenterVoiceId) {
          errors.push(`카테고리에 음성 ID가 설정되지 않았습니다: ${template.categoryName}`);
          continue;
        }

        // 기존 스케줄러 확인
        const existingScheduler = await prisma.audioScheduler.findFirst({
          where: {
            categoryId: category.id,
            name: template.name
          }
        });

        if (existingScheduler && !overwrite) {
          results.push({
            categoryName: template.categoryName,
            schedulerName: template.name,
            status: 'skipped',
            message: '이미 존재하는 스케줄러입니다.'
          });
          continue;
        }

        // 스케줄러 데이터 준비
        const schedulerData = {
          name: template.name,
          categoryId: category.id,
          prompt: template.promptMode === 'list' ? '' : template.prompt || '',
          cronExpression: template.cronExpression,
          isActive: true,
          promptMode: template.promptMode,
          usePerplexity: template.promptMode === 'perplexity',
          perplexitySystemPrompt: template.perplexitySystemPrompt || null,
          topicList: template.topicList ? template.topicList : undefined,
          currentTopicIndex: 0,
          publishDateOffset: template.publishDateOffset || 0
        };

        let scheduler;
        if (existingScheduler && overwrite) {
          // 기존 스케줄러 업데이트
          scheduler = await prisma.audioScheduler.update({
            where: { id: existingScheduler.id },
            data: schedulerData
          });
          results.push({
            categoryName: template.categoryName,
            schedulerName: template.name,
            status: 'updated',
            schedulerId: scheduler.id
          });
        } else {
          // 새 스케줄러 생성
          scheduler = await prisma.audioScheduler.create({
            data: schedulerData
          });
          results.push({
            categoryName: template.categoryName,
            schedulerName: template.name,
            status: 'created',
            schedulerId: scheduler.id
          });
        }
      } catch (error) {
        console.error(`스케줄러 생성 실패 (${template.categoryName}):`, error);
        errors.push(`${template.categoryName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}개의 스케줄러 처리 완료`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: templatesToCreate.length,
        created: results.filter(r => r.status === 'created').length,
        updated: results.filter(r => r.status === 'updated').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Bulk scheduler creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}