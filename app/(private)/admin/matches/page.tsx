import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateMatchForm } from "./ui/create-match-form";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";

type MatchRow = {
  id: string;
  matchNumber: number;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  resultHome: number | null;
  resultAway: number | null;
};

export default async function AdminMatchesPage() {
  await requireAdmin();

  const matches: MatchRow[] = await prisma.match.findMany({
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
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Partidos
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Registra y revisa los partidos del Mundial 2026.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <CreateMatchForm />

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold">Partidos registrados</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Estado calculado según hora de inicio y resultados cargados.
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
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => {
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
                      </tr>
                    );
                  })}

                  {matches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
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
      </div>
    </main>
  );
}