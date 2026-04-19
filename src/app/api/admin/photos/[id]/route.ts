// src/app/api/admin/photos/[id]/route.ts
// TODO: Phase 6 — DELETE admin photo deletion
import { NextResponse } from 'next/server';

export async function DELETE() {
  return NextResponse.json({ message: 'Not implemented — Phase 6' }, { status: 501 });
}
