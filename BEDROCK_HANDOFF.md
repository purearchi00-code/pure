# D.A.R.I 프로젝트 — Amazon Bedrock 인계 문서 (최종)

> 이 문서를 Amazon Bedrock의 Claude 첫 메시지에 통째로 붙여넣으세요.
> 프로젝트의 모든 컨텍스트가 이 안에 있습니다.

---

## 🎯 1. 프로젝트 개요

**D.A.R.I (Routing Intelligence for the Vulnerable)** — 한국 건축법 자동 검토 시스템

- **타깃 사용자**: 건축사 (전문가) + 시민 (일상어 질문)
- **목표**: 부지 검토·기본설계·인허가 단계에서 건축법령·도시계획·건축물 정보를 통합 조회
- **현 상태**: 시민용 자연어 질의 + 건축물대장 실API 연동 + 의도 분류기 작동 MVP 완성
- **방향 전환 이력**: 시민용 → 건축사용 → 현재는 둘 다 지원하는 하이브리드

### GitHub
- **Repo**: https://github.com/purearchi00-code/pure (public)
- **작업 브랜치**: `claude/dari-mvp-nextjs-7GMoN`
- **메인 브랜치**: `main`

### 즉시 실행 가능한 데모
- 단독 HTML 앱: https://raw.githack.com/purearchi00-code/pure/claude/dari-mvp-nextjs-7GMoN/dari-app.html

---

## 🛠️ 2. 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript (strict mode, `any` 금지)
- **스타일**: Tailwind CSS (커스텀 색상)
- **런타임**: Node.js ≥18.17
- **데이터베이스**: 없음 (현재 mock + API 직결)
- **LLM**: 현재 키워드 기반 의도 분류기 → Bedrock Claude로 교체 예정
- **테스트**: 아직 없음 (Jest + RTL 추가 예정)

### 명령어
```bash
npm install      # 의존성 설치
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint + TS 검증
```

---

## 🔑 3. 환경변수 / API 키

`.env.local` 파일 (gitignored):
```bash
# 공공데이터포털 건축HUB 건축물대장정보 서비스 (✅ 발급 완료, 실연동 확인)
DATA_GO_KR_API_KEY=a96b45d2cf830f8009ca2be0c655b6743fba9e45b965be952f16f20879185dd4

# VWorld (국토부 공간정보) — 미발급
VWORLD_API_KEY=

# Anthropic Claude — Bedrock으로 교체 예정
ANTHROPIC_API_KEY=

# 토지이음 EUM — 미발급
EUM_API_KEY=
EUM_SECRET_KEY=

# AWS Bedrock (추가 예정)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-opus-4-7-20250101-v1:0
```

> **핵심**: API 키가 비어있으면 자동으로 mock 모드로 fallback. 키 있으면 자동으로 실 API 호출.

---

## 🏗️ 4. 아키텍처: Mock-First + Pluggable APIs

### 3층 추상화 패턴 (필수 준수)

```
[Frontend Components]
         ↓
[Routes: src/app/api/*/route.ts]      ← 얇은 패스스루
         ↓
[dataClient.ts]                        ← 유일한 결정 레이어
         ↓                              (mock vs real 결정)
[API Clients: src/lib/api/*.ts]        ← 각 외부 API 1개
         ↓
[외부 공공 API or mock 데이터]
```

### 핵심 함수 (`src/lib/dataClient.ts`)
```typescript
export async function fetchLandInfo(address: string): Promise<LandInfo>
export async function fetchBuildingInfo(address: string): Promise<BuildingInfo | null>
```

**결정 로직**:
- `DATA_GO_KR_API_KEY` 있음 → 건축HUB API 호출 (실데이터)
- `EUM_API_KEY` 있음 → 토지이음 API 호출
- 키 없음 → mock 데이터 + 300ms 딜레이로 네트워크 흉내

> Frontend는 mock인지 real인지 모르고 작동. 새 API 추가 시 `dataClient.ts`만 수정.

---

## 📂 5. 파일 구조 (전체)

