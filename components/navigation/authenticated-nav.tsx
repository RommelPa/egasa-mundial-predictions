import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export async function AuthenticatedNav() {
  const session = await auth();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <header className="border-b border-white/10 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-white">
            EGASA Prode Mundial 2026
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>

            <Link href="/matches" className="hover:text-white">
              Partidos
            </Link>

            {isAdmin ? (
              <>
                <Link href="/admin/users" className="hover:text-white">
                  Usuarios
                </Link>
                <Link href="/admin/matches" className="hover:text-white">
                  Admin Partidos
                </Link>
                <Link href="/admin/results" className="hover:text-white">
                  Resultados
                </Link>
              </>
            ) : null}

            <Link href="/" className="hover:text-white">
              Inicio
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