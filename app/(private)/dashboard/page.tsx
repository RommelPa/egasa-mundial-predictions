import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  buildRanking,
  calculatePredictionScore,
  type RankingRow,
} from "@/lib/domain/scoring";
import {
  formatStage,
  formatStageWithGroup,
  getMatchStatus,
} from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

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

type MatchCard = {
  id: string;
  matchNumber: number;
  stage: string;
  groupName: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  resultHome: number | null;
  resultAway: number | null;
};

type PredictionWithMatch = {
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

type FinishedPredictionCard = {
  prediction: PredictionWithMatch;
  score: ReturnType<typeof calculatePredictionScore>;
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const [rankingUsers, upcomingMatches, recentPredictions] = await Promise.all([
    prisma.user.findMany({
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
    }) as Promise<RankingUser[]>,
    prisma.match.findMany({
      orderBy: [{ kickoffAt: "asc" }, { matchNumber: "asc" }],
      select: {
        id: true,
        matchNumber: true,
        stage: true,
        groupName: true,
        homeTeam: true,
        awayTeam: true,
        kickoffAt: true,
        resultHome: true,
        resultAway: true,
      },
    }) as Promise<MatchCard[]>,
    prisma.prediction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        match: true,
      },
      orderBy: [
        {
          match: {
            kickoffAt: "desc",
          },
        },
        {
          match: {
            matchNumber: "desc",
          },
        },
      ],
    }) as Promise<PredictionWithMatch[]>,
  ]);

  const ranking: RankingRow[] = buildRanking(rankingUsers);
  const myRankIndex = ranking.findIndex(
    (row: RankingRow) => row.userId === session.user.id
  );
  const myRank = myRankIndex >= 0 ? ranking[myRankIndex] : null;
  const myPosition = myRankIndex >= 0 ? myRankIndex + 1 : null;

  const openMatches: MatchCard[] = upcomingMatches
    .filter((match: MatchCard) => getMatchStatus(match) === UI_TEXT.matchStatus.open)
    .slice(0, 5);

  const finishedPredictions: FinishedPredictionCard[] = recentPredictions
    .filter(
      (prediction: PredictionWithMatch) =>
        getMatchStatus(prediction.match) === UI_TEXT.matchStatus.finished
    )
    .slice(0, 5)
    .map((prediction: PredictionWithMatch) => ({
      prediction,
      score: calculatePredictionScore(prediction.match, prediction),
    }));

  const isAdmin = session.user.role === "ADMIN";

  let adminStats: {
    activeUsers: number;
    openMatchesCount: number;
    closedWithoutResultCount: number;
    finishedMatchesCount: number;
  } | null = null;

  if (isAdmin) {
    const activeUsers = await prisma.user.count({
      where: {
        active: true,
      },
    });

    const openMatchesCount = upcomingMatches.filter(
      (match: MatchCard) => getMatchStatus(match) === UI_TEXT.matchStatus.open
    ).length;

    const closedWithoutResultCount = upcomingMatches.filter(
      (match: MatchCard) => getMatchStatus(match) === UI_TEXT.matchStatus.closed
    ).length;

    const finishedMatchesCount = upcomingMatches.filter(
      (match: MatchCard) => getMatchStatus(match) === UI_TEXT.matchStatus.finished
    ).length;

    adminStats = {
      activeUsers,
      openMatchesCount,
      closedWithoutResultCount,
      finishedMatchesCount,
    };
  }

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-3 py-1 text-sm text-[#3CAC3B]">
            Panel principal
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Bienvenido, {session.user.username}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#D1D4D1]/88 sm:text-lg">
            Sigue tu rendimiento, detecta oportunidades y no regales puntos en los
            próximos cierres.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(71,74,74,0.28),rgba(255,255,255,0.03))] p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-[#D1D4D1]/72">Posición actual</p>
            <p className="mt-3 text-4xl font-black text-white">{myPosition ?? "—"}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-[#D1D4D1]/45">
              Ranking global
            </p>
          </div>

          <div className="rounded-[28px] border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-[#c9f1c8]">{UI_TEXT.labels.points}</p>
            <p className="mt-3 text-4xl font-black text-white">
              {myRank?.totalPoints ?? 0}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-[#c9f1c8]/70">
              Total acumulado
            </p>
          </div>

          <div className="rounded-[28px] border border-[#2A398D]/30 bg-[#2A398D]/16 p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-[#d9ddf8]">Exactos</p>
            <p className="mt-3 text-4xl font-black text-white">
              {myRank?.exactHits ?? 0}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-[#d9ddf8]/70">
              Marcadores perfectos
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E61D25]/30 bg-[#E61D25]/12 p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-[#ffd7d9]">Clasificados correctos</p>
            <p className="mt-3 text-4xl font-black text-white">
              {myRank?.qualifiedHits ?? 0}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-[#ffd7d9]/70">
              Eliminación directa
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.16),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Próximos partidos abiertos
                </h2>
                <p className="mt-2 text-sm text-[#D1D4D1]/72">
                  Estos son los partidos donde todavía puedes actuar.
                </p>
              </div>

              <Link
                href="/matches"
                className="rounded-xl border border-white/10 bg-[#474A4A]/24 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#474A4A]/36"
              >
                Ver fixture
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {openMatches.length > 0 ? (
                openMatches.map((match: MatchCard) => (
                  <div
                    key={match.id}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#D1D4D1]/45">
                          #{match.matchNumber} · {formatStageWithGroup(match.stage, match.groupName)}
                        </p>

                        <div className="mt-3 space-y-2">
                          <div className="text-lg font-bold text-white">
                            <TeamNameWithFlag teamName={match.homeTeam} />
                          </div>
                          <div className="text-sm text-[#D1D4D1]/45">vs</div>
                          <div className="text-lg font-bold text-white">
                            <TeamNameWithFlag teamName={match.awayTeam} />
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-[#D1D4D1]/72">
                          {formatDateTime(match.kickoffAt)}
                        </p>
                      </div>

                      <Link
                        href={`/matches/${match.id}/predict`}
                        className="inline-flex rounded-2xl bg-[#2A398D] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317b]"
                      >
                        Pronosticar
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-[#D1D4D1]/72">
                  {UI_TEXT.emptyStates.noOpenMatches}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(230,29,37,0.12),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Últimos partidos puntuados
                </h2>
                <p className="mt-2 text-sm text-[#D1D4D1]/72">
                  Lo último que impactó en tu puntaje.
                </p>
              </div>

              <Link
                href="/my-predictions"
                className="rounded-xl border border-white/10 bg-[#474A4A]/24 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#474A4A]/36"
              >
                Ver detalle
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {finishedPredictions.length > 0 ? (
                finishedPredictions.map(
                  ({ prediction, score }: FinishedPredictionCard) => (
                    <div
                      key={prediction.id}
                      className="rounded-[24px] border border-white/10 bg-black/20 p-5"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-[#D1D4D1]/45">
                        #{prediction.match.matchNumber} · {formatStage(prediction.match.stage)}
                      </p>

                      <div className="mt-3 space-y-2">
                        <div className="text-base font-bold text-white">
                          <TeamNameWithFlag teamName={prediction.match.homeTeam} />
                        </div>
                        <div className="text-sm text-[#D1D4D1]/45">vs</div>
                        <div className="text-base font-bold text-white">
                          <TeamNameWithFlag teamName={prediction.match.awayTeam} />
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-[#D1D4D1]/85">
                        Tu pronóstico: {prediction.match.homeTeam}{" "}
                        {prediction.predictedHome} - {prediction.predictedAway}{" "}
                        {prediction.match.awayTeam}
                      </p>

                      {prediction.qualifiedTeam ? (
                        <p className="mt-1 text-sm text-[#D1D4D1]/72">
                          {UI_TEXT.labels.qualifiedTeam}: {prediction.qualifiedTeam}
                        </p>
                      ) : null}

                      <p className="mt-4 text-sm text-[#D1D4D1]/85">
                        {UI_TEXT.labels.officialResult}: {prediction.match.homeTeam}{" "}
                        {prediction.match.resultHome} - {prediction.match.resultAway}{" "}
                        {prediction.match.awayTeam}
                      </p>

                      {prediction.match.qualifiedTeam ? (
                        <p className="mt-1 text-sm text-[#D1D4D1]/72">
                          {UI_TEXT.labels.qualifiedTeam}:{" "}
                          {prediction.match.qualifiedTeam}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-black text-white">
                          {UI_TEXT.labels.points}: {score.points}
                        </p>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            score.points > 0
                              ? "bg-[#3CAC3B]/12 text-[#9be39a]"
                              : "bg-[#474A4A]/30 text-[#D1D4D1]"
                          }`}
                        >
                          {score.reason}
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-[#D1D4D1]/72">
                  {UI_TEXT.emptyStates.noFinishedPredictions}
                </div>
              )}
            </div>
          </section>
        </div>

        {isAdmin && adminStats ? (
          <section className="mt-10 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.16),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/20">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">Resumen operativo admin</h2>
              <p className="mt-2 text-sm text-[#D1D4D1]/72">
                Estado general del sistema para mantener el torneo bajo control.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-[#D1D4D1]/72">Usuarios activos</p>
                <p className="mt-2 text-3xl font-black text-white">
                  {adminStats.activeUsers}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 p-4">
                <p className="text-sm text-[#c9f1c8]">Partidos abiertos</p>
                <p className="mt-2 text-3xl font-black text-white">
                  {adminStats.openMatchesCount}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#E61D25]/30 bg-[#E61D25]/12 p-4">
                <p className="text-sm text-[#ffd7d9]">Cerrados sin resultado</p>
                <p className="mt-2 text-3xl font-black text-white">
                  {adminStats.closedWithoutResultCount}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#2A398D]/30 bg-[#2A398D]/16 p-4">
                <p className="text-sm text-[#d9ddf8]">Finalizados</p>
                <p className="mt-2 text-3xl font-black text-white">
                  {adminStats.finishedMatchesCount}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}