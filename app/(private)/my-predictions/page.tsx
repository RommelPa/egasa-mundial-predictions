import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { calculatePredictionScore } from "@/lib/domain/scoring";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";

type PredictionRow = {
  id: string;
  predictedHome: number;
  predictedAway: number;
  qualifiedTeam: string | null;
  match: {
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
};

export default async function MyPredictionsPage() {
  const session = await requireAuth();

  const predictions: PredictionRow[] = await prisma.prediction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      match: true,
    },
    orderBy: [
      {
        match: {
          kickoffAt: "asc",
        },
      },
      {
        match: {
          matchNumber: "asc",
        },
      },
    ],
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Seguimiento
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {UI_TEXT.labels.myPredictions}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Revisa tus predicciones, los resultados oficiales y cómo se calcula tu puntaje partido por partido.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">{UI_TEXT.labels.stage}</th>
                  <th className="px-4 py-3 font-medium">Partido</th>
                  <th className="px-4 py-3 font-medium">{UI_TEXT.labels.status}</th>
                  <th className="px-4 py-3 font-medium">Mi pronóstico</th>
                  <th className="px-4 py-3 font-medium">
                    {UI_TEXT.labels.officialResult}
                  </th>
                  <th className="px-4 py-3 font-medium">{UI_TEXT.labels.points}</th>
                  <th className="px-4 py-3 font-medium">Detalle</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction: PredictionRow) => {
                  const match = prediction.match;
                  const status = getMatchStatus(match);
                  const score = calculatePredictionScore(match, prediction);

                  const predictionLabel = `${match.homeTeam} ${prediction.predictedHome} - ${prediction.predictedAway} ${match.awayTeam}`;
                  const resultLabel =
                    match.resultHome !== null && match.resultAway !== null
                      ? `${match.homeTeam} ${match.resultHome} - ${match.resultAway} ${match.awayTeam}`
                      : "Pendiente";

                  return (
                    <tr
                      key={prediction.id}
                      className="border-b border-white/5 text-zinc-200 align-top"
                    >
                      <td className="px-4 py-3">{match.matchNumber}</td>
                      <td className="px-4 py-3">{formatStage(match.stage)}</td>
                      <td className="px-4 py-3">
                        <div>{match.homeTeam} vs {match.awayTeam}</div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {formatDateTime(match.kickoffAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">{status}</td>
                      <td className="px-4 py-3">
                        <div>{predictionLabel}</div>
                        {prediction.qualifiedTeam ? (
                          <div className="mt-1 text-xs text-zinc-400">
                            {UI_TEXT.labels.qualifiedTeam}: {prediction.qualifiedTeam}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div>{resultLabel}</div>
                        {match.qualifiedTeam ? (
                          <div className="mt-1 text-xs text-zinc-400">
                            {UI_TEXT.labels.qualifiedTeam}: {match.qualifiedTeam}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {score.scored ? score.points : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            score.scored
                              ? score.points > 0
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-zinc-800 text-zinc-300"
                              : "bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {score.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/matches/${match.id}/predict`}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
                        >
                          {status === UI_TEXT.matchStatus.open ? "Editar" : "Ver"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {predictions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-zinc-400"
                    >
                      {UI_TEXT.emptyStates.noPredictions}
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