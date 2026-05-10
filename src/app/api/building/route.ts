import { NextRequest, NextResponse } from 'next/server';
import { fetchBuildingInfo } from '@/lib/dataClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'address parameter required' },
      { status: 400 }
    );
  }

  try {
    const building = await fetchBuildingInfo(address);
    return NextResponse.json(building); // null 가능 (나대지)
  } catch (err) {
    console.error('[/api/building]', err);
    return NextResponse.json(
      { error: 'failed to fetch building info' },
      { status: 500 }
    );
  }
}
