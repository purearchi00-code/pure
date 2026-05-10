import type { LandInfo, BuildingInfo, ReviewResult } from './types';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * 시민의 자연어 질의 + 토지/건축물 정보 → 검토 결과
 *
 * 현재: 키워드 기반 mock
 * 추후: Claude API + Bedrock Knowledge Bases (강남구 4년치 민원 데이터)
 */
export async function generateReview(
  query: string,
  land: LandInfo,
  building: BuildingInfo | null
): Promise<ReviewResult> {
  if (ANTHROPIC_KEY) {
    // return generateReviewWithClaude(query, land, building);
    console.warn('[Claude API] 키는 설정됐지만 아직 구현 안 됨. mock 사용.');
  }

  await sleep(800 + Math.random() * 600);

  return generateMockReview(query, land, building);
}

/* ============================================================
 * Mock 검토 엔진 (키워드 기반)
 * ============================================================ */

function generateMockReview(
  query: string,
  land: LandInfo,
  building: BuildingInfo | null
): ReviewResult {
  const text = query.toLowerCase();
  const now = new Date();

  // 시나리오 분기
  let intent = '';
  let verdict: 'green' | 'amber' | 'red' = 'amber';
  let verdictTitle = '';
  let verdictSub = '';
  let plainLanguage = '';
  let considerations: string[] = [];
  let recommendedAction = '';

  // 1. 옥상 컨테이너 (빨강)
  if (containsAny(text, ['컨테이너', '옥상', '옥탑'])) {
    intent = '옥상 컨테이너 설치';
    verdict = 'red';
    verdictTitle = '위반 가능성이 높습니다';
    verdictSub = '옥상 컨테이너 설치는 위반건축물에 해당할 가능성이 매우 높습니다.';
    plainLanguage = `옥상에 컨테이너를 사무실로 사용하시는 것은 "가설건축물"이 아닌 "신축"으로 분류됩니다. ${land.address}는 ${land.zoning}이며, 별도 건축허가가 필요합니다.`;
    considerations = [
      '구조 안전 검토 필수',
      '일조권 사선제한 검토',
      '소방·피난 기준 충족 필요',
      '무허가 시 위반건축물 등록 + 이행강제금',
    ];
    recommendedAction = '절대 임의로 진행하지 마시고 건축사 상담 받으세요.';
  }
  // 2. 발코니/베란다 확장 (앰버)
  else if (containsAny(text, ['베란다', '발코니', '확장', '방 만들', '방만들'])) {
    intent = '발코니 확장 (전용면적 증가)';
    verdict = 'amber';
    verdictTitle = '전문가 상담이 필요합니다';
    verdictSub = '법령 해석에 모호한 영역(그레이존)이 있어 현업 건축사 매칭을 권장합니다.';
    plainLanguage = `2005년 12월 이후 발코니 확장은 합법화되었지만, 구조 안전 진단과 신고 절차가 필요합니다. ${land.district}이라 별도 심의 사항이 있을 수 있습니다.`;
    considerations = [
      '구조 안전 진단 필요',
      '발코니 확장 신고 (구청)',
      `${land.district} 별도 심의 가능성`,
      '단열·결로 방수 시공 필수',
    ];
    recommendedAction = '강남구건축사회 매칭 건축사 상담 권장.';
  }
  // 3. 카페 용도변경 (초록)
  else if (containsAny(text, ['카페', '커피숍', '휴게음식점'])) {
    intent = '근린생활시설 → 휴게음식점 용도변경';
    verdict = 'green';
    verdictTitle = '용도변경 신고로 진행 가능합니다';
    verdictSub = '동일 시설군 내 변경이라 신고만으로 진행 가능합니다.';
    plainLanguage = `${land.address}의 용도지역은 ${land.zoning}으로 휴게음식점 영업이 가능합니다. 동일 시설군(영업시설군) 내 변경이라 신고만으로 진행 가능합니다.`;
    considerations = [
      '주차 기준: 휴게음식점 134㎡당 1대',
      '정화조 용량 재산정 필요',
      '소방·피난 기준 확인',
      `${land.district} 디자인 가이드라인 확인`,
    ];
    recommendedAction = '용도변경 신고서 + 영업신고 진행.';
  }
  // 4. 주택 → 사무실 (앰버)
  else if (containsAny(text, ['주택', '집', '주거']) &&
           containsAny(text, ['사무실', '오피스', '업무'])) {
    intent = '주거시설군 → 영업시설군 용도변경';
    verdict = 'amber';
    verdictTitle = '용도변경 허가가 필요합니다';
    verdictSub = '시설군이 다른 용도로의 변경이라 허가 절차와 추가 검토가 필요합니다.';
    plainLanguage = `시설군이 다른 변경(주거→영업)은 신고가 아닌 "허가"가 필요합니다. ${land.zoning}에서 사무실 사용 가능 여부 확인이 우선입니다.`;
    considerations = [
      '관할 구청 용도변경 허가 필요',
      '주차대수 재산정',
      '정화조 용량 증대',
      '소방·피난 기준 강화',
      '장애인 편의시설 설치 의무 확인',
    ];
    recommendedAction = '건축사를 통한 정식 용도변경 허가 신청.';
  }
  // 5. 지하 + 학원 (빨강)
  else if (containsAny(text, ['지하']) &&
           containsAny(text, ['학원', '교습소', '독서실'])) {
    intent = '지하층 → 교육연구시설 용도변경';
    verdict = 'red';
    verdictTitle = '학원으로의 용도변경은 거의 불가능합니다';
    verdictSub = '지하층 + 다중이용시설 + 피난 기준 모두 검토 대상이며 변경이 불가능할 수 있습니다.';
    plainLanguage = '지하층은 학원으로 사용하기 가장 어려운 위치입니다. 피난·채광·환기 기준 모두 거의 충족 불가합니다.';
    considerations = [
      '피난 기준 미충족 (직통계단 2개 이상 필요)',
      '자연채광 기준 미충족',
      '소방 시설 전면 신설',
      '학원법 + 건축법 이중 위반 위험',
    ];
    recommendedAction = '다른 위치(지상층) 검토 권장.';
  }
  // 6. 규모/층수 질의 (동적)
  else if (containsAny(text, ['몇 층', '몇층', '얼마나', '용적률', '건폐율', '주차'])) {
    intent = '신축 가능 규모 산정';
    verdict = 'green';
    verdictTitle = '검토 결과 — 신축 가능 규모';
    verdictSub = `${land.zoning} 기준으로 산정한 최대 규모입니다.`;
    const maxFar = parseInt(land.zoning.includes('상업') ? '600' : '300');
    const maxBuildArea = land.area * 0.5;
    const totalArea = (land.area * maxFar) / 100;
    const floors = Math.min(Math.ceil(totalArea / maxBuildArea), 10);
    plainLanguage = `${land.address} 부지(${land.area}㎡, ${land.zoning})에는 최대 ${floors}층 · 연면적 약 ${totalArea.toFixed(0)}㎡ 규모로 신축이 가능합니다.`;
    considerations = [
      `건폐율 50% → 1층 ${maxBuildArea.toFixed(0)}㎡`,
      `용적률 ${maxFar}% → 연면적 ${totalArea.toFixed(0)}㎡`,
      `주차 ${Math.ceil(totalArea / 134)}대 (134㎡당 1대)`,
      `${land.district} 추가 규제 확인 필요`,
    ];
    recommendedAction = '건축사 상담 후 정식 인허가 절차 진행.';
  }
  // 기본: 일반 질의
  else {
    intent = '일반 건축 검토';
    verdict = 'amber';
    verdictTitle = '추가 정보가 필요합니다';
    verdictSub = '구체적인 질의를 통해 더 정확한 검토가 가능합니다.';
    plainLanguage = `${land.address}는 ${land.zoning}이며, 면적 ${land.area}㎡입니다. 구체적인 행위(증축/용도변경/신축 등)를 알려주시면 더 정확히 검토드릴 수 있습니다.`;
    considerations = [
      `용도지역: ${land.zoning}`,
      `지구단위계획: ${land.district}`,
      `토지이용규제: ${land.landUseRestrictions.join(', ')}`,
    ];
    recommendedAction = '구체적 행위를 명시한 재질의 또는 건축사 직접 상담.';
  }

  // 문서 번호 + 해시 생성
  const docNumber = `DARI-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${randStr(5)}`;
  const lawHash = `0x${randStr(8)}...${randStr(6)}`;

  return {
    verdict,
    verdictTitle,
    verdictSub,
    plainLanguage,
    intent,
    considerations,
    recommendedAction,
    signedAI: {
      reviewerName: '유여훈 건축사',
      reviewerLicense: '자격번호 12345',
      timestamp: now.toISOString(),
      lawHash: `${lawHash} · 건축법시행령 v2026.04.01`,
      docNumber,
    },
    source: 'mock',
  };
}

