# Google Analytics 설정 가이드

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음과 같이 설정하세요:

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Database (기존)
DATABASE_URL="postgresql://username:password@localhost:5432/podcat?schema=public"
```

## GA Measurement ID 획득 방법

1. [Google Analytics](https://analytics.google.com/)에 로그인
2. 새 속성 생성 또는 기존 속성 선택
3. "데이터 스트림" > "웹" 선택
4. 웹사이트 URL 입력 후 스트림 생성
5. "측정 ID" (G-XXXXXXXXXX 형태)를 복사하여 환경 변수에 설정

## 추적되는 이벤트

### 1. 스크롤 추적
- **이벤트명**: `scroll`
- **카테고리**: `engagement`
- **추적 섹션**:
  - `hero_section` - 히어로 섹션
  - `categories_section` - 카테고리/샘플 팟캐스트 섹션
  - `features_section` - 기능 소개 섹션
  - `how_it_works_section` - 작동 방식 섹션
  - `cta_section` - CTA/가격 섹션

### 2. 미디어 재생 추적
- **이벤트명**: `play`
- **카테고리**: `media`
- **추적 대상**:
  - 글로벌 뉴스 샘플 재생
  - 테크 트렌드 샘플 재생
  - 라이프스타일 샘플 재생

### 3. CTA 버튼 클릭 추적
- **이벤트명**: `cta_click`
- **카테고리**: `conversion`
- **추적 대상**:
  - "지금 무료로 시작하기" 버튼 클릭

## 이벤트 확인 방법

1. Google Analytics 대시보드 접속
2. "실시간" > "이벤트" 에서 실시간 이벤트 확인
3. "보고서" > "이벤트" 에서 상세 이벤트 분석 가능

## 개발 환경에서 테스트

로컬 개발 시에도 GA 이벤트가 전송됩니다. 
개발 중에는 별도의 GA 속성을 사용하거나, 
환경 변수를 설정하지 않아 이벤트 전송을 비활성화할 수 있습니다.
