import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { buildRanking, type RankingRow } from "@/lib/domain/scoring";
import { UI_TEXT } from "@/lib/ui/text";

type RankingUser = {
  id: string;
  username: string;
  predictions: Array<{
    predictedHome: number;
    predictedAway: number;
    qualifiedTeam: string | null;
    match: {
      stage: string;
      homeTeam: string;
      awayTeam: string;
      resultHome: number | null;
      resultAway: number | null;
      qualifiedTeam: string | null;
    };
  }>;
};

export default async function RankingPage() {
  await requireAuth();

  const users: RankingUser[] = await prisma.user.findMany({
    where: {
      active: true,
      role: "USER",
    },
    orderBy: {
      username: "asc",
    },
    include: {
      predictions: {
        include: {
          match: true,
        },
      },
    },
  });

  const ranking: RankingRow[] = buildRanking(users);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Competencia
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Ranking global
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Clasificación general según los partidos finalizados y puntuados automáticamente.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Pos.</th>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">{UI_TEXT.labels.points}</th>
                  <th className="px-4 py-3 font-medium">Exactos</th>
                  <th className="px-4 py-3 font-medium">Clasificados</th>
                  <th className="px-4 py-3 font-medium">Pronósticos puntuados</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row: RankingRow, index: number) => (
                  <tr
                    key={row.userId}
                    className="border-b border-white/5 text-zinc-200 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20 font-semibold text-white">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-white">{row.username}</td>
                    <td className="px-4 py-4 font-semibold">{row.totalPoints}</td>
                    <td className="px-4 py-4">{row.exactHits}</td>
                    <td className="px-4 py-4">{row.qualifiedHits}</td>
                    <td className="px-4 py-4">{row.scoredPredictions}</td>
                  </tr>
                ))}

                {ranking.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-zinc-400"
                    >
                      {UI_TEXT.emptyStates.noRanking}
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