```
pure/
├── CLAUDE.md                          ← Claude Code용 가이드
├── HANDOFF.md                         ← 이전 인계 문서
├── BEDROCK_HANDOFF.md                 ← 이 문서 (최종)
├── README.md                          (없음)
├── package.json                       (Next.js 14 + TS + Tailwind)
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example                       ← 환경변수 템플릿
├── .gitignore                         (.env.local 제외)
│
├── dari-app.html                      ✅ 단독 실행 웹앱 (서버 불필요)
├── 건축물대장-API-테스트.command         ✅ macOS CLI 더블클릭 런처
├── 건축물대장-웹앱.command               ✅ macOS 웹 더블클릭 런처
│
├── public/
│   └── index.html                     ← Node 서버용 웹 UI
│
├── scripts/
│   ├── server.mjs                     ← 단독 Node HTTP 서버
│   └── test-building-api.mjs          ← API 검증 CLI 스크립트
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css                ← 디자인 시스템 컴포넌트 클래스
│   │   ├── page.tsx                   ← 메인 UI (시민용 자연어 — deprecated이나 보존)
│   │   └── api/
│   │       ├── building/route.ts      ← GET /api/building?address=
│   │       ├── land/route.ts          ← GET /api/land?address=
│   │       └── review/route.ts        ← POST /api/review (deprecated)
│   │
│   └── lib/
│       ├── dataClient.ts              ✅ 핵심 추상화 (mock ↔ real)
│       ├── mockData.ts                ← 강남구 5개 필지 mock DB
│       ├── reviewEngine.ts            ← 키워드 기반 검토 (deprecated)
│       ├── types.ts                   ← TypeScript 인터페이스 (Single Source of Truth)
│       ├── utils/
│       │   └── jibunParser.ts         ← 한국 주소 → 지번 추출
│       └── api/
│           ├── buildingRegisterClient.ts  ✅ 건축HUB 실연동 완료
│           └── eumClient.ts               ⚠️  토지이음 skeleton만
│
└── docs/
    ├── API_LIST.md                                 ← 84개 API 명칭
    ├── API_APPLICATION_OFFICIAL_NAMES.md           ← 84개 API 신청 상세
    ├── API_APPLICATION_BY_ORGANIZATION.md          ← 기관별 정리
    ├── API_APPLICATION_CORRECT_NAME.md             ← 16개 우선 신청 양식
    ├── API_APPLICATION_FORM_TEXT.txt               ← 신청 양식 통째 복사용
    ├── API_SUBMISSION_TABLE.tsv                    ← 엑셀 import용 TSV
    └── PUBLIC_DATA_PORTAL_APPLICATION.md           ← 공공데이터포털 신청 가이드
```

---

## 📐 6. 핵심 TypeScript 타입 (`src/lib/types.ts`)

```typescript
// 토지 정보
export interface LandInfo {
  address: string;
  jibun: string;
  jimok: string;            // 지목 (대, 전, 답...)
  area: number;             // 면적 (㎡)
  zoning: string;           // 용도지역 ← 용도변경 검토의 핵심
  district: string;         // 지구단위계획
  altitude: number;
  roadFacing: string;
  landUseRestrictions: string[];
  source: 'mock' | 'vworld' | 'eum';
}

// 건축물 대장 정보
export interface BuildingInfo {
  address: string;
  buildingName?: string;
  totalFloorArea: number;
  buildingArea: number;
  bcr: number;              // 건폐율
  far: number;              // 용적률
  floors: { above: number; below: number };
  height: number;
  structure: string;
  mainPurpose: string;      // 현재 용도 ← 용도변경 검토의 핵심
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

## ✅ 7. 실연동 완료: 건축HUB 건축물대장 API

### 신청 정보
- **데이터명**: 국토교통부_건축HUB_건축물대장정보 서비스
- **승인 상태**: 자동승인 ✅
- **활용기간**: 2026-05-15 ~ 2028-05-15 (2년)
- **신청유형**: 개발계정 | 활용신청
- **데이터 PK**: 15134735

### 엔드포인트
- **Base URL**: `https://apis.data.go.kr/1613000/BldRgstHubService`
- **표제부 조회**: `getBrTitleInfo`
- **포맷**: JSON+XML (현재 JSON 사용)

### 호출 예시
```bash
curl "https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=a96b45d2cf830f8009ca2be0c655b6743fba9e45b965be952f16f20879185dd4&sigunguCd=11680&bjdongCd=10700&platGbCd=0&bun=0529&ji=0000&numOfRows=1&pageNo=1&_type=json"
```

