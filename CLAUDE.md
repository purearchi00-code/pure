# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🎯 Project Overview

**D.A.R.I** — Building law compliance review system for Korean architects (not general public).

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Node.js ≥18.17
- **Current MVP**: Use-change (용도변경) inspection module with mock data
- **Status**: Architect-first pivot completed (Nov 2024); public data portal APIs in progress
- **Target**: Architects reviewing building code compliance at design/permitting stages

---

## 📋 Common Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Next.js lint (ESLint + TypeScript)
```

**No test suite yet.** Tests should use Jest + React Testing Library when added.

**Environment**: Copy `.env.example` → `.env.local` and populate keys. Missing keys trigger automatic mock-data fallback (100% feature-complete offline).

---

## 🏗️ Architecture: Mock-First + Pluggable APIs

The codebase follows a **three-layer abstraction** pattern to support both offline mock data and real API calls without duplicating logic:

### 1. **Data Client Layer** (`src/lib/dataClient.ts`)

Exports two functions:
```typescript
export async function fetchLandInfo(address: string): Promise<LandInfo>
export async function fetchBuildingInfo(address: string): Promise<BuildingInfo | null>
```

**Decision logic**:
- If `VWORLD_API_KEY` is set → call VWorld API (토지 정보)
- If `DATA_GO_KR_API_KEY` is set → call 공공데이터포털 API (건축물대장)
- If `EUM_API_KEY` is set → call 토지이음 API (용도지역, 지구단위계획)
- Otherwise → return mock data (always succeeds, adds ~300ms delay to simulate network)

**Why this pattern**: Frontend code never knows if it's using mock or real data. New API integrations are added to dataClient, not scattered across components.

### 2. **API Client Layer** (`src/lib/api/*.ts`)

Each public API gets its own module (e.g., `buildingRegisterClient.ts`, `eumClient.ts`):
- Parameter marshalling (한글 주소 → 시군구코드 변환)
- Response parsing (XML/JSON → typed objects)
- Error handling (API failures → descriptive errors logged for debugging)

**Hardcoded mappings**: For MVP, 동 names → 법정동코드 are hardcoded in each client. Replace with `행정안전부_법정동코드 API` once approved.

### 3. **Route Layer** (`src/app/api/*/route.ts`)

Simple pass-throughs that call the dataClient and wrap responses in `NextResponse.json()`.

---

## 📁 Directory Structure & Roles

```
src/
├── app/
│   ├── page.tsx              ← Main UI: citizen self-serve (보존됨, deprecated but kept)
│   ├── use-change/           🆕 Use-change inspection form + results
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── building/route.ts ← GET /api/building?address=...
│       ├── land/route.ts     ← GET /api/land?address=...
│       ├── review/route.ts   ← POST /api/review (deprecated)
│       └── use-change/       🆕 POST /api/use-change (inspection logic)
│           └── route.ts
└── lib/
    ├── dataClient.ts         ← Mock/real API abstraction
    ├── mockData.ts           ← 강남구 5개 필지 + 건축물
    ├── reviewEngine.ts       ← Keyword-based review logic (deprecated)
    ├── useChangeEngine.ts    🆕 Use-change decision matrix (6-point checklist)
    ├── useChangeData.ts      🆕 Facility matrices, zoning rules, parking standards
    ├── types.ts              ← All TypeScript interfaces
    ├── utils/
    │   └── jibunParser.ts    ← Extract lot number (지번) from Korean addresses
    └── api/
        ├── buildingRegisterClient.ts ← 건축물대장 (data.go.kr)
        ├── eumClient.ts              ← 토지이음 (zoning, district plans)
        └── (future) vworldClient.ts
