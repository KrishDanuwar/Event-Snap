// src/app/api/photos/[id]/route.ts
// TODO: Phase 4 — DELETE guest's own photo
import { NextResponse } from 'next/server';

export async function DELETE() {
  return NextResponse.json({ message: 'Not implemented — Phase 4' }, { status: 501 });
}
