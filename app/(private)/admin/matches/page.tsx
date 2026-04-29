import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateMatchForm } from "./ui/create-match-form";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import type { Match } from "@prisma/client";

export default async function AdminMatchesPage() {
  await requireAdmin();

  const matches: Match[] = await prisma.match.findMany({
    orderBy: [{ kickoffAt: "asc" }, { matchNumber: "asc" }],
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Partidos</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Registra y revisa los partidos del Mundial 2026.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <CreateMatchForm />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Partidos registrados</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Estado calculado según hora de inicio y resultados cargados.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Fase</th>
                    <th className="px-4 py-3 font-medium">Partido</th>
                    <th className="px-4 py-3 font-medium">Inicio</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match: Match) => (
                    <tr
                      key={match.id}
                      className="border-b border-white/5 text-zinc-200"
                    >
                      <td className="px-4 py-3">{match.matchNumber}</td>
                      <td className="px-4 py-3">{formatStage(match.stage)}</td>
                      <td className="px-4 py-3">
                        {match.homeTeam} vs {match.awayTeam}
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(match.kickoffAt)}
                      </td>
                      <td className="px-4 py-3">
                        {getMatchStatus(match)}
                      </td>
                    </tr>
                  ))}

                  {matches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-zinc-400"
                      >
                        Aún no hay partidos registrados.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}