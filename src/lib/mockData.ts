import type { LandInfo, BuildingInfo } from './types';

/**
 * Mock 토지/건축물 데이터베이스
 *
 * 실제 API 연동 시:
 * - VWorld API (https://www.vworld.kr) — 토지 정보
 * - 공공데이터포털 건축물대장 API (https://www.data.go.kr) — 건축물 정보
 * - 토지이음 (https://www.eum.go.kr) — 용도지역·지구단위계획
 *
 * Mock 데이터는 실제 API 응답 구조와 동일하게 설계되어,
 * 추후 src/lib/api/vworld.ts, src/lib/api/buildingRegistry.ts 등으로
 * 교체 시 타입과 인터페이스가 호환됩니다.
 */

interface MockEntry {
  matchKeys: string[];  // 검색 키워드들 (다양한 표현 허용)
  land: LandInfo;
  building: BuildingInfo | null;
}

export const MOCK_LAND_DB: MockEntry[] = [
  // 1. 신사동 529 (가로수길)
  {
    matchKeys: ['신사동 529', '신사 529', '강남 신사동 529'],
    land: {
      address: '서울특별시 강남구 신사동 529',
      jibun: '529',
      jimok: '대',
      area: 250.5,
      zoning: '제2종일반주거지역',
      district: '신사 지구단위계획구역 (가로수길 특화구역)',
      altitude: 32,
      roadFacing: '광로 (가로수길)',
      landUseRestrictions: [
        '지구단위계획 미관지구',
        '도시미관지구',
        '대공방어협조구역',
      ],
      source: 'mock',
    },
    building: {
      address: '서울특별시 강남구 신사동 529',
      buildingName: '신사 빌딩',
      totalFloorArea: 712.3,
      buildingArea: 124.8,
      bcr: 49.8,
      far: 284.4,
      floors: { above: 5, below: 1 },
      height: 19.2,
      structure: '철근콘크리트조',
      mainPurpose: '제2종 근린생활시설',
      approvalDate: '2008-03-15',
      source: 'mock',
    },
  },

  // 2. 압구정동 (전형적인 주거지)
  {
    matchKeys: ['압구정동', '압구정 480', '강남 압구정 480'],
    land: {
      address: '서울특별시 강남구 압구정동 480',
      jibun: '480',
      jimok: '대',
      area: 198.0,
      zoning: '제3종일반주거지역',
      district: '압구정 아파트지구',
      altitude: 28,
      roadFacing: '소로 (8m)',
      landUseRestrictions: [
        '아파트지구',
        '학교환경위생정화구역',
      ],
      source: 'mock',
    },
    building: {
      address: '서울특별시 강남구 압구정동 480',
      buildingName: '압구정 빌라',
      totalFloorArea: 540.0,
      buildingArea: 99.0,
      bcr: 50.0,
      far: 272.7,
      floors: { above: 4, below: 1 },
      height: 14.5,
      structure: '철근콘크리트조',
      mainPurpose: '단독주택 (다가구)',
      approvalDate: '2002-11-22',
      source: 'mock',
    },
  },

  // 3. 청담동 (상업+주거)
  {
    matchKeys: ['청담동', '청담 88', '강남 청담동 88'],
    land: {
      address: '서울특별시 강남구 청담동 88',
      jibun: '88',
      jimok: '대',
      area: 412.7,
      zoning: '일반상업지역',
      district: '청담 명품거리 지구단위계획',
      altitude: 36,
      roadFacing: '대로 (압구정로)',
      landUseRestrictions: [
        '지구단위계획구역',
        '미관지구',
        '주차장 설치제한지역',
      ],
      source: 'mock',
    },
    building: {
      address: '서울특별시 강남구 청담동 88',
      buildingName: '청담 그랜드빌딩',
      totalFloorArea: 2845.6,
      buildingArea: 247.6,
      bcr: 60.0,
      far: 689.4,
      floors: { above: 9, below: 3 },
      height: 38.7,
      structure: '철골철근콘크리트조',
      mainPurpose: '근린생활시설 (1·2종 복합)',
      approvalDate: '2015-07-08',
      source: 'mock',
    },
  },

  // 4. 역삼동 (오피스 밀집)
  {
    matchKeys: ['역삼동', '역삼 825', '강남 역삼동 825'],
    land: {
      address: '서울특별시 강남구 역삼동 825',
      jibun: '825',
      jimok: '대',
      area: 1024.3,
      zoning: '일반상업지역',
      district: '역삼 도심형 지구단위계획',
      altitude: 41,
      roadFacing: '광로 (테헤란로)',
      landUseRestrictions: [
        '지구단위계획구역',
        '도시계획시설(도로)',
      ],
      source: 'mock',
    },
    building: {
      address: '서울특별시 강남구 역삼동 825',
      buildingName: '역삼 타워',
      totalFloorArea: 14802.5,
      buildingArea: 614.6,
      bcr: 60.0,
      far: 1444.8,
      floors: { above: 18, below: 5 },
      height: 72.4,
      structure: '철골철근콘크리트조',
      mainPurpose: '업무시설',
      approvalDate: '2018-04-30',
      source: 'mock',
    },
  },

  // 5. 삼성동 (대형 부지)
  {
    matchKeys: ['삼성동', '삼성 167', '강남 삼성동 167'],
    land: {
      address: '서울특별시 강남구 삼성동 167',
      jibun: '167',
      jimok: '대',
      area: 632.8,
      zoning: '제3종일반주거지역',
      district: '삼성 도시환경정비구역',
      altitude: 34,
      roadFacing: '중로 (12m)',
      landUseRestrictions: [
        '도시환경정비구역',
        '학교환경위생정화구역',
      ],
      source: 'mock',
    },
    building: null, // 나대지
  },
];

/**
 * 주소 문자열로 mock DB에서 매칭되는 entry를 검색.
 * 정확 매칭 실패 시 부분 매칭 시도, 그래도 실패하면 신사동 529를 fallback.
 */
export function findMockEntry(address: string): MockEntry {
  const normalized = address.replace(/\s+/g, '').toLowerCase();

  // 1. 정확 매칭 시도
  for (const entry of MOCK_LAND_DB) {
    for (const key of entry.matchKeys) {
      if (normalized.includes(key.replace(/\s+/g, '').toLowerCase())) {
        return entry;
      }
    }
  }

  // 2. 동(洞) 단위 매칭
  const dongMap: { [key: string]: number } = {
    '신사': 0,
    '압구정': 1,
    '청담': 2,
    '역삼': 3,
    '삼성': 4,
  };
  for (const [dong, idx] of Object.entries(dongMap)) {
    if (normalized.includes(dong)) {
      return MOCK_LAND_DB[idx];
    }
  }

  // 3. Fallback — 신사동 529
  return MOCK_LAND_DB[0];
}