/* ============================================================
 * Helpers
 * ============================================================ */

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function randStr(len: number): string {
  return Math.random().toString(36).slice(2, 2 + len).toUpperCase();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ============================================================
 * 실제 Claude API 호출 시 참고 스켈레톤
 * ============================================================ */

// async function generateReviewWithClaude(
//   query: string,
//   land: LandInfo,
//   building: BuildingInfo | null
// ): Promise<ReviewResult> {
//   const Anthropic = (await import('@anthropic-ai/sdk')).default;
//   const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
//
//   const systemPrompt = `당신은 D.A.R.I, 시민용 건축법 검토 AI입니다.
//   입력된 토지/건축물 정보와 시민의 자연어 질의를 바탕으로 그레이존을 식별하고,
//   3색 신호등(green/amber/red)으로 위험도를 분류합니다.
//   책임 있는 AI 원칙에 따라, 위험한 답변은 절대 하지 않습니다.`;
//
//   const userPrompt = `
//   [토지 정보]
//   주소: ${land.address}
//   용도지역: ${land.zoning}
//   면적: ${land.area}㎡
//   지구단위계획: ${land.district}
//
//   [시민 질의]
//   ${query}
//
//   JSON 형식으로 응답:
//   { "verdict": "green|amber|red", "verdictTitle": "...", ... }
//   `;
//
//   const response = await client.messages.create({
//     model: 'claude-opus-4-7',
//     max_tokens: 2000,
//     system: systemPrompt,
//     messages: [{ role: 'user', content: userPrompt }],
//   });
//
//   const text = response.content[0].type === 'text' ? response.content[0].text : '';
//   const parsed = JSON.parse(text);
//   return { ...parsed, source: 'claude' };
// }
