import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import { PredictionForm } from "./ui/prediction-form";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { calculatePredictionScore } from "@/lib/domain/scoring";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";

export default async function PredictMatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const session = await requireAuth();
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      predictions: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              active: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!match) {
    notFound();
  }

  const myPrediction =
    match.predictions.find((prediction) => prediction.userId === session.user.id) ??
    null;

  const status = getMatchStatus(match);
  const isFinished = status === UI_TEXT.matchStatus.finished;
  const isClosed = status !== UI_TEXT.matchStatus.open;

  const visiblePredictions = isClosed
    ? match.predictions
        .filter((prediction) => prediction.user.active && prediction.user.role === "USER")
        .sort((a, b) => a.user.username.localeCompare(b.user.username, "es"))
    : [];

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <Link
            href="/matches"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Volver a partidos
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            {formatStage(match.stage)}
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {match.homeTeam} vs {match.awayTeam}
          </h1>

          <p className="mt-3 text-zinc-400">
            Inicio: {formatDateTime(match.kickoffAt)}
          </p>

          <p className="mt-2 text-zinc-400">
            {UI_TEXT.labels.status}:{" "}
            <span className="font-semibold text-zinc-200">{status}</span>
          </p>

          {isFinished ? (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-zinc-100">
              <p>
                {UI_TEXT.labels.officialResult}: {match.homeTeam} {match.resultHome} -{" "}
                {match.resultAway} {match.awayTeam}
              </p>
              {match.qualifiedTeam ? (
                <p className="mt-1">
                  {UI_TEXT.labels.qualifiedTeam}: {match.qualifiedTeam}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          {isClosed ? (
            <div
              className={`rounded-2xl p-6 ${
                isFinished
                  ? "border border-emerald-500/20 bg-emerald-500/10"
                  : "border border-amber-500/20 bg-amber-500/10"
              }`}
            >
              <h2
                className={`text-xl font-semibold ${
                  isFinished ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {isFinished ? "Partido finalizado" : "Pronóstico cerrado"}
              </h2>

              <p
                className={`mt-3 text-sm ${
                  isFinished ? "text-emerald-100/80" : "text-amber-100/80"
                }`}
              >
                {isFinished
                  ? "Este partido ya tiene resultado cargado. Puedes revisar tu pronóstico y comparar las predicciones de todos."
                  : "Este partido ya inició. Ya no puedes modificar tu pronóstico, pero ya puedes ver las predicciones registradas."}
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white">Tu pronóstico</h3>

                {myPrediction ? (
                  <div className="mt-3 space-y-2 text-sm text-zinc-200">
                    <p>
                      {match.homeTeam} {myPrediction.predictedHome} -{" "}
                      {myPrediction.predictedAway} {match.awayTeam}
                    </p>

                    {myPrediction.qualifiedTeam ? (
                      <p>
                        {UI_TEXT.labels.qualifiedTeam}: {myPrediction.qualifiedTeam}
                      </p>
                    ) : null}

                    {isFinished ? (
                      <div className="pt-2">
                        {(() => {
                          const myScore = calculatePredictionScore(match, myPrediction);

                          return (
                            <>
                              <p className="font-semibold">
                                {UI_TEXT.labels.points}: {myScore.points}
                              </p>
                              <p className="text-zinc-300">{myScore.reason}</p>
                            </>
                          );
                        })()}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-300">
                    No registraste ningún pronóstico antes del cierre.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <PredictionForm
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              stage={match.stage}
              initialPrediction={
                myPrediction
                  ? {
                      predictedHome: myPrediction.predictedHome,
                      predictedAway: myPrediction.predictedAway,
                      qualifiedTeam: myPrediction.qualifiedTeam,
                    }
                  : null
              }
            />
          )}
        </div>

        {isClosed ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Predicciones del partido</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {isFinished
                ? "Aquí puedes comparar las predicciones registradas y los puntos obtenidos por cada usuario."
                : "El partido ya está cerrado. Estas son las predicciones registradas hasta antes del inicio."}
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">{UI_TEXT.labels.prediction}</th>
                    <th className="px-4 py-3 font-medium">
                      {UI_TEXT.labels.qualifiedTeam}
                    </th>
                    {isFinished ? (
                      <>
                        <th className="px-4 py-3 font-medium">
                          {UI_TEXT.labels.points}
                        </th>
                        <th className="px-4 py-3 font-medium">Detalle</th>
                      </>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {visiblePredictions.map((prediction) => {
                    const score = isFinished
                      ? calculatePredictionScore(match, prediction)
                      : null;

                    return (
                      <tr
                        key={prediction.id}
                        className="border-b border-white/5 text-zinc-200"
                      >
                        <td className="px-4 py-3 font-medium">
                          {prediction.user.username}
                        </td>
                        <td className="px-4 py-3">
                          {match.homeTeam} {prediction.predictedHome} -{" "}
                          {prediction.predictedAway} {match.awayTeam}
                        </td>
                        <td className="px-4 py-3">
                          {prediction.qualifiedTeam ?? "—"}
                        </td>

                        {isFinished ? (
                          <>
                            <td className="px-4 py-3 font-semibold">
                              {score?.points ?? 0}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  (score?.points ?? 0) > 0
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-zinc-800 text-zinc-300"
                                }`}
                              >
                                {score?.reason ?? "—"}
                              </span>
                            </td>
                          </>
                        ) : null}
                      </tr>
                    );
                  })}

                  {visiblePredictions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isFinished ? 5 : 3}
                        className="px-4 py-8 text-center text-zinc-400"
                      >
                        {UI_TEXT.emptyStates.noMatchPredictions}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}