import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import { PredictionForm } from "./ui/prediction-form";

function formatStage(stage: string) {
  const labels: Record<string, string> = {
    GROUP: "Grupos",
    ROUND_OF_32: "Dieciseisavos",
    ROUND_OF_16: "Octavos",
    QUARTER_FINAL: "Cuartos",
    SEMI_FINAL: "Semifinal",
    THIRD_PLACE: "Tercer puesto",
    FINAL: "Final",
  };

  return labels[stage] ?? stage;
}

export default async function PredictMatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const session = await requireAuth();
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    notFound();
  }

  const prediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId: session.user.id,
        matchId,
      },
    },
  });

  const now = new Date();

  const isFinished =
    match.resultHome !== null && match.resultAway !== null;

  const isClosed =
    isFinished || now >= match.kickoffAt;

  return (
    <main>
      <div className="mx-auto max-w-4xl px-6 py-16">
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
            Inicio: {new Date(match.kickoffAt).toLocaleString("es-PE")}
          </p>

          <p className="mt-2 text-zinc-400">
            Estado:{" "}
            <span className="font-semibold text-zinc-200">
              {isFinished ? "Finalizado" : isClosed ? "Cerrado" : "Abierto"}
            </span>
          </p>
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
                  ? "Este partido ya tiene resultado cargado, por lo que tu pronóstico está disponible solo en modo lectura."
                  : "Este partido ya inició, por lo que ya no puedes crear ni editar tu pronóstico."}
              </p>

              {prediction ? (
                <div className="mt-6 space-y-2 text-sm text-zinc-200">
                  <p>
                    Tu pronóstico: {match.homeTeam} {prediction.predictedHome} -{" "}
                    {prediction.predictedAway} {match.awayTeam}
                  </p>

                  {prediction.qualifiedTeam ? (
                    <p>Clasifica por penales: {prediction.qualifiedTeam}</p>
                  ) : null}

                  {isFinished ? (
                    <>
                      <p>
                        Resultado final: {match.homeTeam} {match.resultHome} -{" "}
                        {match.resultAway} {match.awayTeam}
                      </p>

                      {match.qualifiedTeam ? (
                        <p>Clasificó por penales: {match.qualifiedTeam}</p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="mt-6 space-y-2 text-sm text-zinc-300">
                  <p>No registraste ningún pronóstico antes del cierre.</p>

                  {isFinished ? (
                    <>
                      <p>
                        Resultado final: {match.homeTeam} {match.resultHome} -{" "}
                        {match.resultAway} {match.awayTeam}
                      </p>

                      {match.qualifiedTeam ? (
                        <p>Clasificó por penales: {match.qualifiedTeam}</p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <PredictionForm
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              stage={match.stage}
              initialPrediction={
                prediction
                  ? {
                      predictedHome: prediction.predictedHome,
                      predictedAway: prediction.predictedAway,
                      qualifiedTeam: prediction.qualifiedTeam,
                    }
                  : null
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}