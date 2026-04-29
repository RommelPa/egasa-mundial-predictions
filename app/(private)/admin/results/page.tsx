import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ResultForm } from "./ui/result-form";
import { formatStage } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";

type MatchResultRow = {
  id: string;
  matchNumber: number;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  resultHome: number | null;
  resultAway: number | null;
  qualifiedTeam: string | null;
};

export default async function AdminResultsPage() {
  await requireAdmin();

  const matches: MatchResultRow[] = await prisma.match.findMany({
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
      qualifiedTeam: true,
    },
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Resultados</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Registra los resultados oficiales de los partidos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-4">
                <p className="text-sm text-zinc-400">
                  #{match.matchNumber} · {formatStage(match.stage)}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Inicio: {formatDateTime(match.kickoffAt)}
                </p>
              </div>

              <ResultForm
                matchId={match.id}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                stage={match.stage}
                initialResult={{
                  resultHome: match.resultHome,
                  resultAway: match.resultAway,
                  qualifiedTeam: match.qualifiedTeam,
                }}
              />
            </div>
          ))}

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
              Aún no hay partidos registrados.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}