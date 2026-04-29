import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";

export default async function MatchesPage() {
  await requireAuth();

  const matches = await prisma.match.findMany({
    orderBy: [{ kickoffAt: "asc" }, { matchNumber: "asc" }],
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Fixture
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Partidos</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Revisa los partidos disponibles del Mundial 2026 y registra tus pronósticos.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Listado de partidos</h2>
          <p className="mt-2 text-sm text-zinc-400">
            El estado se calcula automáticamente según la hora de inicio y los resultados cargados.
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
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const status = getMatchStatus(match);

                  return (
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
                      <td className="px-4 py-3">{status}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/matches/${match.id}/predict`}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
                        >
                          {status === "Abierto" ? "Pronosticar" : "Ver"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {matches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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
    </main>
  );
}