import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { UI_TEXT } from "@/lib/ui/text";

export async function AuthenticatedNav() {
  const session = await auth();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <header className="border-b border-white/10 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-white">
            {UI_TEXT.appName}
          </Link>

          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link href="/dashboard" className="hover:text-white">
              {UI_TEXT.labels.dashboard}
            </Link>

            <Link href="/matches" className="hover:text-white">
              {UI_TEXT.labels.matches}
            </Link>

            <Link href="/ranking" className="hover:text-white">
              {UI_TEXT.labels.ranking}
            </Link>

            <Link href="/my-predictions" className="hover:text-white">
              {UI_TEXT.labels.myPredictions}
            </Link>

            {isAdmin ? (
              <>
                <Link href="/admin/users" className="hover:text-white">
                  {UI_TEXT.labels.users}
                </Link>
                <Link href="/admin/matches" className="hover:text-white">
                  {UI_TEXT.labels.adminMatches}
                </Link>
                <Link href="/admin/results" className="hover:text-white">
                  {UI_TEXT.labels.results}
                </Link>
              </>
            ) : null}

            <Link href="/" className="hover:text-white">
              {UI_TEXT.labels.home}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-medium text-white">{session.user.username}</p>
            <p className="text-zinc-400">{session.user.role}</p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}