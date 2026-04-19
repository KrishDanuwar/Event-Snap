// src/app/admin/layout.tsx
// TODO: Phase 6 — Admin layout with auth guard, sidebar navigation
// Auth guard: if no session → redirect to /admin

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
