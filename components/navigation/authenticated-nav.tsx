import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { UI_TEXT } from "@/lib/ui/text";

export async function AuthenticatedNav() {
  const session = await auth();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#11161e]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-white transition hover:text-[#D1D4D1]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 text-sm font-black text-[#3CAC3B] shadow-lg shadow-black/20">
              E
            </span>

            <div>
              <p className="text-sm font-bold leading-tight">{UI_TEXT.appName}</p>
              <p className="text-xs uppercase tracking-wide text-[#D1D4D1]/55">
                Fantasy interno
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#D1D4D1]/85">
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 font-medium transition hover:bg-[#2A398D]/18 hover:text-white"
            >
              {UI_TEXT.labels.dashboard}
            </Link>

            <Link
              href="/matches"
              className="rounded-xl px-3 py-2 font-medium transition hover:bg-[#2A398D]/18 hover:text-white"
            >
              {UI_TEXT.labels.matches}
            </Link>

            <Link
              href="/ranking"
              className="rounded-xl px-3 py-2 font-medium transition hover:bg-[#2A398D]/18 hover:text-white"
            >
              {UI_TEXT.labels.ranking}
            </Link>

            <Link
              href="/my-predictions"
              className="rounded-xl px-3 py-2 font-medium transition hover:bg-[#2A398D]/18 hover:text-white"
            >
              {UI_TEXT.labels.myPredictions}
            </Link>

            {isAdmin ? (
              <div className="ml-0 flex flex-wrap items-center gap-2 lg:ml-2">
                <span className="hidden text-xs uppercase tracking-[0.2em] text-[#D1D4D1]/45 lg:inline">
                  Admin
                </span>

                <Link
                  href="/admin/users"
                  className="rounded-xl border border-white/10 bg-[#474A4A]/28 px-3 py-2 font-medium transition hover:bg-[#2A398D]/20 hover:text-white"
                >
                  {UI_TEXT.labels.users}
                </Link>

                <Link
                  href="/admin/matches"
                  className="rounded-xl border border-white/10 bg-[#474A4A]/28 px-3 py-2 font-medium transition hover:bg-[#2A398D]/20 hover:text-white"
                >
                  {UI_TEXT.labels.adminMatches}
                </Link>

                <Link
                  href="/admin/results"
                  className="rounded-xl border border-white/10 bg-[#474A4A]/28 px-3 py-2 font-medium transition hover:bg-[#2A398D]/20 hover:text-white"
                >
                  {UI_TEXT.labels.results}
                </Link>
              </div>
            ) : null}

            <Link
              href="/"
              className="rounded-xl px-3 py-2 font-medium transition hover:bg-[#2A398D]/18 hover:text-white"
            >
              {UI_TEXT.labels.home}
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-[#474A4A]/22 px-4 py-3 lg:justify-end">
          <div className="text-right text-sm">
            <p className="font-semibold text-white">{session.user.username}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D1D4D1]/45">
              {session.user.role}
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}