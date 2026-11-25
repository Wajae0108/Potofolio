# BEYOND THE INFRA — Visual Experience 2.0 구현 계획

## 1. 목표와 고정 조건

- 기존 Vite 멀티페이지 구조를 유지한다.
- 유지할 URL:
  - `/`
  - `/projects/anok.html`
  - `/projects/haru-signal.html`
  - `/projects/cloud-lab.html`
- 기존 프로젝트명, 설명, 역할, 메타데이터, 연락처, 링크, 상세 페이지 본문을 수정하거나 새 사실을 추가하지 않는다.
- 기존 테마 토글, 언어 버튼, 모바일 메뉴, 스크롤 진행률, 이력서 준비 상태, 프로젝트 이동 링크를 유지한다.
- React 전환이나 애니메이션 라이브러리 도입 없이 현재 HTML/CSS/Vanilla JS 구조를 사용한다.
- 다크 테마를 대표 경험으로 설계하되 기존 라이트 테마도 대비와 가독성이 깨지지 않도록 유지한다.
- 실제 프로필 사진과 기존 프로젝트 표지 이미지만 사용한다. 새 인물 이미지나 존재하지 않는 결과 화면은 생성하지 않는다.

## 2. 디자인 방향

### 핵심 인상

- Linear의 정밀한 UI 밀도, Vercel의 흑백 대비, Apple의 공간감과 타이포그래피를 결합한 `Premium Dark Editorial`.
- 장식보다 타이포그래피, 여백, 이미지 스케일, 얇은 선, 제한된 Accent로 위계를 만든다.
- 모든 영역을 카드로 감싸지 않고, 풀블리드 이미지·에디토리얼 컬럼·얇은 구분선·비대칭 그리드를 혼합한다.

### 디자인 토큰

- 배경: `#08090B`, `#101216`, `#171A20`
- 텍스트: `#F7F8FA`, `#A0A6B2`, `#68707E`
- Accent: `#75E5FF`, `#8B9EFF`
- 최대 폭: 외곽 1440px, 주요 콘텐츠 1200px
- 여백: Desktop 64px, Tablet 32px, Mobile 20px
- 섹션 간격: 120–180px
- 모서리: 이미지/주요 패널에만 12–16px, 텍스트 섹션은 선과 여백 위주
- 글꼴: 영문 Inter, 한글은 기존 Noto Sans KR을 Pretendard 계열 fallback 앞에 배치하고 네트워크 의존성을 늘리지 않는다. 메타데이터는 JetBrains Mono 유지.

## 3. 메인 페이지

### 3.1 Navigation

- 초기 상태는 투명 배경과 최소한의 브랜드 마크만 보이게 한다.
- 스크롤 시 얇은 하단 선, 다크 반투명 배경, 낮은 강도의 blur를 적용한다.
- 메뉴 간격과 크기를 축소해 우측에 정렬하고 활성 섹션에는 짧은 cyan indicator를 표시한다.
- 모바일 메뉴는 헤더 아래 드롭다운이 아니라 전체 화면 오버레이로 변경한다.
- 오버레이 메뉴는 큰 번호/타이포그래피, 현재 페이지 맥락, 닫기 동작을 제공하되 기존 링크와 JS 로직은 유지한다.

### 3.2 Hero

- 현재 이름, 희망 직무, 관심 분야, 소개 문장, 실제 프로필 사진, CTA를 모두 유지한다.
- 좌측은 대형 이름과 에디토리얼 프로필 정보, 우측은 실제 사진을 중심으로 재배치한다.
- 사진 뒤에 CSS만으로 만든 절제된 네트워크 노드·연결선·궤도 레이어를 추가해 PRD의 3D 네트워크 방향을 충족한다.
- 장식 레이어는 `aria-hidden`으로 처리하고 포인터에 최대 6–8px 범위로만 반응한다.
- 이름은 줄 단위 마스크 reveal, 정보와 CTA는 70–100ms stagger로 등장시킨다.
- 기존 무한 aurora/wordmark 움직임은 제거하거나 정적인 배경 깊이로 바꿔 반복 모션을 줄인다.
- 모바일에서는 네트워크의 선과 blur를 단순화하고 사진과 텍스트를 1열로 배치한다.

