import { NextRequest, NextResponse } from 'next/server';
import { fetchLandInfo, fetchBuildingInfo } from '@/lib/dataClient';
import { generateReview } from '@/lib/reviewEngine';
import type { FullReviewResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, query } = body;

    if (!address || !query) {
      return NextResponse.json(
        { error: 'address and query required' },
        { status: 400 }
      );
    }

    // 병렬로 토지/건축물 정보 조회
    const [land, building] = await Promise.all([
      fetchLandInfo(address),
      fetchBuildingInfo(address),
    ]);

    // 검토 결과 생성
    const review = await generateReview(query, land, building);

    const response: FullReviewResponse = {
      land,
      building,
      review,
      query,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[/api/review]', err);
    return NextResponse.json(
      { error: 'review failed', detail: String(err) },
      { status: 500 }
    );
  }
}