```

**Key principle**: `types.ts` is the source of truth. All interfaces defined here; all components use them. If a new API returns data, add its type to `types.ts` first.

---

## 🔌 Adding a New Public Data API

1. **Create the client** (`src/lib/api/newApiClient.ts`):
   - Parse address → required API parameters (지번 extraction, code lookups)
   - Fetch from API
   - Map response to existing type (or add new type to `types.ts`)
   - Handle errors

2. **Wire into dataClient**:
   - Import the new client
   - Add `const NEW_API_KEY = process.env.NEW_API_KEY` at top
   - Inside `fetchLandInfo` or `fetchBuildingInfo`, add:
     ```typescript
     if (NEW_API_KEY) {
       try {
         const data = await fetchFromNewApi(address);
         if (data) {
           land.someField = data.someField;  // merge into existing object
           land.source = 'new-api';
         }
       } catch (err) {
         console.warn('[newApi] failed, using mock:', err);
       }
     }
     ```

3. **Add env var to `.env.example`** with documentation (source, approval status, what data it provides).

4. **Update hardcoded mappings**: Replace DONG_TO_LEGAL_CODE lookups with actual API calls once the `행정안전부_법정동코드` API is approved.

---

## 🎨 Design System (Tailwind Custom Config)

Colors defined in `tailwind.config.js`:
```javascript
navy: { deep: "#060B22", dark: "#0F1A3D", DEFAULT: "#1B2B5C" }
accent: { DEFAULT: "#C9A961", light: "#D9BC75" }
sand: "#F5F2EC"
ice: "#D9E2F0"
signal: { green: "#2E7D5B", amber: "#B8821F", red: "#8B2E2E" }
```

**Component classes** (defined in globals.css):
- `.btn-primary` — navy background, gold accent on hover (for main CTA)
- `.btn-secondary` — white with navy border (for cancel/back)
- `.card` — white background, navy border, shadow (for result items)

Verdict colors in use-change results:
- 🟢 `.text-signal-green` — 신고 가능 (notification only)
- 🟡 `.text-signal-amber` — 허가 필요 (review step needed)
- 🔴 `.text-signal-red` — 불가 또는 고위험 (blocking issue)

---

## 📋 Types & Interfaces Pattern

**Locations with detailed data** (서울 강남구):
- Hardcoded in `mockData.ts` (5 addresses)
- New real data replaces on API integration

**Beyond hardcoded locations**:
- `dataClient` falls back to mock for unmapped 동 names
- Once 법정동코드 API is integrated, can fetch any address in Korea

**BuildingInfo source field**:
```typescript
source: 'mock' | 'data.go.kr'  // Tells frontend where data came from
```
This is important for architect trust (users need to know if they're reviewing real or demo data).

---

## 🔑 Environment & Keys

**Development** (mock mode):
```bash
cp .env.example .env.local
# Leave all keys blank → full offline operation
npm run dev
```

**With real data** (keys below are examples; acquire from each source):

| Key | Status | Acquisition | Approval Time |
|-----|--------|-------------|---------------|
| `VWORLD_API_KEY` | Not integrated yet | www.vworld.kr (free) | ~1 day |
| `DATA_GO_KR_API_KEY` | ✅ Integrated | data.go.kr (activity request) | 1–2 days |
| `EUM_API_KEY` / `EUM_SECRET_KEY` | Integrated | www.eum.go.kr | ~2 hours |
| `ANTHROPIC_API_KEY` | Integrated | console.anthropic.com (paid) | Instant |

---

## 💡 Core Design Decisions

1. **Mock-first, always works**: No "please set API keys" screens. Missing keys = silent fallback.
2. **Single abstraction layer**: `dataClient.ts` is the only place that knows about APIs. All 50+ other files interact through it.
3. **Architect-centric**: Data is always tied to a specific address/building. Queries are structured (dropdowns), not natural language.
4. **Signed-AI requirement**: Every review result includes `signedAI { reviewerName, timestamp, lawHash, docNumber }` — architects need legal accountability.
5. **Strict TypeScript**: No `any`. Errors should be caught at compile time, not runtime.

---

## 🚀 Upcoming Work (v1 Completion)

From HANDOFF.md:

1. **`src/lib/useChangeData.ts`** — Facility classification matrix (9 groups per 건축법 시행령 별표1) + zoning allowances + parking standards
2. **`src/lib/useChangeEngine.ts`** — 6-point checklist logic (facility group → approval type, zoning allowance, parking recalc, septic recalc, fire/egress, district plan rules)
3. **`src/app/use-change/page.tsx`** — Structured form UI (current use → target use dropdowns, floor area input, address input for zoning lookup)
4. **`src/app/api/use-change/route.ts`** — POST endpoint

All should reuse existing colors/buttons from globals.css and follow the dataClient abstraction (mock data for all 5 hardcoded addresses, real APIs when available).

---

## ⚠️ Common Pitfalls

- **Don't hardcode API calls in components**: Put them in `dataClient.ts` or a new API client module.
- **Don't add TypeScript `any`**: Use discriminated unions (e.g., `source: 'mock' | 'real'`) instead.
- **Don't check `process.env.API_KEY` in components**: Read it once in `dataClient.ts`, pass the result down.
- **Don't forget fallback for unmapped 동 names**: Always return a sensible default (first hardcoded address) rather than error.
- **Mock data delays**: Use `sleep(300 + Math.random() * 400)` to simulate network latency; architects need realistic expectations.
