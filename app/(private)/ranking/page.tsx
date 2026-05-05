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

function getPodiumStyles(position: number) {
  if (position === 1) {
    return "border-[#3CAC3B]/30 bg-[#3CAC3B]/12";
  }

  if (position === 2) {
    return "border-[#2A398D]/30 bg-[#2A398D]/16";
  }

  if (position === 3) {
    return "border-[#E61D25]/30 bg-[#E61D25]/12";
  }

  return "border-white/10 bg-[#474A4A]/20";
}

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
  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-[#2A398D]/30 bg-[#2A398D]/15 px-3 py-1 text-sm text-[#D1D4D1]">
            Competencia
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Ranking global
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#D1D4D1]/88 sm:text-lg">
            Clasificación general según los partidos finalizados y puntuados
            automáticamente.
          </p>
        </div>

        {ranking.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-[#474A4A]/18 p-8 text-center text-[#D1D4D1]/72 shadow-2xl shadow-black/20">
            {UI_TEXT.emptyStates.noRanking}
          </div>
        ) : (
          <>
            {topThree.length > 0 ? (
              <section className="mb-10">
                <div className="mb-5">
                  <h2 className="text-2xl font-black text-white">Top 3</h2>
                  <p className="mt-2 text-sm text-[#D1D4D1]/72">
                    Los líderes actuales del torneo.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {topThree.map((row, index) => (
                    <div
                      key={row.userId}
                      className={`rounded-[28px] border p-6 shadow-2xl shadow-black/20 ${getPodiumStyles(
                        index + 1
                      )}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-lg font-black text-white">
                          {index + 1}
                        </span>

                        <span className="text-xs uppercase tracking-[0.2em] text-[#D1D4D1]/55">
                          Posición
                        </span>
                      </div>

                      <h3 className="mt-5 text-2xl font-black text-white">
                        {row.username}
                      </h3>

                      <div className="mt-6 grid gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-wide text-[#D1D4D1]/45">
                            {UI_TEXT.labels.points}
                          </p>
                          <p className="mt-2 text-3xl font-black text-white">
                            {row.totalPoints}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-[#D1D4D1]/45">
                              Exactos
                            </p>
                            <p className="mt-2 text-xl font-black text-white">
                              {row.exactHits}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-[#D1D4D1]/45">
                              Clasificados
                            </p>
                            <p className="mt-2 text-xl font-black text-white">
                              {row.qualifiedHits}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-wide text-[#D1D4D1]/45">
                            Pronósticos puntuados
                          </p>
                          <p className="mt-2 text-xl font-black text-white">
                            {row.scoredPredictions}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.16),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/20">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Tabla completa
                  </h2>
                  <p className="mt-2 text-sm text-[#D1D4D1]/72">
                    Todos los participantes ordenados por rendimiento.
                  </p>
                </div>

                <div className="text-sm text-[#D1D4D1]/55">
                  {ranking.length} participante{ranking.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-[#D1D4D1]/55">
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
                        className="border-b border-white/5 text-[#D1D4D1] transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 font-black text-white">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-white">
                          {row.username}
                        </td>
                        <td className="px-4 py-4 text-base font-black text-white">
                          {row.totalPoints}
                        </td>
                        <td className="px-4 py-4">{row.exactHits}</td>
                        <td className="px-4 py-4">{row.qualifiedHits}</td>
                        <td className="px-4 py-4">{row.scoredPredictions}</td>
                      </tr>
                    ))}

                    {ranking.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-[#D1D4D1]/72"
                        >
                          {UI_TEXT.emptyStates.noRanking}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {rest.length === 0 && ranking.length <= 3 ? (
                <p className="mt-5 text-sm text-[#D1D4D1]/55">
                  Aún no hay más participantes fuera del top 3.
                </p>
              ) : null}
            </section>
          </>
        )}
      </div>
    </main>
  );
}