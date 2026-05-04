import { requireAuth } from "@/lib/auth-guard";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AuthenticatedNav />
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.02] to-transparent" />
        {children}
      </div>
    </div>
  );
}