import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { buildRanking } from "@/lib/domain/scoring";

export default async function RankingPage() {
  await requireAuth();

  const users = await prisma.user.findMany({
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

  const ranking = buildRanking(users);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Competencia
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Ranking global</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Clasificación general según los partidos finalizados y puntuados automáticamente.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Pos.</th>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Puntos</th>
                  <th className="px-4 py-3 font-medium">Exactos</th>
                  <th className="px-4 py-3 font-medium">Clasificados</th>
                  <th className="px-4 py-3 font-medium">Pronósticos puntuados</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => (
                  <tr
                    key={row.userId}
                    className="border-b border-white/5 text-zinc-200"
                  >
                    <td className="px-4 py-3 font-semibold">{index + 1}</td>
                    <td className="px-4 py-3">{row.username}</td>
                    <td className="px-4 py-3">{row.totalPoints}</td>
                    <td className="px-4 py-3">{row.exactHits}</td>
                    <td className="px-4 py-3">{row.qualifiedHits}</td>
                    <td className="px-4 py-3">{row.scoredPredictions}</td>
                  </tr>
                ))}

                {ranking.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-zinc-400"
                    >
                      Aún no hay usuarios con pronósticos para mostrar en el ranking.
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