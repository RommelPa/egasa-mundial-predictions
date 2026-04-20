import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ResultForm } from "./ui/result-form";

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

export default async function AdminResultsPage() {
  await requireAdmin();

  const matches = await prisma.match.findMany({
    orderBy: [{ kickoffAt: "asc" }, { matchNumber: "asc" }],
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Resultados
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Registra manualmente los resultados reales de los partidos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            {matches.map((match) => (
            <ResultForm
                key={match.id}
                matchId={match.id}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                stage={match.stage}
                initialResult={{
                resultHome: match.resultHome,
                resultAway: match.resultAway,
                qualifiedTeam: match.qualifiedTeam,
                }}
            />
            ))}

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-400">
              Aún no hay partidos registrados.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}