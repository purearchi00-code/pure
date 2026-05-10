// 토지 정보 (VWorld API와 호환되는 구조)
export interface LandInfo {
  address: string;        // 정제된 주소
  jibun: string;          // 지번
  jimok: string;          // 지목 (대, 전, 답...)
  area: number;           // 면적 (㎡)
  zoning: string;         // 용도지역 (제2종일반주거지역 등)
  district: string;       // 지구단위계획 등
  altitude: number;       // 표고
  roadFacing: string;     // 도로 접면
  landUseRestrictions: string[]; // 토지이용규제
  source: 'mock' | 'vworld' | 'eum'; // 데이터 출처
}

// 건축물 대장 정보 (공공데이터포털 API와 호환)
export interface BuildingInfo {
  address: string;
  buildingName?: string;     // 건물명
  totalFloorArea: number;    // 연면적 (㎡)
  buildingArea: number;      // 건축면적 (㎡)
  bcr: number;               // 건폐율 (%)
  far: number;               // 용적률 (%)
  floors: { above: number; below: number }; // 지상/지하 층수
  height: number;            // 높이 (m)
  structure: string;         // 구조 (철근콘크리트 등)
  mainPurpose: string;       // 주용도
  approvalDate?: string;     // 사용승인일
  source: 'mock' | 'data.go.kr';
}

// LLM 검토 결과
export interface ReviewResult {
  verdict: 'green' | 'amber' | 'red';
  verdictTitle: string;
  verdictSub: string;
  plainLanguage: string;
  intent: string;            // 분류된 의도
  considerations: string[];  // 검토 사항 리스트
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

// 종합 검토 응답 (frontend → API 호출 시)
export interface FullReviewResponse {
  land: LandInfo;
  building: BuildingInfo | null;
  review: ReviewResult;
  query: string;
}
