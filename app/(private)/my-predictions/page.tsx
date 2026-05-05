import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { calculatePredictionScore } from "@/lib/domain/scoring";
import {
  formatStageWithGroup,
  getMatchStatus,
} from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type PredictionRow = {
  id: string;
  predictedHome: number;
  predictedAway: number;
  qualifiedTeam: string | null;
  match: {
    id: string;
    matchNumber: number;
    stage: string;
    groupName: string | null;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: Date;
    resultHome: number | null;
    resultAway: number | null;
    qualifiedTeam: string | null;
  };
};

function getStatusClasses(status: string) {
  if (status === UI_TEXT.matchStatus.open) {
    return "border-[#3CAC3B]/30 bg-[#3CAC3B]/12 text-[#9be39a]";
  }

  if (status === UI_TEXT.matchStatus.closed) {
    return "border-[#E61D25]/30 bg-[#E61D25]/12 text-[#ffd7d9]";
  }

  return "border-white/10 bg-[#474A4A]/30 text-[#D1D4D1]";
}

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
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
            Seguimiento
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            {UI_TEXT.labels.myPredictions}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Revisa tu historial completo, cómo quedó cada partido y cuántos puntos
            generó cada pronóstico.
          </p>
        </div>

        {predictions.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-zinc-400 shadow-2xl shadow-black/20">
            {UI_TEXT.emptyStates.noPredictions}
          </div>
        ) : (
          <div className="space-y-5">
            {predictions.map((prediction: PredictionRow) => {
              const match = prediction.match;
              const status = getMatchStatus(match);
              const score = calculatePredictionScore(match, prediction);
              const resultAvailable =
                match.resultHome !== null && match.resultAway !== null;

              return (
                <article
                  key={prediction.id}
                  className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/20"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                          Partido #{match.matchNumber}
                        </span>

                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                          {formatStageWithGroup(match.stage, match.groupName)}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                        <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                          <TeamNameWithFlag
                            teamName={match.homeTeam}
                            className="text-lg font-bold text-white"
                            flagClassName="h-5 w-7"
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                            VS
                          </span>
                        </div>

                        <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                          <TeamNameWithFlag
                            teamName={match.awayTeam}
                            className="text-lg font-bold text-white"
                            flagClassName="h-5 w-7"
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-zinc-400">
                        {formatDateTime(match.kickoffAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-start">
                      <Link
                        href={`/matches/${match.id}/predict`}
                        className={`inline-flex rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wide transition ${
                          status === UI_TEXT.matchStatus.open
                            ? "bg-white text-zinc-950 hover:bg-zinc-200"
                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {status === UI_TEXT.matchStatus.open ? "Editar" : "Ver"}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Mi pronóstico
                      </p>
                      <p className="mt-3 text-lg font-black text-white">
                        {match.homeTeam} {prediction.predictedHome} -{" "}
                        {prediction.predictedAway} {match.awayTeam}
                      </p>
                      {prediction.qualifiedTeam ? (
                        <p className="mt-2 text-sm text-zinc-400">
                          {UI_TEXT.labels.qualifiedTeam}: {prediction.qualifiedTeam}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {UI_TEXT.labels.officialResult}
                      </p>

                      {resultAvailable ? (
                        <>
                          <p className="mt-3 text-lg font-black text-white">
                            {match.homeTeam} {match.resultHome} - {match.resultAway}{" "}
                            {match.awayTeam}
                          </p>
                          {match.qualifiedTeam ? (
                            <p className="mt-2 text-sm text-zinc-400">
                              {UI_TEXT.labels.qualifiedTeam}: {match.qualifiedTeam}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-400">Pendiente</p>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Resultado del pronóstico
                      </p>

                      <p className="mt-3 text-3xl font-black text-white">
                        {score.scored ? score.points : "—"}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          score.scored
                            ? score.points > 0
                              ? "bg-[#3CAC3B]/12 text-[#9be39a]"
                              : "bg-[#474A4A]/30 text-[#D1D4D1]"
                            : "bg-[#E61D25]/12 text-[#ffd7d9]"
                        }`}
                      >
                        {score.reason}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}