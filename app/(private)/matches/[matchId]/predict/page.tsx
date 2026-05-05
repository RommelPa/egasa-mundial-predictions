import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import { PredictionForm } from "./ui/prediction-form";
import {
  formatStageWithGroup,
  getMatchStatus,
} from "@/lib/domain/matches";
import { calculatePredictionScore } from "@/lib/domain/scoring";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type MatchPredictionRow = {
  id: string;
  userId: string;
  predictedHome: number;
  predictedAway: number;
  qualifiedTeam: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    role: string;
    active: boolean;
  };
};

type MatchDetail = {
  id: string;
  stage: string;
  groupName: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  resultHome: number | null;
  resultAway: number | null;
  qualifiedTeam: string | null;
  predictions: MatchPredictionRow[];
};

function getStatusClasses(status: string) {
  if (status === UI_TEXT.matchStatus.open) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === UI_TEXT.matchStatus.closed) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}

export default async function PredictMatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const session = await requireAuth();
  const { matchId } = await params;

  const match: MatchDetail | null = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      stage: true,
      groupName: true,
      homeTeam: true,
      awayTeam: true,
      kickoffAt: true,
      resultHome: true,
      resultAway: true,
      qualifiedTeam: true,
      predictions: {
        select: {
          id: true,
          userId: true,
          predictedHome: true,
          predictedAway: true,
          qualifiedTeam: true,
          createdAt: true,
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
    match.predictions.find(
      (prediction: MatchPredictionRow) => prediction.userId === session.user.id
    ) ?? null;

  const status = getMatchStatus(match);
  const isFinished = status === UI_TEXT.matchStatus.finished;
  const isClosed = status !== UI_TEXT.matchStatus.open;

  const visiblePredictions: MatchPredictionRow[] = isClosed
    ? match.predictions
        .filter(
          (prediction: MatchPredictionRow) =>
            prediction.user.active && prediction.user.role === "USER"
        )
        .sort((a, b) => a.user.username.localeCompare(b.user.username, "es"))
    : [];

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <span>←</span>
            <span>Volver al fixture</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.03))] shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-zinc-300">
                {formatStageWithGroup(match.stage, match.groupName)}
              </span>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  status
                )}`}
              >
                {UI_TEXT.labels.status}: {status}
              </span>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-5">
                <div className="text-white">
                  <TeamNameWithFlag
                    teamName={match.homeTeam}
                    className="text-xl font-bold sm:text-2xl"
                    flagClassName="h-5 w-7 sm:h-6 sm:w-9"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-zinc-400">
                  VS
                </span>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-5">
                <div className="text-white">
                  <TeamNameWithFlag
                    teamName={match.awayTeam}
                    className="text-xl font-bold sm:text-2xl"
                    flagClassName="h-5 w-7 sm:h-6 sm:w-9"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                Inicio: {formatDateTime(match.kickoffAt)}
              </span>
            </div>
          </div>

          {isFinished ? (
            <div className="px-6 py-5 sm:px-8">
              <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-zinc-100">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  Resultado oficial
                </p>
                <p className="mt-3 text-lg font-bold text-white">
                  {match.homeTeam} {match.resultHome} - {match.resultAway}{" "}
                  {match.awayTeam}
                </p>
                {match.qualifiedTeam ? (
                  <p className="mt-2 text-zinc-200">
                    {UI_TEXT.labels.qualifiedTeam}: {match.qualifiedTeam}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          {isClosed ? (
            <div
              className={`rounded-[32px] p-6 shadow-2xl shadow-black/20 ${
                isFinished
                  ? "border border-emerald-500/20 bg-emerald-500/10"
                  : "border border-amber-500/20 bg-amber-500/10"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  isFinished ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {isFinished ? "Partido finalizado" : "Pronóstico cerrado"}
              </h2>

              <p
                className={`mt-3 max-w-3xl text-sm leading-6 ${
                  isFinished ? "text-emerald-100/80" : "text-amber-100/80"
                }`}
              >
                {isFinished
                  ? "El resultado ya fue cargado. Puedes revisar tu pronóstico y comparar cómo quedaron las predicciones del resto."
                  : "El partido ya empezó. No puedes modificar tu pronóstico, pero sí revisar lo que quedó registrado antes del cierre."}
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Tu pronóstico
                </h3>

                {myPrediction ? (
                  <div className="mt-4 space-y-3 text-sm text-zinc-200">
                    <p className="text-lg font-bold text-white">
                      {match.homeTeam} {myPrediction.predictedHome} -{" "}
                      {myPrediction.predictedAway} {match.awayTeam}
                    </p>

                    {myPrediction.qualifiedTeam ? (
                      <p className="text-zinc-300">
                        {UI_TEXT.labels.qualifiedTeam}: {myPrediction.qualifiedTeam}
                      </p>
                    ) : null}

                    {isFinished ? (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        {(() => {
                          const myScore = calculatePredictionScore(match, myPrediction);

                          return (
                            <>
                              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                                Resultado de tu pronóstico
                              </p>
                              <p className="mt-2 text-xl font-black text-white">
                                {UI_TEXT.labels.points}: {myScore.points}
                              </p>
                              <p className="mt-1 text-zinc-300">{myScore.reason}</p>
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
          <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Predicciones del partido
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {isFinished
                    ? "Compara predicciones registradas y puntos obtenidos por cada usuario."
                    : "Estas son las predicciones registradas antes del inicio del partido."}
                </p>
              </div>

              <div className="text-sm text-zinc-500">
                {visiblePredictions.length} participante
                {visiblePredictions.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">{UI_TEXT.labels.prediction}</th>
                    <th className="px-4 py-3 font-medium">{UI_TEXT.labels.qualifiedTeam}</th>
                    {isFinished ? (
                      <>
                        <th className="px-4 py-3 font-medium">{UI_TEXT.labels.points}</th>
                        <th className="px-4 py-3 font-medium">Detalle</th>
                      </>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {visiblePredictions.map((prediction: MatchPredictionRow) => {
                    const score = isFinished
                      ? calculatePredictionScore(match, prediction)
                      : null;

                    return (
                      <tr
                        key={prediction.id}
                        className="border-b border-white/5 text-zinc-200 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4 font-semibold text-white">
                          {prediction.user.username}
                        </td>
                        <td className="px-4 py-4">
                          {match.homeTeam} {prediction.predictedHome} -{" "}
                          {prediction.predictedAway} {match.awayTeam}
                        </td>
                        <td className="px-4 py-4">
                          {prediction.qualifiedTeam ?? "—"}
                        </td>

                        {isFinished ? (
                          <>
                            <td className="px-4 py-4 font-bold text-white">
                              {score?.points ?? 0}
                            </td>
                            <td className="px-4 py-4">
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