### 필수 파라미터
| 파라미터 | 의미 | 예시 |
|---------|------|------|
| `serviceKey` | 인증키 | 위 API_KEY |
| `sigunguCd` | 시군구코드 (5자리) | `11680` (강남구) |
| `bjdongCd` | 법정동코드 (5자리) | `10700` (신사동) |
| `platGbCd` | 대지구분 | `0` (대지), `1` (산), `2` (블록) |
| `bun` | 번 (4자리, zero-pad) | `0529` |
| `ji` | 지 (4자리, zero-pad) | `0000` |
| `numOfRows` | 페이지당 결과 | `10` |
| `pageNo` | 페이지 번호 | `1` |
| `_type` | 응답 형식 | `json` |

### 실응답 예시 (신사동 529번지)
```json
{
  "response": {
    "header": { "resultCode": "00", "resultMsg": "NORMAL SERVICE" },
    "body": {
      "items": {
        "item": {
          "platPlc": "서울특별시 강남구 신사동 529번지",
          "newPlatPlc": "서울특별시 강남구 압구정로 112 (신사동)",
          "bldNm": "",
          "archArea": "243.79",
          "totArea": "1343.25",
          "vlRatEstmTotArea": "958.41",
          "grndFlrCnt": "4",
          "ugrndFlrCnt": "1",
          "strctCdNm": "철근콘크리트구조",
          "mainPurpsCdNm": "제2종 근린생활시설",
          "useAprDay": "19871114",
          "oudrAutoUtcnt": "6",
          "mgmBldrgstPk": "102415236"
        }
      },
      "totalCount": "1"
    }
  }
}
```

### 강남구 5개 동 법정동코드 매핑 (현재 하드코딩)
```typescript
const DONG_TO_LEGAL_CODE = {
  신사동:   { sigunguCd: '11680', bjdongCd: '10700' },
  압구정동: { sigunguCd: '11680', bjdongCd: '11000' },
  청담동:   { sigunguCd: '11680', bjdongCd: '10800' },
  역삼동:   { sigunguCd: '11680', bjdongCd: '10100' },
  삼성동:   { sigunguCd: '11680', bjdongCd: '10500' },
};
```

> ⚠️ TODO: `행정안전부_법정동코드` API로 교체하면 전국 지원 가능

### 응답 필드 → TypeScript 매핑 (`buildingRegisterClient.ts`)
| API 필드 | BuildingInfo 필드 | 변환 |
|---------|------------------|------|
| `bldNm` | `buildingName` | string |
| `totArea` | `totalFloorArea` | parseFloat |
| `archArea` | `buildingArea` | parseFloat |
| `bcRat` | `bcr` | parseFloat |
| `vlRat` | `far` | parseFloat |
| `grndFlrCnt` / `ugrndFlrCnt` | `floors.above / below` | parseInt |
| `heit` | `height` | parseFloat |
| `strctCdNm` | `structure` | string |
| `mainPurpsCdNm` | `mainPurpose` | string |
| `useAprDay` | `approvalDate` | `YYYY-MM-DD` 포맷 변환 |

---

## 📋 8. 공공데이터포털 신청 현황 (총 84개)

`docs/API_APPLICATION_OFFICIAL_NAMES.md`에 정확한 명칭·URL·PK 정리됨.

| 기관 | 신청 개수 | 상태 |
|------|----------|------|
| 법제처 | 15 | 미발급 |
| 국토교통부 부지/토지 | 15 | 미발급 |
| 국토교통부 건축물대장 | 5 | ✅ 1개 발급 (건축HUB) |
| 국토교통부 건축인허가 | 3 | 미발급 |
| 국토교통부 도시계획 | 12 | 미발급 |
| 국토교통부 실거래가 | 10 | 미발급 |
| 행정안전부 (주소/코드) | 4 | 미발급 |
| 환경부 | 4 | 미발급 |
| 국토지리정보원 | 4 | 미발급 |
| 소방청 | 3 | 미발급 |
| 승강기안전공단 | 4 | 미발급 |
| 보건복지부 | 2 | 미발급 |
| 국가유산청 | 3 | 미발급 |
| **합계** | **84개** | **1개 완료** |

### 우선 발급해야 할 API (사용 빈도 높음)
1. ⭐ 행정안전부_행정표준코드_법정동코드 → 하드코딩 매핑 제거
2. ⭐ 국토교통부_(도시계획)용도지역정보서비스 → 용도지역 자동 조회
3. ⭐ 국토교통부_지구단위계획 → 부지 규제 조회
4. ⭐ 법제처 국가법령정보 공유서비스 → 법령 본문 직접 조회

