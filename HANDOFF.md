# D.A.R.I 프로젝트 핸드오프 브리핑
> Amazon Bedrock Claude에 붙여넣을 첫 메시지용

---

## 🎯 프로젝트 개요

**D.A.R.I (건축법 검토 시스템)** — Next.js 14 풀스택 프로젝트

- **레포**: `purearchi00-code/pure`
- **브랜치**: `claude/dari-mvp-nextjs-7GMoN`
- **스택**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **현재 상태**: Mock 데이터로 완전 작동하는 MVP 완성

---

## 📋 지금까지 한 결정들

### 1. 방향 전환 — 시민용 → 건축사 우선

처음엔 시민용(자연어로 건축법 질문)으로 설계했지만,
건축사 책임 문제(사진/AI 위조 서류로 형사책임 떠안기)를 다룬 기사를 보고
**건축사용 시스템 우선**으로 방향 전환함.

시민용은 나중에 "건축사 시스템에서 나온 데이터를 시민에게 노출"하는 부산물로 만들 계획.

### 2. 지금 당장 만들 것 — 용도변경 검토 모듈

건축사가 가장 자주 다루는 업무 중 하나.
합의된 v1 스펙:

**입력**: 구조화 폼 (드롭다운)
- 현재 용도 (예: 제1종 근린생활시설)
- 변경할 용도 (예: 휴게음식점)
- 건물 연면적 (㎡)
- 주소 (용도지역 조회용)

**출력**: 6가지 체크리스트 결과 카드
1. 시설군 분류 → 허가/신고/기재변경 결정 (건축법 시행령 14조)
2. 용도지역 허용 여부
3. 주차 기준 재산정
4. 정화조 용량 재산정
5. 피난·소방 기준
6. 지구단위계획·토지이용규제

**판정**: 🟢 신고 가능 / 🟡 허가 필요 / 🔴 불가 또는 고위험

**시설군 매트릭스 범위**: 건축법 시행령 별표1 기준 9개 시설군 전체

---

## 📂 현재 파일 구조

```
dari-mvp/
├── package.json              (Next.js 14 + TS + Tailwind)
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx          ← 메인 UI (시민용 자연어 질의 — 보존)
    │   ├── globals.css
    │   └── api/
    │       ├── land/route.ts
    │       ├── building/route.ts
    │       └── review/route.ts
    └── lib/
        ├── types.ts          ← LandInfo, BuildingInfo, ReviewResult, FullReviewResponse
        ├── mockData.ts       ← 강남구 5개 필지 mock DB
        ├── dataClient.ts     ← fetchLandInfo / fetchBuildingInfo (mock ↔ VWorld/공공데이터)
        └── reviewEngine.ts   ← generateReview (mock ↔ Claude) — 키워드 기반 6시나리오
```

---

## 🔧 추가할 파일들 (아직 미생성)

```
src/
├── app/
│   ├── use-change/page.tsx       🆕 용도변경 검토 UI (구조화 폼)
│   └── api/use-change/route.ts   🆕 용도변경 검토 API
└── lib/
    ├── useChangeEngine.ts        🆕 시설군 매트릭스 + 6체크 로직
    ├── useChangeData.ts          🆕 시설군 분류표 + 용도지역 매트릭스 + 주차기준표
    └── types.ts                  ← UseChangeRequest / UseChangeResult 타입 추가
```

---

## 📐 핵심 타입 (기존 types.ts)

```typescript
// 토지 정보
export interface LandInfo {
  address: string;
  jibun: string;
  jimok: string;
  area: number;
  zoning: string;          // 용도지역 — 용도변경 검토의 핵심 입력값
  district: string;
  altitude: number;
  roadFacing: string;
  landUseRestrictions: string[];
  source: 'mock' | 'vworld' | 'eum';
}

// 건축물 대장
export interface BuildingInfo {
  address: string;
  buildingName?: string;
  totalFloorArea: number;
  buildingArea: number;
  bcr: number;
  far: number;
  floors: { above: number; below: number };
  height: number;
  structure: string;
  mainPurpose: string;     // 현재 용도 — 용도변경 검토의 핵심 입력값
  approvalDate?: string;
  source: 'mock' | 'data.go.kr';
}

// 검토 결과
export interface ReviewResult {
  verdict: 'green' | 'amber' | 'red';
  verdictTitle: string;
  verdictSub: string;
  plainLanguage: string;
  intent: string;
  considerations: string[];
  recommendedAction: string;
  signedAI: {
    reviewerName: string;
    reviewerLicense: string;
    timestamp: string;
    lawHash: string;
    docNumber: string;
  };
  source: 'mock' | 'claude';
}
```

---

## 🔌 환경변수 (아직 미연동, 키 없으면 mock 자동 사용)

```
VWORLD_API_KEY=         # 토지 정보 (국토부)
DATA_GO_KR_API_KEY=     # 건축물대장 (공공데이터포털)
ANTHROPIC_API_KEY=      # Claude LLM (Anthropic)
```

---

## 📌 작업 요청

**지금 당장 만들어야 할 것:**

1. `src/lib/useChangeData.ts`
   - 건축법 시행령 별표1 기준 9개 시설군 분류표 (모든 용도 포함)
   - 시설군 간 변경 방향 매트릭스 (허가/신고/기재변경)
   - 용도지역별 허용 용도 매트릭스
   - 용도별 주차 기준표 (주차장법 시행령 별표1)

2. `src/lib/useChangeEngine.ts`
   - `checkUseChange(request: UseChangeRequest): UseChangeResult` 함수
   - 6가지 체크 로직 (시설군, 용도지역, 주차, 정화조, 피난/소방, 규제)

3. `src/app/api/use-change/route.ts`
   - POST 엔드포인트

4. `src/app/use-change/page.tsx`
   - 구조화 폼 UI (기존 디자인 시스템 — navy/accent/sand 색상 체계 유지)
   - 결과 카드 (체크리스트 형태)

5. `src/lib/types.ts`에 타입 추가:
   - `UseChangeRequest`
   - `UseChangeCheckItem`
   - `UseChangeResult`

---

## 🎨 디자인 시스템 (Tailwind 커스텀 색상)

```javascript
navy: { deep: "#060B22", dark: "#0F1A3D", DEFAULT: "#1B2B5C" }
accent: { DEFAULT: "#C9A961", light: "#D9BC75" }
sand: "#F5F2EC"
ice: "#D9E2F0"
signal: { green: "#2E7D5B", amber: "#B8821F", red: "#8B2E2E" }
```

컴포넌트 클래스:
- `.btn-primary` — 진행 버튼
- `.btn-secondary` — 보조 버튼
- `.card` — 흰 카드 (border + shadow)

---

## ⚠️ 설계 원칙 (지켜야 할 것)

1. **Mock 우선** — API 키 없어도 100% 작동해야 함. 키 있으면 자동 전환.
2. **타입 엄격** — TypeScript strict 모드. any 금지.
3. **추상화 일관성** — dataClient.ts처럼 mock/real을 같은 인터페이스로.
4. **Signed-AI** — 검토 결과에 항상 발행건축사·타임스탬프·문서번호·법령해시 포함.
5. **한국어** — UI 텍스트 전부 한국어.
