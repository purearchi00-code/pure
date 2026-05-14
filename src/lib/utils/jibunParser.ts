/**
 * 주소/지번 파싱 유틸
 *
 * 예:
 * - "서울 강남구 신사동 529" → "529"
 * - "서울특별시 강남구 신사동 529-1" → "529-1"
 * - "서울 강남구 신사 529" → "529"
 */

/**
 * 한국 주소에서 지번 추출
 * 형식: [도시] [시/군/구] [읍/면/동] [번지] [-부번]
 */
export function extractJibun(address: string): string {
  const trimmed = address.trim();

  // 마지막 숫자 부분이 지번 (번지-부번 형식)
  const match = trimmed.match(/(\d+(?:-\d+)?)(?:\s|$)/);

  if (match) {
    return match[1];
  }

  // 못 찾으면 빈 문자열 반환
  return '';
}

/**
 * 지번에서 번지만 추출 (부번 제외)
 * "529-1" → "529"
 */
export function getJibunMain(jibun: string): string {
  return jibun.split('-')[0];
}

/**
 * 지번에서 부번 추출
 * "529-1" → "1", "529" → null
 */
export function getJibunSub(jibun: string): string | null {
  const parts = jibun.split('-');
  return parts.length > 1 ? parts[1] : null;
}

/**
 * 유효한 지번 형식인지 검사
 */
export function isValidJibun(jibun: string): boolean {
  return /^\d+(?:-\d+)?$/.test(jibun);
}