---

## 🎨 9. 디자인 시스템

### 색상 (Tailwind 커스텀)
```javascript
navy: { deep: "#060B22", dark: "#0F1A3D", DEFAULT: "#1B2B5C" }
accent: { DEFAULT: "#C9A961", light: "#D9BC75" }
sand: "#F5F2EC"
ice: "#D9E2F0"
signal: { green: "#2E7D5B", amber: "#B8821F", red: "#8B2E2E" }
```

### 검토 결과 판정 색상
- 🟢 `text-signal-green` — 신고 가능 (notification only)
- 🟡 `text-signal-amber` — 허가 필요 (review needed)
- 🔴 `text-signal-red` — 불가/고위험 (blocking)

### 컴포넌트 클래스 (`globals.css`)
- `.btn-primary` — navy + gold hover (메인 CTA)
- `.btn-secondary` — white + navy border (보조)
- `.card` — white + navy border + shadow

### dari-app.html 디자인
- 상단바: 다크 네이비 + 골드 점 + "ROUTING INTELLIGENCE FOR THE VULNERABLE"
- 폼: 샌드 컬러 배경 + 골드 액센트
- 결과: 흰 카드 + 다크 네이비 Signed-AI 패널

---

## 🌐 10. dari-app.html (단독 실행 웹앱)

### 특징
- **서버 불필요**: 더블클릭만 하면 브라우저에서 즉시 동작
- **CORS 우회**: `corsproxy.io` 경유로 공공데이터포털 API 직접 호출
- **Fallback**: 호출 실패 시 5개 강남구 동 mock 데이터 사용
- **반응형**: 모바일·태블릿·데스크탑 모두 대응

### 2단계 흐름
1. **STEP 1**: 시민이 일상어로 질문 + 주소·면적·용적률 입력
2. **STEP 2**: 의도 분류 → 관련 법령·실데이터 표시 → Signed-AI 발행

### 의도 분류기 (키워드 기반, 6종)
| ID | 키워드 | 답변 주제 |
|----|--------|----------|
| `newBuild` | 신축, 새로 짓, 새 건물 | 신축 검토 (용도지역·일조권·주차) |
| `addition` | 증축, 한 층 더, 옥상 올리 | 증축 (구조안전 진단) |
| `balcony` | 발코니, 베란다 | 발코니 확장 (2005년 합법화) |
| `useChange` | 용도변경, 카페로, 음식점 | 시설군 이동 (허가/신고/기재변경) |
| `parking` | 주차, 주차장 | 주차장 설치 기준 |
| `rooftop` | 옥상 컨테이너, 옥탑 | 가설건축물 신고 |

각 의도마다 **6개의 관련 법령**이 자동 매핑되며, 클릭 시 국가법령정보센터로 연결.

### 법령 URL 매핑 (실제 작동)
```javascript
const LAW_DIRECT = {
  '건축법': 'https://www.law.go.kr/법령/건축법',
  '건축법 시행령': 'https://www.law.go.kr/법령/건축법시행령',
  '국토계획법': 'https://www.law.go.kr/법령/국토의계획및이용에관한법률',
  '주차장법': 'https://www.law.go.kr/법령/주차장법',
  // ... (10여개)
};
// Fallback: https://www.law.go.kr/LSW/lsSc.do?query={검색어}
```

---

## ⚠️ 11. 설계 원칙 (반드시 준수)

1. **Mock 우선**: API 키 없어도 100% 작동. 키 있으면 자동 전환. "API 키를 설정하세요" 화면 금지.
2. **타입 엄격**: TypeScript strict 모드. `any` 절대 금지. discriminated union 사용 (`source: 'mock' | 'real'`).
3. **추상화 일관성**: 모든 외부 호출은 `dataClient.ts`를 통해서만. 컴포넌트에서 `fetch` 직접 호출 금지.
4. **Signed-AI 필수**: 모든 검토 결과에 `signedAI { reviewerName, timestamp, lawHash, docNumber }` 포함. 건축사 법적 책임 추적용.
5. **한국어**: 모든 UI 텍스트는 한국어.
6. **API 키 격리**: `process.env.*` 는 `dataClient.ts`에서만 읽기. 컴포넌트에 노출 금지.
7. **Silent Fallback**: 외부 API 실패 → mock으로 자동 전환. 사용자에게 에러 노출 안 함 (개발자 로그만).
8. **동 매핑 fallback**: 매핑 없는 동 이름이 들어오면 에러 throw가 아니라 첫 번째 mock 반환.

