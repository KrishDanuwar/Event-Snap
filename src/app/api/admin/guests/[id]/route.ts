// src/app/api/admin/guests/[id]/route.ts
// TODO: Phase 6 — DELETE remove guest
import { NextResponse } from 'next/server';

export async function DELETE() {
  return NextResponse.json({ message: 'Not implemented — Phase 6' }, { status: 501 });
}
