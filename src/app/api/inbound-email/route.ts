import { NextRequest, NextResponse } from 'next/server';
import { processInboundEmail } from '@/lib/email/processor';

// Cloudmailin sends a JSON POST to this endpoint.
// Return 200 always to prevent retries on non-critical errors.
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await processInboundEmail(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[inbound-email] Unhandled error:', error);
    // Still return 200 so Cloudmailin doesn't retry
    return NextResponse.json({ ok: false, reason: 'internal error' }, { status: 200 });
  }
}