---

## 🐛 12. 흔히 하는 실수

- ❌ 컴포넌트에서 `fetch('https://apis.data.go.kr/...')` 직접 호출
- ❌ TypeScript `any` 사용
- ❌ Mock 데이터 없이 API 키가 필수인 코드
- ❌ 매핑되지 않은 동 이름에 대해 에러 throw
- ❌ 시민용 자연어 인풋을 메인 입력으로 (건축사 시스템은 구조화 폼이 원칙)
- ❌ Signed-AI 정보 누락

---

## 🚀 13. v1 완성을 위한 남은 작업 (use-change 모듈)

기존 `HANDOFF.md`의 로드맵. dari-app.html은 시민용이지만, 건축사용 use-change 모듈은 아직 미완성.

### 추가할 파일
1. **`src/lib/useChangeData.ts`** (신규)
   - 건축법 시행령 별표1 기준 **9개 시설군 분류표** (모든 용도)
   - 시설군 간 변경 매트릭스 (허가/신고/기재변경)
   - 용도지역별 허용 용도 매트릭스
   - 용도별 주차 기준표 (주차장법 시행령 별표1)

2. **`src/lib/useChangeEngine.ts`** (신규)
   - `checkUseChange(req: UseChangeRequest): UseChangeResult`
   - **6가지 체크**:
     1. 시설군 분류 → 허가/신고/기재변경
     2. 용도지역 허용 여부
     3. 주차 기준 재산정
     4. 정화조 용량 재산정
     5. 피난·소방 기준
     6. 지구단위계획·토지이용규제

3. **`src/app/use-change/page.tsx`** (신규)
   - 구조화 폼 UI (드롭다운)
   - 결과 카드: 6개 체크리스트 형태
   - 판정: 🟢 신고 가능 / 🟡 허가 필요 / 🔴 불가/고위험

4. **`src/app/api/use-change/route.ts`** (신규)
   - POST 엔드포인트

5. **`src/lib/types.ts`** 타입 추가
   ```typescript
   UseChangeRequest
   UseChangeCheckItem
   UseChangeResult
   ```

---

## 🔄 14. Bedrock 마이그레이션 가이드

### 현재 상태
- `dari-app.html`은 **키워드 기반 의도 분류기** 사용 (LLM 없음)
- `src/lib/reviewEngine.ts`는 deprecated 키워드 매칭
- Anthropic API는 미사용 상태

### Bedrock 전환 작업
1. **AWS SDK 설치**
   ```bash
   npm install @aws-sdk/client-bedrock-runtime
   ```

2. **새 파일: `src/lib/bedrockClient.ts`**
   ```typescript
   import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

   const client = new BedrockRuntimeClient({
     region: process.env.AWS_REGION,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
   });

   export async function reviewWithBedrock(prompt: string): Promise<string> {
     const command = new InvokeModelCommand({
       modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-opus-4-7-20250101-v1:0',
       contentType: 'application/json',
       body: JSON.stringify({
         anthropic_version: 'bedrock-2023-05-31',
         max_tokens: 2048,
         messages: [{ role: 'user', content: prompt }],
       }),
     });
     const response = await client.send(command);
     const body = JSON.parse(new TextDecoder().decode(response.body));
     return body.content[0].text;
   }
   ```

3. **`reviewEngine.ts`를 Bedrock 호출로 교체**
   - 키워드 매칭 → Bedrock에 컨텍스트(법령 본문, 건축물대장 데이터) 전달
   - JSON 응답 받아 `ReviewResult` 타입으로 파싱

4. **dari-app.html의 의도 분류기 → Bedrock 호출로 교체**
   - 현재: 키워드 정규식 매칭
   - 향후: API Route 호출 → Bedrock → 구조화 응답

### 모델 선택 (2026.05 기준)
- **고품질**: `anthropic.claude-opus-4-7-20250101-v1:0` (현재 최고)
- **속도/비용 균형**: `anthropic.claude-sonnet-4-6-20251001-v1:0`
- **저비용**: `anthropic.claude-haiku-4-5-20251001-v1:0`

