/**
 * 토지이음(EUM) API 클라이언트
 *
 * 국토교통부 통합 공간정보 플랫폼
 * - 용도지역 조회: GetUseDistrict
 * - 지구단위계획: GetDistrictUnitPlan
 * - 토지이용규제: GetLandUseRestriction
 *
 * 공식 문서: https://www.eum.go.kr/api
 * 결과는 mock과 동일한 구조로 정규화됨
 */

const EUM_BASE_URL = 'https://api.eum.go.kr/v1';
const EUM_API_KEY = process.env.EUM_API_KEY;

interface EUMResponse<T> {
  code: string;
  message: string;
  data: T;
}

interface UseDistrictResult {
  jibun: string;
  zoning: string;          // 용도지역명 (예: 제2종일반주거지역)
  zoningCode: string;       // 용도지역 코드
}

interface DistrictUnitPlanResult {
  jibun: string;
  district: string;        // 지구단위계획 명칭
  districtCode: string;
}

interface LandUseRestrictionResult {
  jibun: string;
  restrictions: string[];  // 규제 목록
}

/**
 * 지번 → 용도지역 조회
 */
export async function fetchUseDistrictFromEUM(jibun: string): Promise<{
  zoning: string;
  zoningCode: string;
} | null> {
  if (!EUM_API_KEY) {
    return null; // mock으로 폴백
  }

  try {
    const params = new URLSearchParams({
      apiKey: EUM_API_KEY,
      jibun: jibun,
      format: 'json',
    });

    const url = `${EUM_BASE_URL}/GetUseDistrict?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[EUM] GetUseDistrict failed: ${response.status}`);
      return null;
    }

    const data: EUMResponse<UseDistrictResult> = await response.json();

    if (data.code !== '00') {
      console.warn(`[EUM] GetUseDistrict error: ${data.message}`);
      return null;
    }

    return {
      zoning: data.data.zoning,
      zoningCode: data.data.zoningCode,
    };
  } catch (err) {
    console.error('[EUM] fetchUseDistrictFromEUM error:', err);
    return null; // mock으로 폴백
  }
}

/**
 * 지번 → 지구단위계획 조회
 */
export async function fetchDistrictUnitPlanFromEUM(jibun: string): Promise<{
  district: string;
  districtCode: string;
} | null> {
  if (!EUM_API_KEY) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      apiKey: EUM_API_KEY,
      jibun: jibun,
      format: 'json',
    });

    const url = `${EUM_BASE_URL}/GetDistrictUnitPlan?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[EUM] GetDistrictUnitPlan failed: ${response.status}`);
      return null;
    }

    const data: EUMResponse<DistrictUnitPlanResult> = await response.json();

    if (data.code !== '00') {
      console.warn(`[EUM] GetDistrictUnitPlan error: ${data.message}`);
      return null;
    }

    return {
      district: data.data.district,
      districtCode: data.data.districtCode,
    };
  } catch (err) {
    console.error('[EUM] fetchDistrictUnitPlanFromEUM error:', err);
    return null;
  }
}

/**
 * 지번 → 토지이용규제 조회
 */
export async function fetchLandUseRestrictionsFromEUM(jibun: string): Promise<string[] | null> {
  if (!EUM_API_KEY) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      apiKey: EUM_API_KEY,
      jibun: jibun,
      format: 'json',
    });

    const url = `${EUM_BASE_URL}/GetLandUseRestriction?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[EUM] GetLandUseRestriction failed: ${response.status}`);
      return null;
    }

    const data: EUMResponse<LandUseRestrictionResult> = await response.json();

    if (data.code !== '00') {
      console.warn(`[EUM] GetLandUseRestriction error: ${data.message}`);
      return null;
    }

    return data.data.restrictions || [];
  } catch (err) {
    console.error('[EUM] fetchLandUseRestrictionsFromEUM error:', err);
    return null;
  }
}

/**
 * 여러 정보를 병렬로 조회
 */
export async function fetchAllEUMData(jibun: string) {
  const [zoning, district, restrictions] = await Promise.all([
    fetchUseDistrictFromEUM(jibun),
    fetchDistrictUnitPlanFromEUM(jibun),
    fetchLandUseRestrictionsFromEUM(jibun),
  ]);

  return {
    zoning: zoning?.zoning || null,
    district: district?.district || null,
    restrictions: restrictions || [],
  };
}