### 3.3 About

- 기존 4개 bento 카드를 제거하지 않고 의미를 보존한 채, “큰 선언문 + 우측 정보 인덱스”의 에디토리얼 레이아웃으로 변환한다.
- 카드별 박스 반복을 줄이고 얇은 가로선과 번호, 큰 핵심 문구로 구분한다.
- 현재 개발 철학 문장을 섹션의 가장 강한 인용문으로 사용한다.
- 프로필 사진은 Hero 한 곳에서만 강하게 사용해 중복을 피한다.

### 3.4 Projects

- 3개 프로젝트 콘텐츠와 링크를 그대로 유지한다.
- ANOK를 full-width featured project로 구성한다.
- 하루 시그널과 AWS Cloud Lab은 2열 비대칭 editorial grid로 배치한다.
- Featured:
  - 이미지가 먼저 보이는 넓은 16:9 영역
  - 하단에 큰 제목, 역할, 설명, 기간/상태
- Secondary:
  - 하루 시그널은 이미지 비중을 높인다.
  - Cloud Lab은 기존 네트워크 다이어그램을 시각 중심으로 사용한다.
- 역할은 태그 묶음보다 `MY CONTRIBUTION` 라벨과 강한 본문 타이포그래피로 강조한다.
- hover는 이미지 `scale(1.04)`, 제목 4px 이동, 화살표 대각 이동, border 명도 변화만 사용한다.
- 3D tilt는 제거한다.

### 3.5 How I Work / Journey / Contact

- How I Work는 4열 카드 대신 하나의 수평 프로세스 레일로 만들고 번호와 키워드를 강조한다.
- Journey는 기존 연도 데이터가 없으므로 임의 연도를 생성하지 않는다. 기존 FOUNDATION–NOW 라벨을 좌측 메타 컬럼으로 사용하고 중앙 수직선, 우측 설명 구조로 재설계한다.
- 스크롤된 타임라인 항목은 IntersectionObserver로 `is-current` 상태를 부여해 지나온 라인만 Accent로 표시한다.
- Contact는 화면 중앙의 대형 문구와 이메일 CTA를 중심으로 구성한다.
- GitHub, 이력서 준비 버튼, 상태 문구를 모두 유지하고 하단 선 애니메이션을 추가한다.

## 4. 프로젝트 상세 페이지

### 4.1 공통 Hero

- 세 상세 페이지의 DOM 구조를 동일한 편집 디자인 규칙으로 정리한다.
- breadcrumb, case label, 제목, 기존 lead, 기존 metadata를 유지한다.
- 제목은 88–120px 범위의 대형 타이포그래피, metadata는 얇은 선으로 나뉜 3열 구조로 배치한다.
- ANOK와 하루 시그널 표지는 1440px 폭에 가까운 full-bleed 이미지로 확대한다.
- Cloud Lab은 기존 CSS 다이어그램을 같은 비율과 프레임의 hero visual로 유지한다.

### 4.2 읽기 구조

- 데스크톱에서는 좌측 `ON THIS PAGE` 인덱스를 sticky로 유지하되 더 작고 정교하게 만든다.
- 우측 본문은 최대 820–900px로 제한하고 본문 행 길이를 관리한다.
- 현재 섹션은 IntersectionObserver로 인덱스에 active indicator를 표시한다.
- 모바일에서는 sticky 인덱스를 제거하고 콘텐츠를 단일 컬럼으로 표시한다.

### 4.3 Contribution — 핵심 시각 요소