---

## 📜 15. 즉시 실행 가능한 도구들

### 1) dari-app.html — 단독 웹앱 (서버 불필요)
**즉시 보기**: https://raw.githack.com/purearchi00-code/pure/claude/dari-mvp-nextjs-7GMoN/dari-app.html

다운로드: GitHub raw 링크 → 우클릭 → 다른 이름으로 저장 → 더블클릭

### 2) 건축물대장-API-테스트.command — macOS CLI 검증
프로젝트 클론 후 더블클릭 → Terminal에서 5개 동 메뉴 표시 → 선택하면 실 API 호출

### 3) 건축물대장-웹앱.command — macOS 웹앱 자동 실행
Node.js 서버 + 브라우저 자동 오픈

### 4) scripts/test-building-api.mjs — Node.js 검증 스크립트
```bash
node scripts/test-building-api.mjs 신사동 529
```

---

## 🎯 16. 다음 즉시 작업 우선순위

1. **공공데이터포털 추가 API 발급**
   - 행정안전부_법정동코드 (전국 지원)
   - 도시계획 용도지역
   - 지구단위계획
   - 법제처 국가법령정보

2. **건축사용 use-change 모듈 v1 구현**
   - `useChangeData.ts` → `useChangeEngine.ts` → `use-change/page.tsx` 순

3. **Bedrock 연동**
   - `src/lib/bedrockClient.ts` 신규 작성
   - `reviewEngine.ts` 교체
   - dari-app.html의 의도 분류기 → Bedrock 호출로 업그레이드

4. **테스트 인프라**
   - Jest + React Testing Library 추가
   - 의도 분류기 단위 테스트
   - API 클라이언트 모킹 테스트

5. **PDF 검토서 생성**
   - 현재 `window.print()` 사용 → 추후 react-pdf로 전용 PDF 생성

---

## 📁 17. 첨부 파일 (Bedrock에 함께 공유)

다음을 zip으로 압축해 Bedrock에 첨부하거나 GitHub에서 다운로드:

- 전체 레포: https://github.com/purearchi00-code/pure/archive/refs/heads/claude/dari-mvp-nextjs-7GMoN.zip
- 또는 개별 파일들:
  - `CLAUDE.md` — Claude Code용 가이드
  - `HANDOFF.md` — 이전 인계 문서
  - `BEDROCK_HANDOFF.md` — 이 문서
  - `docs/API_APPLICATION_OFFICIAL_NAMES.md` — 84개 API 정리
  - `dari-app.html` — 단독 실행 데모
  - `src/lib/types.ts` — 모든 타입 정의
  - `src/lib/dataClient.ts` — 핵심 추상화
  - `src/lib/api/buildingRegisterClient.ts` — 건축HUB 실연동

---

## ✅ 18. Bedrock Claude에게 첫 메시지로 보낼 요약문

> 이 문서를 받은 Bedrock Claude는 즉시 다음을 시작할 수 있습니다:

```
안녕하세요. 이 문서는 D.A.R.I 건축법 검토 시스템의 전체 컨텍스트입니다.

요약하면:
- Next.js 14 + TypeScript 풀스택 프로젝트
- 국토교통부 건축HUB API 실연동 완료 (강남구 5개 동)
- 단독 실행 가능한 dari-app.html 데모 작동 중
- 키워드 기반 의도 분류기 → Bedrock으로 교체 예정

저는 지금 다음을 하고 싶습니다:
[ ] use-change 모듈 v1 구현 (시설군 매트릭스)
[ ] Bedrock 연동 (현재 키워드 분류기 → LLM 기반으로)
[ ] 추가 공공데이터포털 API 신청·연동
[ ] (사용자 직접 입력)

GitHub: https://github.com/purearchi00-code/pure
브랜치: claude/dari-mvp-nextjs-7GMoN

API 키:
DATA_GO_KR_API_KEY=a96b45d2cf830f8009ca2be0c655b6743fba9e45b965be952f16f20879185dd4

설계 원칙은 Mock-First, 타입 엄격, dataClient 추상화 일관성입니다.
```

---

**문서 끝.** 이 문서만 있으면 Bedrock Claude가 프로젝트의 모든 컨텍스트를 즉시 파악합니다.
