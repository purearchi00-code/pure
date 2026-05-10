import type { LandInfo, BuildingInfo } from './types';
import { findMockEntry } from './mockData';

/**
 * 토지/건축물 데이터 조회 추상화 레이어
 *
 * 환경변수에 API 키가 있으면 진짜 API 호출,
 * 없으면 mock 데이터 반환.
 *
 * 이 레이어 덕분에 frontend 코드는 mock/real 차이를 모르고 작동.
 */

const VWORLD_KEY = process.env.VWORLD_API_KEY;
const DATA_GO_KR_KEY = process.env.DATA_GO_KR_API_KEY;

/**
 * 주소 → 토지 정보
 */
export async function fetchLandInfo(address: string): Promise<LandInfo> {
  // TODO: VWORLD_KEY 발급되면 실제 API 호출로 교체
  if (VWORLD_KEY) {
    // return fetchFromVWorld(address);
    console.warn('[VWorld] API 키는 설정됐지만 아직 구현 안 됨. mock 사용.');
  }

  // Mock 모드: 약간의 딜레이로 실제 API처럼 시뮬레이션
  await sleep(300 + Math.random() * 400);

  const entry = findMockEntry(address);
  return entry.land;
}

/**
 * 주소 → 건축물 대장
 */
export async function fetchBuildingInfo(address: string): Promise<BuildingInfo | null> {
  if (DATA_GO_KR_KEY) {
    // return fetchFromDataGoKr(address);
    console.warn('[공공데이터포털] API 키는 설정됐지만 아직 구현 안 됨. mock 사용.');
  }

  await sleep(400 + Math.random() * 500);

  const entry = findMockEntry(address);
  return entry.building;
}

/**
 * 시연용 sleep 헬퍼
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ============================================================
 * 실제 API 연동 시 참고용 스켈레톤 (현재는 미사용)
 * ============================================================ */

// async function fetchFromVWorld(address: string): Promise<LandInfo> {
//   // 1단계: 주소 → 좌표 (Geocoding)
//   const geocodeUrl = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&format=json&type=parcel&key=${VWORLD_KEY}`;
//   const geo = await fetch(geocodeUrl).then(r => r.json());
//   const { x, y } = geo.response.result.point;
//
//   // 2단계: 좌표 → 토지 속성 (Data API - LP_PA_CBND_BUBUN)
//   const dataUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&geomFilter=POINT(${x} ${y})&geometry=true&attrFilter=&size=1&format=json&key=${VWORLD_KEY}`;
//   const data = await fetch(dataUrl).then(r => r.json());
//   const feature = data.response.result.featureCollection.features[0];
//
//   return {
//     address: feature.properties.addr,
//     jibun: feature.properties.jibun,
//     jimok: feature.properties.jimok_nm,
//     area: parseFloat(feature.properties.lndpcl_ar),
//     zoning: '...', // 별도 API: LT_C_LHBLPN
//     // ...
//     source: 'vworld',
//   };
// }

// async function fetchFromDataGoKr(address: string): Promise<BuildingInfo> {
//   // 공공데이터포털 건축물대장 API
//   // https://www.data.go.kr/data/15044713/openapi.do
//   const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${DATA_GO_KR_KEY}&...`;
//   // ...
// }
