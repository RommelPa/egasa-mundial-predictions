import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import {
  formatGroupName,
  formatStage,
  getMatchStatus,
  getStageOrder,
  isGroupStage,
} from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type MatchListRow = {
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

type GroupBlock = {
  groupName: string;
  matches: MatchListRow[];
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

export default async function MatchesPage() {
  await requireAuth();

  const matches: MatchListRow[] = await prisma.match.findMany({
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
  });

  const sortedMatches = [...matches].sort((a, b) => {
    const stageOrderDiff = getStageOrder(a.stage) - getStageOrder(b.stage);
    if (stageOrderDiff !== 0) return stageOrderDiff;

    if (isGroupStage(a.stage) && isGroupStage(b.stage)) {
      const groupA = a.groupName ?? "ZZZ";
      const groupB = b.groupName ?? "ZZZ";
      const groupDiff = groupA.localeCompare(groupB, "es");
      if (groupDiff !== 0) return groupDiff;
    }

    const kickoffDiff = a.kickoffAt.getTime() - b.kickoffAt.getTime();
    if (kickoffDiff !== 0) return kickoffDiff;

    return a.matchNumber - b.matchNumber;
  });

  const groupStageMatches = sortedMatches.filter((match) => isGroupStage(match.stage));
  const knockoutMatches = sortedMatches.filter((match) => !isGroupStage(match.stage));

  const groupBlocks: GroupBlock[] = Array.from(
    groupStageMatches.reduce((acc, match) => {
      const key = match.groupName ?? "Sin grupo";

      if (!acc.has(key)) {
        acc.set(key, []);
      }

      acc.get(key)!.push(match);
      return acc;
    }, new Map<string, MatchListRow[]>())
  )
    .map(([groupName, groupedMatches]) => ({
      groupName,
      matches: groupedMatches,
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName, "es"));

  const knockoutBlocks = Array.from(
    knockoutMatches.reduce((acc, match) => {
      const key = match.stage;

      if (!acc.has(key)) {
        acc.set(key, []);
      }

      acc.get(key)!.push(match);
      return acc;
    }, new Map<string, MatchListRow[]>())
  )
    .map(([stage, groupedMatches]) => ({
      stage,
      matches: groupedMatches,
    }))
    .sort((a, b) => getStageOrder(a.stage) - getStageOrder(b.stage));

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            Fixture oficial
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            {UI_TEXT.labels.matches}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
            Sigue el torneo, revisa el estado de cada partido y entra rápido a
            registrar tus pronósticos antes del cierre.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-zinc-400 shadow-2xl shadow-black/20">
            {UI_TEXT.emptyStates.noMatches}
          </div>
        ) : null}

        {groupBlocks.length > 0 ? (
          <section className="mb-12">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Fase de grupos
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Organizado por grupo para que ubiques rápido cada partido.
                </p>
              </div>

              <div className="text-sm text-zinc-500">
                {groupStageMatches.length} partidos cargados
              </div>
            </div>

            <div className="space-y-8">
              {groupBlocks.map((groupBlock) => (
                <div
                  key={groupBlock.groupName}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20"
                >
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {formatGroupName(groupBlock.groupName)}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {groupBlock.matches.length} partido
                        {groupBlock.matches.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-zinc-300">
                      Grupo
                    </span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {groupBlock.matches.map((match) => {
                      const status = getMatchStatus(match);

                      return (
                        <article
                          key={match.id}
                          className="group rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/15"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                                Partido #{match.matchNumber}
                              </p>
                              <p className="mt-2 text-sm font-medium text-zinc-400">
                                {formatDateTime(match.kickoffAt)}
                              </p>
                            </div>

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="mt-6 space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white">
                              <TeamNameWithFlag
                                teamName={match.homeTeam}
                                textClassName="font-semibold"
                              />
                            </div>

                            <div className="flex items-center justify-center">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-400">
                                VS
                              </span>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white">
                              <TeamNameWithFlag
                                teamName={match.awayTeam}
                                textClassName="font-semibold"
                              />
                            </div>
                          </div>

                          <div className="mt-6">
                            <Link
                              href={`/matches/${match.id}/predict`}
                              className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition ${
                                status === UI_TEXT.matchStatus.open
                                  ? "bg-white text-zinc-950 hover:bg-zinc-200"
                                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                              }`}
                            >
                              {status === UI_TEXT.matchStatus.open
                                ? "Pronosticar ahora"
                                : "Ver partido"}
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {knockoutBlocks.length > 0 ? (
          <section>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Fases eliminatorias
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Rondas organizadas desde dieciseisavos hasta la final.
                </p>
              </div>

              <div className="text-sm text-zinc-500">
                {knockoutMatches.length} partidos cargados
              </div>
            </div>

            <div className="space-y-8">
              {knockoutBlocks.map((block) => (
                <div
                  key={block.stage}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20"
                >
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {formatStage(block.stage)}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {block.matches.length} partido
                        {block.matches.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Eliminación directa
                    </span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {block.matches.map((match) => {
                      const status = getMatchStatus(match);

                      return (
                        <article
                          key={match.id}
                          className="group rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.02))] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/15"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                                Partido #{match.matchNumber}
                              </p>
                              <p className="mt-2 text-sm font-medium text-zinc-400">
                                {formatDateTime(match.kickoffAt)}
                              </p>
                            </div>

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="mt-6 space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white">
                              <TeamNameWithFlag
                                teamName={match.homeTeam}
                                textClassName="font-semibold"
                              />
                            </div>

                            <div className="flex items-center justify-center">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-400">
                                VS
                              </span>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white">
                              <TeamNameWithFlag
                                teamName={match.awayTeam}
                                textClassName="font-semibold"
                              />
                            </div>
                          </div>

                          <div className="mt-6">
                            <Link
                              href={`/matches/${match.id}/predict`}
                              className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition ${
                                status === UI_TEXT.matchStatus.open
                                  ? "bg-white text-zinc-950 hover:bg-zinc-200"
                                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                              }`}
                            >
                              {status === UI_TEXT.matchStatus.open
                                ? "Pronosticar ahora"
                                : "Ver partido"}
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}