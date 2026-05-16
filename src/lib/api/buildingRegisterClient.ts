import type { BuildingInfo } from '../types';
import { extractJibun, getJibunMain, getJibunSub } from '../utils/jibunParser';

/**
 * 국토교통부 건축HUB 건축물대장정보 서비스
 * 공공데이터포털 신청 승인 완료
 *
 * 엔드포인트: https://apis.data.go.kr/1613000/BldRgstHubService
 * 표제부 조회: getBrTitleInfo
 *
 * 필수 파라미터:
 * - serviceKey: 인증키
 * - sigunguCd: 시군구코드 (5자리)
 * - bjdongCd:  법정동코드 (5자리)
 * - platGbCd:  대지구분 (0=대지, 1=산, 2=블록)
 * - bun:       번 (4자리)
 * - ji:        지 (4자리)
 */

const BASE_URL = 'https://apis.data.go.kr/1613000/BldRgstHubService';

interface LegalCode {
  sigunguCd: string;
  bjdongCd: string;
}

/**
 * 동 이름 → 시군구코드/법정동코드 매핑
 *
 * 행정안전부 법정동코드 API 연동 전까지의 hardcoded 매핑.
 * MVP 시연용 강남구 5개 동만 우선 제공.
 */
const DONG_TO_LEGAL_CODE: Record<string, LegalCode> = {
  신사동: { sigunguCd: '11680', bjdongCd: '10700' },
  압구정동: { sigunguCd: '11680', bjdongCd: '11000' },
  청담동: { sigunguCd: '11680', bjdongCd: '10800' },
  역삼동: { sigunguCd: '11680', bjdongCd: '10100' },
  삼성동: { sigunguCd: '11680', bjdongCd: '10500' },
};

function resolveLegalCode(address: string): LegalCode | null {
  for (const [dong, code] of Object.entries(DONG_TO_LEGAL_CODE)) {
    if (address.includes(dong)) return code;
  }
  return null;
}

interface BrTitleItem {
  bldNm?: string;
  platArea?: string;
  archArea?: string;
  totArea?: string;
  bcRat?: string;
  vlRat?: string;
  grndFlrCnt?: string;
  ugrndFlrCnt?: string;
  heit?: string;
  strctCdNm?: string;
  mainPurpsCdNm?: string;
  useAprDay?: string;
}

interface BrTitleResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: BrTitleItem | BrTitleItem[] };
      totalCount?: number;
    };
  };
}

/**
 * 건축물대장 표제부 조회
 * 주소를 받아 BuildingInfo를 반환. 매칭 실패 시 null.
 */
export async function fetchBuildingRegister(address: string): Promise<BuildingInfo | null> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    throw new Error('DATA_GO_KR_API_KEY is not configured');
  }

  const legalCode = resolveLegalCode(address);
  if (!legalCode) {
    console.warn('[건축물대장] 법정동코드 매핑 없음:', address);
    return null;
  }

  const jibun = extractJibun(address);
  if (!jibun) return null;

  const bun = getJibunMain(jibun).padStart(4, '0');
  const ji = (getJibunSub(jibun) ?? '0').padStart(4, '0');

  const params = new URLSearchParams({
    serviceKey: apiKey,
    sigunguCd: legalCode.sigunguCd,
    bjdongCd: legalCode.bjdongCd,
    platGbCd: '0',
    bun,
    ji,
    numOfRows: '10',
    pageNo: '1',
    _type: 'json',
  });

  const url = `${BASE_URL}/getBrTitleInfo?${params.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`건축물대장 API HTTP ${res.status}`);
  }

  const data = (await res.json()) as BrTitleResponse;

  const resultCode = data.response?.header?.resultCode;
  if (resultCode && resultCode !== '00') {
    throw new Error(`건축물대장 API ${resultCode}: ${data.response?.header?.resultMsg}`);
  }

  const rawItem = data.response?.body?.items?.item;
  if (!rawItem) return null;

  const item: BrTitleItem = Array.isArray(rawItem) ? rawItem[0] : rawItem;

  return mapToBuildingInfo(address, item);
}

function mapToBuildingInfo(address: string, item: BrTitleItem): BuildingInfo {
  return {
    address,
    buildingName: item.bldNm || undefined,
    totalFloorArea: numberOrZero(item.totArea),
    buildingArea: numberOrZero(item.archArea),
    bcr: numberOrZero(item.bcRat),
    far: numberOrZero(item.vlRat),
    floors: {
      above: numberOrZero(item.grndFlrCnt),
      below: numberOrZero(item.ugrndFlrCnt),
    },
    height: numberOrZero(item.heit),
    structure: item.strctCdNm ?? '',
    mainPurpose: item.mainPurpsCdNm ?? '',
    approvalDate: formatApprovalDate(item.useAprDay),
    source: 'data.go.kr',
  };
}

function numberOrZero(value: string | undefined): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function formatApprovalDate(value: string | undefined): string | undefined {
  if (!value || value.length < 8) return undefined;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
