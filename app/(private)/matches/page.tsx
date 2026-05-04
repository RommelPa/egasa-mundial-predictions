import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";

type MatchListRow = {
  id: string;
  matchNumber: number;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  resultHome: number | null;
  resultAway: number | null;
};

export default async function MatchesPage() {
  await requireAuth();

  const matches: MatchListRow[] = await prisma.match.findMany({
    orderBy: [{ kickoffAt: "asc" }, { matchNumber: "asc" }],
    select: {
      id: true,
      matchNumber: true,
      stage: true,
      homeTeam: true,
      awayTeam: true,
      kickoffAt: true,
      resultHome: true,
      resultAway: true,
    },
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Fixture
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {UI_TEXT.labels.matches}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Revisa los partidos disponibles del Mundial 2026 y registra tus pronósticos.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
          <h2 className="text-xl font-semibold">Listado de partidos</h2>
          <p className="mt-2 text-sm text-zinc-400">
            El estado se calcula automáticamente según la hora de inicio y los resultados cargados.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">{UI_TEXT.labels.stage}</th>
                  <th className="px-4 py-3 font-medium">Partido</th>
                  <th className="px-4 py-3 font-medium">Inicio</th>
                  <th className="px-4 py-3 font-medium">{UI_TEXT.labels.status}</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match: MatchListRow) => {
                  const status = getMatchStatus(match);

                  return (
                    <tr
                      key={match.id}
                      className="border-b border-white/5 text-zinc-200 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">{match.matchNumber}</td>
                      <td className="px-4 py-4">{formatStage(match.stage)}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">
                          {match.homeTeam} vs {match.awayTeam}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-300">
                        {formatDateTime(match.kickoffAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            status === UI_TEXT.matchStatus.open
                              ? "bg-emerald-500/10 text-emerald-300"
                              : status === UI_TEXT.matchStatus.closed
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/matches/${match.id}/predict`}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
                        >
                          {status === UI_TEXT.matchStatus.open ? "Pronosticar" : "Ver"}
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
                      {UI_TEXT.emptyStates.noMatches}
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