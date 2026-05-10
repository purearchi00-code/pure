import { NextRequest, NextResponse } from 'next/server';
import { fetchLandInfo } from '@/lib/dataClient';

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
    const land = await fetchLandInfo(address);
    return NextResponse.json(land);
  } catch (err) {
    console.error('[/api/land]', err);
    return NextResponse.json(
      { error: 'failed to fetch land info' },
      { status: 500 }
    );
  }
}
