#!/usr/bin/env node
/**
 * 공공데이터포털 건축HUB 건축물대장 API 검증 스크립트
 *
 * 사용법:
 *   node scripts/test-building-api.mjs                            # 기본: 신사동 529
 *   node scripts/test-building-api.mjs 압구정동 480
 *   node scripts/test-building-api.mjs 청담동 88
 *
 * 필요:
 *   .env.local 에 DATA_GO_KR_API_KEY 가 설정되어 있어야 함
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadEnvLocal() {
  try {
    const content = readFileSync(join(ROOT, '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch {
    console.warn('[warn] .env.local 파일을 찾을 수 없습니다');
  }
}

const DONG_CODES = {
  신사동: { sigunguCd: '11680', bjdongCd: '10700' },
  압구정동: { sigunguCd: '11680', bjdongCd: '11000' },
  청담동: { sigunguCd: '11680', bjdongCd: '10800' },
  역삼동: { sigunguCd: '11680', bjdongCd: '10100' },
  삼성동: { sigunguCd: '11680', bjdongCd: '10500' },
};

function resolveCode(dongInput) {
  for (const [dong, code] of Object.entries(DONG_CODES)) {
    if (dong.includes(dongInput) || dongInput.includes(dong)) return { dong, ...code };
  }
  return null;
}

function parseJibun(input) {
  const m = input.match(/(\d+)(?:-(\d+))?/);
  if (!m) return null;
  return { bun: m[1].padStart(4, '0'), ji: (m[2] ?? '0').padStart(4, '0') };
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    console.error('[ERROR] DATA_GO_KR_API_KEY 가 .env.local 에 설정되어 있지 않습니다');
    process.exit(1);
  }

  const [dongArg = '신사동', jibunArg = '529'] = process.argv.slice(2);
  const code = resolveCode(dongArg);
  if (!code) {
    console.error(`[ERROR] 동 매핑 없음: ${dongArg}`);
    console.error('지원: 신사동, 압구정동, 청담동, 역삼동, 삼성동');
    process.exit(1);
  }
  const jibun = parseJibun(jibunArg);
  if (!jibun) {
    console.error(`[ERROR] 지번 파싱 실패: ${jibunArg}`);
    process.exit(1);
  }

  const params = new URLSearchParams({
    serviceKey: apiKey,
    sigunguCd: code.sigunguCd,
    bjdongCd: code.bjdongCd,
    platGbCd: '0',
    bun: jibun.bun,
    ji: jibun.ji,
    numOfRows: '5',
    pageNo: '1',
    _type: 'json',
  });

  const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?${params}`;

  console.log('━'.repeat(60));
  console.log(`📍 ${code.dong} ${jibunArg} 건축물대장 표제부 조회`);
  console.log(`   시군구코드: ${code.sigunguCd}, 법정동코드: ${code.bjdongCd}`);
  console.log(`   번: ${jibun.bun}, 지: ${jibun.ji}`);
  console.log('━'.repeat(60));

  const t0 = Date.now();
  const res = await fetch(url);
  const elapsed = Date.now() - t0;

  console.log(`HTTP ${res.status} (${elapsed}ms)`);
  console.log(`Content-Type: ${res.headers.get('content-type')}`);
  console.log();

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.log('[응답이 JSON이 아님 - 원문 출력]');
    console.log(text.slice(0, 2000));
    process.exit(1);
  }

  const header = data?.response?.header;
  const body = data?.response?.body;

  console.log(`결과코드: ${header?.resultCode} - ${header?.resultMsg}`);
  console.log(`총 건수: ${body?.totalCount ?? 0}`);
  console.log();

  const rawItems = body?.items?.item;
  if (!rawItems) {
    console.log('⚠️  결과 없음 (해당 지번에 등록된 건축물이 없거나 매핑 오류)');
    console.log();
    console.log('원본 응답:');
    console.log(JSON.stringify(data, null, 2).slice(0, 2000));
    return;
  }

  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  console.log(`✅ ${items.length}건 조회됨\n`);

  for (const [i, item] of items.entries()) {
    console.log(`── [${i + 1}] ${item.bldNm || '(건물명 없음)'}`);
    console.log(`   대지면적: ${item.platArea} ㎡`);
    console.log(`   건축면적: ${item.archArea} ㎡`);
    console.log(`   연면적:   ${item.totArea} ㎡`);
    console.log(`   건폐율:   ${item.bcRat} %`);
    console.log(`   용적률:   ${item.vlRat} %`);
    console.log(`   층수:     지상 ${item.grndFlrCnt} / 지하 ${item.ugrndFlrCnt}`);
    console.log(`   높이:     ${item.heit} m`);
    console.log(`   구조:     ${item.strctCdNm}`);
    console.log(`   주용도:   ${item.mainPurpsCdNm}`);
    console.log(`   사용승인: ${item.useAprDay}`);
    console.log();
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
