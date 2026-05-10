'use client';

import { useState } from 'react';
import type { FullReviewResponse } from '@/lib/types';

const SAMPLE_ADDRESSES = [
  '서울 강남구 신사동 529',
  '서울 강남구 압구정동 480',
  '서울 강남구 청담동 88',
  '서울 강남구 역삼동 825',
  '서울 강남구 삼성동 167',
];

const SAMPLE_QUERIES = [
  '베란다에 방 만들어도 돼요?',
  '옥상에 컨테이너 놔도 되나요?',
  '몇 층까지 올릴 수 있어요?',
  '상가를 카페로 바꿀 수 있나요?',
  '주택을 사무실로 쓸 수 있나요?',
  '지하를 학원으로 바꿔도 되나요?',
];

export default function HomePage() {
  const [address, setAddress] = useState('서울 강남구 신사동 529');
  const [query, setQuery] = useState('베란다에 방 만들어도 돼요?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FullReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, query }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FullReviewResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-sand">
      {/* Header */}
      <header className="bg-navy-deep text-white px-8 py-6 border-b-4 border-accent">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-2xl font-black tracking-[0.3em]">D.A.R.I</div>
            <div className="text-xs text-ice tracking-wider mt-1">
              개발자용 MVP · Mock Data Mode
            </div>
          </div>
          <div className="text-xs text-gray-light font-mono">
            v0.1.0 · Next.js 14 · API: mock
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Input Section */}
        {!result && (
          <section className="card mb-8">
            <div className="text-xs text-accent font-bold tracking-[2px] mb-2">
              STEP 1 · 시민 자연어 입력
            </div>
            <h2 className="text-2xl font-black text-navy-dark mb-6">
              건축법 검토 요청
            </h2>

            {/* 주소 입력 */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-medium tracking-wider mb-2">
                주소
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-light rounded-lg
                           focus:outline-none focus:border-accent transition-colors"
                placeholder="서울 강남구 신사동 529"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-gray-medium self-center">샘플 →</span>
                {SAMPLE_ADDRESSES.map((addr) => (
                  <button
                    key={addr}
                    onClick={() => setAddress(addr)}
                    className="text-xs px-3 py-1.5 border border-gray-light rounded-full
                               hover:border-accent hover:bg-sand transition-colors"
                  >
                    {addr.replace('서울 강남구 ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* 자연어 질의 */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-medium tracking-wider mb-2">
                질문 (자연어)
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-light rounded-lg
                           focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="예: 베란다에 방 만들어도 돼요?"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {SAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="text-xs px-3 py-1.5 border border-gray-light rounded-full
                               hover:border-accent hover:bg-sand transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !address || !query}
              className="btn-primary w-full text-lg py-4"
            >
              {loading ? '⏳ 검토 중...' : '🔍 건축법 검토 시작'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-900 rounded">
                <strong>오류:</strong> {error}
              </div>
            )}
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="card text-center py-16">
            <div className="inline-block animate-pulse">
              <div className="text-6xl mb-4">⏳</div>
              <div className="text-lg font-bold text-navy-dark mb-2">
                D.A.R.I 검토 진행 중
              </div>
              <div className="text-sm text-gray-medium">
                토지 정보 조회 → 건축물대장 조회 → 법령 검토 → Signed-AI 발행
              </div>
            </div>
          </section>
        )}

        {/* Result */}
        {result && !loading && <ResultView result={result} onReset={reset} />}
      </div>

      {/* Footer */}
      <footer className="bg-navy-deep text-gray-light text-xs text-center py-6 mt-16 tracking-wider">
        D.A.R.I · 개발자용 MVP · Mock Data Mode · Next.js 14 풀스택
      </footer>
    </main>
  );
}

/* ============================================================
 * Result View Component
 * ============================================================ */

function ResultView({
  result,
  onReset,
}: {
  result: FullReviewResponse;
  onReset: () => void;
}) {
  const { land, building, review } = result;
  const verdictColors = {
    green: { bg: 'bg-green-50', border: 'border-signal-green', text: 'text-signal-green', symbol: '✓' },
    amber: { bg: 'bg-amber-50', border: 'border-signal-amber', text: 'text-signal-amber', symbol: '!' },
    red: { bg: 'bg-red-50', border: 'border-signal-red', text: 'text-signal-red', symbol: '✕' },
  }[review.verdict];

  return (
    <div className="space-y-6">
      {/* Citizen Summary Card */}
      <section className="card border-t-4 border-accent">
        <div className="text-xs text-accent font-bold tracking-[2px] mb-2">
          STEP 2 · 시민용 요약
        </div>
        <h2 className="text-2xl font-black text-navy-dark mb-6">
          {land.address} 검토 결과
        </h2>

        {/* Verdict */}
        <div className={`flex items-center gap-4 p-5 rounded-lg ${verdictColors.bg} border-l-4 ${verdictColors.border} mb-5`}>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl ${verdictColors.text === 'text-signal-green' ? 'bg-signal-green' : verdictColors.text === 'text-signal-amber' ? 'bg-signal-amber' : 'bg-signal-red'}`}
          >
            {verdictColors.symbol}
          </div>
          <div>
            <div className="font-bold text-navy-dark">{review.verdictTitle}</div>
            <div className="text-sm text-gray-dark mt-1">{review.verdictSub}</div>
          </div>
        </div>

        {/* Plain Language */}
        <div className="bg-sand border-l-4 border-accent p-4 rounded mb-5">
          <span className="font-bold text-navy-dark">쉽게 설명드리면: </span>
          {review.plainLanguage}
        </div>

        {/* Considerations */}
        <div className="mb-5">
          <div className="text-xs text-gray-medium font-bold tracking-wider mb-3 pb-2 border-b border-gray-light">
            검토 사항
          </div>
          <ul className="space-y-2">
            {review.considerations.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-accent font-bold">{i + 1}.</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-navy-deep text-white p-4 rounded">
          <div className="text-xs text-accent font-bold tracking-wider mb-1">권장 조치</div>
          <div className="text-sm">{review.recommendedAction}</div>
        </div>
      </section>

      {/* Land + Building Info Card */}
      <section className="card">
        <div className="text-xs text-gray-medium font-bold tracking-wider mb-3 pb-2 border-b border-gray-light">
          토지 정보 ({land.source})
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <div className="text-xs text-gray-medium">주소</div>
            <div className="font-bold">{land.address}</div>
          </div>
          <div>
            <div className="text-xs text-gray-medium">지번 / 지목</div>
            <div className="font-bold">{land.jibun} / {land.jimok}</div>
          </div>
          <div>
            <div className="text-xs text-gray-medium">면적</div>
            <div className="font-bold">{land.area} ㎡</div>
          </div>
          <div>
            <div className="text-xs text-gray-medium">용도지역</div>
            <div className="font-bold text-accent">{land.zoning}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-gray-medium">지구단위계획</div>
            <div className="font-bold">{land.district}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-gray-medium">토지이용규제</div>
            <div className="text-sm">{land.landUseRestrictions.join(' · ')}</div>
          </div>
        </div>

        {building ? (
          <>
            <div className="text-xs text-gray-medium font-bold tracking-wider mb-3 pb-2 border-b border-gray-light">
              건축물대장 ({building.source})
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-medium">건폐율</div>
                <div className="text-2xl font-black text-navy-dark">{building.bcr}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-medium">용적률</div>
                <div className="text-2xl font-black text-navy-dark">{building.far}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-medium">층수</div>
                <div className="text-2xl font-black text-navy-dark">
                  {building.floors.above}F / B{building.floors.below}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-medium">높이</div>
                <div className="text-2xl font-black text-accent">{building.height}m</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-medium">주용도</div>
                <div className="font-bold">{building.mainPurpose}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-medium">구조</div>
                <div className="font-bold">{building.structure}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-sand border border-gray-light p-4 rounded text-sm text-gray-medium text-center">
            건축물대장 없음 (나대지)
          </div>
        )}
      </section>

      {/* Signed-AI Card */}
      <section className="bg-navy-deep text-white rounded-xl p-8 border-t-4 border-accent">
        <div className="inline-block bg-accent text-navy-deep px-3 py-1 rounded text-xs font-black tracking-wider mb-3">
          SIGNED-AI
        </div>
        <h3 className="text-2xl font-black mb-2">책임 있는 AI 검토서</h3>
        <p className="text-sm text-ice mb-6">
          본 검토 결과는 4가지 서명·검증 절차를 거쳐 발행되었습니다. 분쟁 시 법적 근거 문서로 활용 가능합니다.
        </p>

        <div className="space-y-3">
          <SigRow num={1} label="검수 건축사" value={`${review.signedAI.reviewerName} · ${review.signedAI.reviewerLicense}`} />
          <SigRow num={2} label="발행 시각" value={new Date(review.signedAI.timestamp).toLocaleString('ko-KR')} />
          <SigRow num={3} label="문서 번호" value={review.signedAI.docNumber} mono />
          <SigRow num={4} label="법령 버전 해시" value={review.signedAI.lawHash} mono />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-medium/30 text-xs text-gray-light">
          데이터 출처: {land.source} · 검토 엔진: {review.source}
          {review.source === 'mock' && (
            <span className="ml-2 px-2 py-0.5 bg-accent/20 text-accent rounded">
              MOCK MODE
            </span>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onReset} className="btn-secondary flex-1">
          ↻ 처음부터 다시
        </button>
      </div>
    </div>
  );
}

function SigRow({ num, label, value, mono }: { num: number; label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-white/5 border border-accent/30 rounded-lg p-3 flex gap-3 items-center">
      <div className="w-6 h-6 bg-accent text-navy-deep rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-accent font-bold tracking-wider">{label}</div>
        <div className={`text-sm ${mono ? 'font-mono' : ''} truncate`}>{value}</div>
      </div>
    </div>
  );
}
