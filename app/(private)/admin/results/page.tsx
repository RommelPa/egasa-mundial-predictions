import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ResultForm } from "./ui/result-form";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";
import { formatStageWithGroup } from "@/lib/domain/matches";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type MatchResultRow = {
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

export default async function AdminResultsPage() {
  await requireAdmin();

  const matches: MatchResultRow[] = await prisma.match.findMany({
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
      qualifiedTeam: true,
    },
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-[#2A398D]/30 bg-[#2A398D]/15 px-3 py-1 text-sm text-[#D1D4D1]">
            Panel admin
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Resultados
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#D1D4D1]/88 sm:text-lg">
            Registra el resultado oficial de cada partido con una vista más clara
            para operar sin errores.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-[#474A4A]/18 p-10 text-sm text-[#D1D4D1]/72 shadow-2xl shadow-black/20">
            {UI_TEXT.emptyStates.noMatches}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {matches.map((match: MatchResultRow) => (
              <div
                key={match.id}
                className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-2xl shadow-black/20"
              >
                <div className="mb-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Partido #{match.matchNumber}
                    </span>

                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                      {formatStageWithGroup(match.stage, match.groupName)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                      <TeamNameWithFlag
                        teamName={match.homeTeam}
                        className="text-base font-bold text-white"
                        flagClassName="h-5 w-7"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                        VS
                      </span>
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                      <TeamNameWithFlag
                        teamName={match.awayTeam}
                        className="text-base font-bold text-white"
                        flagClassName="h-5 w-7"
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-zinc-400">
                    Inicio: {formatDateTime(match.kickoffAt)}
                  </p>
                </div>

                <ResultForm
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}