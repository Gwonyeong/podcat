# Google Tag Manager 설정 가이드

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음과 같이 설정하세요:

```env
# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-W58MJ59L

# Database (기존)
DATABASE_URL="postgresql://username:password@localhost:5432/podcat?schema=public"
```

## GTM Container ID 획득 방법

1. [Google Tag Manager](https://tagmanager.google.com/)에 로그인
2. 새 계정 생성 또는 기존 계정 선택
3. 새 컨테이너 생성 (플랫폼: 웹)
4. "GTM-XXXXXXX" 형태의 컨테이너 ID를 복사하여 환경 변수에 설정

## GTM에서 Google Analytics 설정

GTM 컨테이너에서 다음과 같이 설정하세요:

### 1. Google Analytics 4 구성 태그 생성

- **태그 유형**: Google Analytics: GA4 구성
- **측정 ID**: GA4 속성의 측정 ID (G-XXXXXXXXXX)
- **트리거**: All Pages

### 2. Google Analytics 4 이벤트 태그들 생성

각 이벤트별로 다음과 같이 태그를 생성하세요:

#### 스크롤 추적 태그

- **태그 유형**: Google Analytics: GA4 이벤트
- **구성 태그**: [1단계에서 만든 GA4 구성 태그]
- **이벤트명**: scroll_tracking
- **매개변수**:
  - event_category: {{event_category}}
  - section_name: {{section_name}}
  - visibility_percentage: {{visibility_percentage}}
- **트리거**: 사용자 정의 이벤트 (이벤트명: scroll_tracking)

#### 미디어 재생 추적 태그

- **태그 유형**: Google Analytics: GA4 이벤트
- **구성 태그**: [1단계에서 만든 GA4 구성 태그]
- **이벤트명**: media_play
- **매개변수**:
  - event_category: {{event_category}}
  - media_name: {{media_name}}
  - media_type: {{media_type}}
- **트리거**: 사용자 정의 이벤트 (이벤트명: media_play)

#### CTA 클릭 추적 태그

- **태그 유형**: Google Analytics: GA4 이벤트
- **구성 태그**: [1단계에서 만든 GA4 구성 태그]
- **이벤트명**: cta_click
- **매개변수**:
  - event_category: {{event_category}}
  - cta_name: {{cta_name}}
  - cta_section: {{cta_section}}
- **트리거**: 사용자 정의 이벤트 (이벤트명: cta_click)

## 추적되는 이벤트

### 1. 스크롤 추적

- **이벤트명**: `scroll_tracking`
- **dataLayer 변수**:
  - `event_category`: "engagement"
  - `section_name`: 섹션명
  - `visibility_percentage`: 가시성 비율
- **추적 섹션**:
  - `hero_section` - 히어로 섹션
  - `categories_section` - 카테고리/샘플 팟캐스트 섹션
  - `features_section` - 기능 소개 섹션
  - `how_it_works_section` - 작동 방식 섹션
  - `cta_section` - CTA/가격 섹션

### 2. 미디어 재생 추적

- **이벤트명**: `media_play`
- **dataLayer 변수**:
  - `event_category`: "media"
  - `media_name`: 미디어명
  - `media_type`: "audio"
- **추적 대상**:
  - 글로벌 뉴스 샘플 재생
  - 테크 트렌드 샘플 재생
  - 라이프스타일 샘플 재생

### 3. CTA 버튼 클릭 추적

- **이벤트명**: `cta_click`
- **dataLayer 변수**:
  - `event_category`: "conversion"
  - `cta_name`: 버튼명
  - `cta_section`: 섹션명
- **추적 대상**:
  - "지금 무료로 시작하기" 버튼 클릭

## 이벤트 확인 방법

### GTM에서 확인

1. GTM 컨테이너 > "미리보기" 모드 활성화
2. 웹사이트에서 이벤트 발생시키기
3. GTM 디버그 창에서 dataLayer 이벤트 확인

### Google Analytics에서 확인

1. Google Analytics 대시보드 접속
2. "실시간" > "이벤트" 에서 실시간 이벤트 확인
3. "보고서" > "이벤트" 에서 상세 이벤트 분석 가능

## 개발 환경에서 테스트

로컬 개발 시에도 GTM 이벤트가 전송됩니다.
개발 중에는:

1. 별도의 GTM 컨테이너 사용 권장
2. 환경 변수를 설정하지 않아 이벤트 전송 비활성화 가능
3. GTM 미리보기 모드로 이벤트 테스트

## 주요 장점

**GTM 사용의 장점:**

- 코드 수정 없이 태그 관리 가능
- 다양한 마케팅 도구 통합 (Facebook Pixel, Google Ads 등)
- A/B 테스트 및 조건부 태그 실행
- 실시간 디버깅 및 미리보기 기능
