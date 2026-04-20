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
      {children}
    </div>
  );
}