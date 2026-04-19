// src/app/api/events/[id]/theme/route.ts
// TODO: Phase 3 — GET event theme (public, no auth)
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Not implemented — Phase 3' }, { status: 501 });
}
