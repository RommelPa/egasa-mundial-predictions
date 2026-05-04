import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { UI_TEXT } from "@/lib/ui/text";

export async function AuthenticatedNav() {
  const session = await auth();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-white transition hover:text-zinc-200"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-sm font-bold text-emerald-300">
              E
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">
                {UI_TEXT.appName}
              </p>
              <p className="text-xs text-zinc-500">Plataforma interna</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {UI_TEXT.labels.dashboard}
            </Link>

            <Link
              href="/matches"
              className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {UI_TEXT.labels.matches}
            </Link>

            <Link
              href="/ranking"
              className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {UI_TEXT.labels.ranking}
            </Link>

            <Link
              href="/my-predictions"
              className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {UI_TEXT.labels.myPredictions}
            </Link>

            {isAdmin ? (
              <div className="ml-0 flex flex-wrap items-center gap-2 lg:ml-2">
                <span className="hidden text-xs uppercase tracking-wide text-zinc-500 lg:inline">
                  Admin
                </span>

                <Link
                  href="/admin/users"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white"
                >
                  {UI_TEXT.labels.users}
                </Link>

                <Link
                  href="/admin/matches"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white"
                >
                  {UI_TEXT.labels.adminMatches}
                </Link>

                <Link
                  href="/admin/results"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white"
                >
                  {UI_TEXT.labels.results}
                </Link>
              </div>
            ) : null}

            <Link
              href="/"
              className="rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {UI_TEXT.labels.home}
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 lg:justify-end">
          <div className="text-right text-sm">
            <p className="font-medium text-white">{session.user.username}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {session.user.role}
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}