- 기존 `MY ROLE & CONTRIBUTION` 또는 `PRACTICE SCOPE` 섹션의 텍스트를 그대로 사용한다.
- 섹션 상단에 기존 라벨을 유지하면서 시각적 headline `WHAT I DID.`를 보조 장식 텍스트로 표현한다. 새 책임이나 결과 문장은 만들지 않는다.
- 각 기존 항목을 대형 번호 + 큰 책임명 + 얇은 구분선 구조로 변경한다.
- 좌측 headline은 데스크톱에서 섹션 범위 내 sticky, 우측 목록은 순차 reveal한다.
- ANOK의 담당 범위 제외 안내문도 유지하며 대비가 분명한 note로 표현한다.
- Cloud Lab은 이 섹션이 프로젝트 기여가 아닌 실습 범위임을 현재 라벨 그대로 유지한다.

### 4.4 나머지 상세 섹션

- Problem/Goals의 3개 항목은 동일 카드 반복 대신 3열 editorial index로 정리한다.
- Architecture는 얇은 연결선과 명확한 노드로 정돈하고 모바일에서는 세로 흐름으로 변환한다.
- Testing/Challenges blockquote는 큰 pull quote로 강조한다.
- Lessons와 기술 태그는 마지막 정리 영역으로 시각적 밀도를 낮춘다.
- 페이지 하단 next-project는 대형 제목과 방향 화살표가 있는 full-width transition panel로 개선한다.
- 기존 이미지가 2개뿐이므로 별도의 빈 Visual Evidence 갤러리는 만들지 않는다. 각 페이지 Hero 이미지를 가장 강한 시각 증거로 사용한다.

## 5. Motion 및 인터랙션

- reveal 기본값: 560–650ms, `opacity`와 `translateY(24px)`만 사용한다.
- blur와 clip-path가 동시에 적용된 현재 무거운 reveal은 제거한다.
- Hero line reveal은 CSS mask/overflow 기반 stagger로 구현한다.
- 프로젝트 hover는 280–320ms로 통일한다.
- 버튼 화살표는 hover 시 `translate(3px, -3px)`로 이동한다.
- 페이지 진행률과 header 상태는 기존 requestAnimationFrame/scroll 로직을 유지한다.
- custom cursor는 프로젝트 이미지처럼 명시된 인터랙션 영역에서만 확대하고 일반 텍스트 탐색을 방해하지 않게 단순화한다.
- reveal 대상은 JS 실행 전에 콘텐츠가 숨지 않도록 `html.js` 클래스가 있을 때만 초기 opacity 0을 적용한다.
- `prefers-reduced-motion: reduce`에서는 reveal, parallax, marquee, cursor 추적을 모두 정지하고 콘텐츠를 즉시 표시한다.
- 무한 aurora, wordmark breathing, 강한 회전은 제거한다. marquee는 낮은 대비로 유지하거나 정적으로 전환한다.

## 6. 파일별 변경 범위

### HTML

- `index.html`
  - 콘텐츠/링크는 유지하면서 Hero, About, Projects, Process, Journey, Contact의 wrapper/class 구조를 정돈한다.
  - 장식용 network layer와 접근성 속성을 추가한다.
- `projects/anok.html`
- `projects/haru-signal.html`
- `projects/cloud-lab.html`
  - 공통 case hero, contribution, section wrapper 구조를 일관되게 맞춘다.
  - 기존 텍스트와 데이터는 그대로 보존한다.

### CSS

- `css/variables.css`: PRD 색상, 폭, spacing, easing 토큰 통일.
- `css/base.css`: 타이포그래피, 배경, focus, 공통 section/label 규칙.
- `css/layout.css`: 메인 페이지의 editorial layout과 프로젝트 showcase.
- `css/components.css`: 버튼, navigation, case study, contribution, next-project 시각 시스템.
- `css/animations.css`: 절제된 reveal/stagger/hover motion으로 교체.
- `css/responsive.css`: 1180/900/620 구간을 desktop/tablet/mobile 요구사항에 맞게 재작성.
- `css/reset.css`: 필요한 경우에만 media와 form 기본값을 보완하고 기존 reset은 유지.

### JavaScript

- `js/navigation.js`
  - 기존 메뉴/테마/언어 기능을 보존한다.
  - 모바일 overlay의 접근성 상태, Escape 닫기, focus 반환을 추가한다.
  - active section 표시를 새 navigation 구조와 맞춘다.
