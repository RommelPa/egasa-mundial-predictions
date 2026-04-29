import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildRanking, calculatePredictionScore, type RankingRow } from "@/lib/domain/scoring";
import { formatStage, getMatchStatus } from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";

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
  const myRankIndex = ranking.findIndex((row: RankingRow) => row.userId === session.user.id);
  const myRank = myRankIndex >= 0 ? ranking[myRankIndex] : null;
  const myPosition = myRankIndex >= 0 ? myRankIndex + 1 : null;

  const openMatches: MatchCard[] = upcomingMatches
    .filter((match: MatchCard) => getMatchStatus(match) === "Abierto")
    .slice(0, 5);

  const finishedPredictions: FinishedPredictionCard[] = recentPredictions
    .filter((prediction: PredictionWithMatch) => getMatchStatus(prediction.match) === "Finalizado")
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
      (match: MatchCard) => getMatchStatus(match) === "Abierto"
    ).length;

    const closedWithoutResultCount = upcomingMatches.filter(
      (match: MatchCard) => getMatchStatus(match) === "Cerrado"
    ).length;

    const finishedMatchesCount = upcomingMatches.filter(
      (match: MatchCard) => getMatchStatus(match) === "Finalizado"
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
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            Panel principal
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Bienvenido, {session.user.username}
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Aquí tienes tu resumen actual dentro del prode y los siguientes pasos
            importantes para no perder puntos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Posición actual</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {myPosition ?? "—"}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Ranking global entre usuarios activos
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Puntos</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {myRank?.totalPoints ?? 0}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Total acumulado en partidos finalizados
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Exactos</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {myRank?.exactHits ?? 0}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Aciertos de marcador exacto
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Clasificados correctos</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {myRank?.qualifiedHits ?? 0}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Aciertos de clasificación en eliminación
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Próximos partidos abiertos</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Estos son los partidos que todavía puedes pronosticar.
                </p>
              </div>

              <Link
                href="/matches"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
              >
                Ver fixture
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {openMatches.length > 0 ? (
                openMatches.map((match: MatchCard) => (
                  <div
                    key={match.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">
                          #{match.matchNumber} · {formatStage(match.stage)}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {match.homeTeam} vs {match.awayTeam}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatDateTime(match.kickoffAt)}
                        </p>
                      </div>

                      <Link
                        href={`/matches/${match.id}/predict`}
                        className="inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                      >
                        Pronosticar
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
                  No hay partidos abiertos en este momento.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Últimos partidos puntuados</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Tus resultados recientes y cómo impactaron en tu puntaje.
                </p>
              </div>

              <Link
                href="/my-predictions"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
              >
                Ver mis pronósticos
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {finishedPredictions.length > 0 ? (
                finishedPredictions.map(({ prediction, score }: FinishedPredictionCard) => (
                  <div
                    key={prediction.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-sm text-zinc-400">
                      #{prediction.match.matchNumber} ·{" "}
                      {formatStage(prediction.match.stage)}
                    </p>

                    <p className="mt-1 text-base font-semibold text-white">
                      {prediction.match.homeTeam} vs {prediction.match.awayTeam}
                    </p>

                    <p className="mt-3 text-sm text-zinc-300">
                      Tu pronóstico: {prediction.match.homeTeam}{" "}
                      {prediction.predictedHome} - {prediction.predictedAway}{" "}
                      {prediction.match.awayTeam}
                    </p>

                    {prediction.qualifiedTeam ? (
                      <p className="mt-1 text-sm text-zinc-400">
                        Clasifica: {prediction.qualifiedTeam}
                      </p>
                    ) : null}

                    <p className="mt-3 text-sm text-zinc-300">
                      Resultado oficial: {prediction.match.homeTeam}{" "}
                      {prediction.match.resultHome} - {prediction.match.resultAway}{" "}
                      {prediction.match.awayTeam}
                    </p>

                    {prediction.match.qualifiedTeam ? (
                      <p className="mt-1 text-sm text-zinc-400">
                        Clasifica: {prediction.match.qualifiedTeam}
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-white">
                        Puntos: {score.points}
                      </p>

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          score.points > 0
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {score.reason}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
                  Aún no tienes partidos finalizados con puntaje calculado.
                </div>
              )}
            </div>
          </section>
        </div>

        {isAdmin && adminStats ? (
          <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Resumen operativo admin</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Estado general del sistema para gestionar el torneo sin perder control.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Usuarios activos</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {adminStats.activeUsers}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Partidos abiertos</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {adminStats.openMatchesCount}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">
                  Cerrados sin resultado
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {adminStats.closedWithoutResultCount}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Finalizados</p>
                <p className="mt-2 text-2xl font-bold text-white">
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