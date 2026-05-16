#!/usr/bin/env node
/**
 * D.A.R.I — 웹 앱 서버
 *
 * 사용법:
 *   node scripts/server.mjs
 *
 * 그러면 http://localhost:3000 이 열립니다
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import querystring from 'node:querystring';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = 3000;

// .env.local 로드
function loadEnv() {
  try {
    const content = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
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

function resolveCode(addr) {
  for (const [dong, code] of Object.entries(DONG_CODES)) {
    if (addr.includes(dong)) return { dong, ...code };
  }
  return null;
}

function parseJibun(input) {
  const m = input.match(/(\d+)(?:-(\d+))?/);
  if (!m) return null;
  return { bun: m[1].padStart(4, '0'), ji: (m[2] ?? '0').padStart(4, '0') };
}

async function fetchBuildingInfo(address) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) throw new Error('DATA_GO_KR_API_KEY 환경변수 미설정');

  const code = resolveCode(address);
  if (!code) throw new Error('지원하지 않는 동입니다');

  const jibun = parseJibun(address);
  if (!jibun) throw new Error('지번 파싱 실패');

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
  const res = await fetch(url);
  const data = await res.json();

  if (data?.response?.header?.resultCode !== '00') {
    throw new Error(data?.response?.header?.resultMsg || 'API 호출 실패');
  }

  const rawItems = data?.response?.body?.items?.item;
  if (!rawItems) throw new Error('결과 없음');

  const item = Array.isArray(rawItems) ? rawItems[0] : rawItems;
  return { item, raw: data };
}

const server = http.createServer(async (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API 엔드포인트
  if (req.url === '/api/building' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { address } = JSON.parse(body);
        const result = await fetchBuildingInfo(address);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // HTML 파일 서빙
  let filePath = path.join(ROOT, 'public', req.url === '/' ? 'index.html' : req.url);
  filePath = path.normalize(filePath);

  // 경로 탈출 방지
  if (!filePath.startsWith(path.join(ROOT, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

loadEnv();

server.listen(PORT, () => {
  console.log(`✓ 웹 앱 시작됨: http://localhost:${PORT}`);
  console.log(`  브라우저에서 열린 페이지를 새로고침하거나 자동으로 열 때까지 기다리세요.`);
});