- `js/animations.js`
  - 카드 tilt 제거.
  - 저강도 hero/network parallax, 안전한 reveal, 타임라인 current state, case index active state를 추가한다.
  - 모든 scroll 작업은 rAF와 passive listener를 사용한다.
- `js/projects.js`
  - 이력서 준비 상태 로직은 그대로 유지한다.
- `js/main.js`
  - 초기 `html.js` 상태를 HTML 인라인 없이 안전하게 설정할 수 없으므로, 각 HTML의 head에 짧은 `document.documentElement.classList.add("js")` 스크립트를 넣거나 기본-visible 전략을 사용한다. 기본-visible + JS가 즉시 `reveal-ready`를 추가하는 방식을 우선해 CLS와 no-JS 접근성을 보호한다.

## 7. 성능 및 접근성 방침

- 새 외부 UI/모션 라이브러리를 추가하지 않는다.
- CSS network visual만 사용해 새 이미지 다운로드 비용을 만들지 않는다.
- 기존 WebP의 width/height와 lazy/fetchpriority 설정을 유지한다.
- `transform`과 `opacity` 중심으로 애니메이션하고 큰 blur 영역과 상시 `will-change`를 피한다.
- 모든 링크/버튼의 focus-visible을 확인한다.
- 모바일 메뉴는 Escape, 링크 선택, 메뉴 버튼 재클릭으로 닫히게 하고 body scroll을 복구한다.
- 실제 `<button>`, `<a>`, heading 순서, alt text를 유지한다.
- 가로 overflow가 생기지 않도록 320px 폭까지 검사한다.

## 8. 검증 계획

### 정적/빌드 검증

1. `pnpm build`
2. 생성된 네 HTML route 확인
3. `rg`로 기존 주요 링크, 이메일, GitHub URL, 프로젝트 제목 및 상세 섹션 텍스트가 남아 있는지 확인
4. 존재하지 않는 `#skills`, `#engineering` 링크가 재유입되지 않았는지 확인

### 브라우저 검증

1. Desktop 메인:
   - Hero 이미지/텍스트/CTA 표시
   - 프로젝트 featured + 2열 구조
   - active nav와 scroll reveal
2. Desktop 상세 3종:
   - 표지 또는 Cloud 다이어그램
   - sticky index
   - Contribution 강조
   - next-project 링크
3. Mobile:
   - 1열 레이아웃
   - 전체 화면 메뉴 열기/닫기
   - 텍스트 잘림과 가로 스크롤 없음
4. Theme:
   - 다크/라이트 전환 후 텍스트와 패널 대비 확인
5. Accessibility:
   - 키보드 포커스
   - Escape 메뉴 닫기
   - reduced motion CSS 확인
6. Console:
   - 최초 검사와 수정 후 검사에서 관련 런타임 오류 없음 확인

### 현실적인 성능 검증

- 로컬 빌드 크기와 이미지 크기 회귀를 확인한다.
- Make 환경에 Lighthouse 실행기가 명시되어 있지 않으므로 90점 수치를 보장하지 않고, 라이브러리 미추가·WebP 유지·layout shift 방지·GPU 친화 애니메이션으로 목표를 지원한다.
- Lighthouse를 실행할 수 있는 도구가 확인되면 Desktop/Mobile 측정을 추가하고, 불가능하면 미측정임을 최종 보고에 명시한다.

## 9. 완료 기준

- 네 페이지가 동일한 premium dark editorial 디자인 시스템을 공유한다.
- 메인 프로젝트 영역은 featured + asymmetric showcase로 보인다.
- 세 상세 페이지에서 contribution/scope가 가장 강한 본문 섹션으로 보인다.
- 기존 콘텐츠, URL, 프로젝트 이동, 연락처, 테마, 모바일 메뉴, 이력서 준비 동작이 유지된다.
- Desktop/Tablet/Mobile에서 잘림과 가로 스크롤이 없다.
- reduced motion에서 모든 콘텐츠가 즉시 읽힌다.
- 빌드가 통과하고 주요 브라우저 프리뷰에서 런타임 오류가 없다.
