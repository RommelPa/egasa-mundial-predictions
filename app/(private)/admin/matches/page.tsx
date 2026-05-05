import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateMatchForm } from "./ui/create-match-form";
import {
  formatStageWithGroup,
  getMatchStatus,
} from "@/lib/domain/matches";
import { formatDateTime } from "@/lib/format/date";
import { UI_TEXT } from "@/lib/ui/text";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type MatchRow = {
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

const STAGE_FILTERS = [
  { value: "ALL", label: "Todas las fases" },
  { value: "GROUP", label: "Grupos" },
  { value: "ROUND_OF_32", label: "Dieciseisavos" },
  { value: "ROUND_OF_16", label: "Octavos" },
  { value: "QUARTER_FINAL", label: "Cuartos" },
  { value: "SEMI_FINAL", label: "Semifinal" },
  { value: "THIRD_PLACE", label: "Tercer puesto" },
  { value: "FINAL", label: "Final" },
] as const;

const GROUP_FILTERS = [
  { value: "ALL", label: "Todos los grupos" },
  { value: "A", label: "Grupo A" },
  { value: "B", label: "Grupo B" },
  { value: "C", label: "Grupo C" },
  { value: "D", label: "Grupo D" },
  { value: "E", label: "Grupo E" },
  { value: "F", label: "Grupo F" },
  { value: "G", label: "Grupo G" },
  { value: "H", label: "Grupo H" },
  { value: "I", label: "Grupo I" },
  { value: "J", label: "Grupo J" },
  { value: "K", label: "Grupo K" },
  { value: "L", label: "Grupo L" },
] as const;

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    stage?: string;
    group?: string;
    q?: string;
  }>;
}) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const stageFilter = params.stage ?? "ALL";
  const groupFilter = params.group ?? "ALL";
  const query = (params.q ?? "").trim().toLowerCase();

  const matches: MatchRow[] = await prisma.match.findMany({
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

  const filteredMatches = matches.filter((match) => {
    const matchesStage = stageFilter === "ALL" || match.stage === stageFilter;
    const matchesGroup =
      groupFilter === "ALL" || match.groupName === groupFilter;
    const matchesQuery =
      query.length === 0 ||
      match.homeTeam.toLowerCase().includes(query) ||
      match.awayTeam.toLowerCase().includes(query);

    return matchesStage && matchesGroup && matchesQuery;
  });

  const latestMatchNumber =
    matches.length > 0
      ? Math.max(...matches.map((match) => match.matchNumber))
      : 0;

  const nextMatchNumber = latestMatchNumber + 1;

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Partidos
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Registra y revisa los partidos del Mundial 2026.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <CreateMatchForm nextMatchNumber={nextMatchNumber} />

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Partidos registrados</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Estado calculado según hora de inicio y resultados cargados.
                </p>
              </div>

              <div className="text-sm text-zinc-400">
                Mostrando {filteredMatches.length} de {matches.length} partidos
              </div>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="stage"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Fase
                </label>
                <select
                  id="stage"
                  name="stage"
                  defaultValue={stageFilter}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                >
                  {STAGE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="group"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Grupo
                </label>
                <select
                  id="group"
                  name="group"
                  defaultValue={groupFilter}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                >
                  {GROUP_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Buscar equipo
                </label>
                <input
                  id="q"
                  name="q"
                  type="text"
                  defaultValue={params.q ?? ""}
                  placeholder="Ej. Argentina"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="md:col-span-3 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Aplicar filtros
                </button>

                <a
                  href="/admin/matches"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Limpiar filtros
                </a>
              </div>
            </form>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">{UI_TEXT.labels.stage}</th>
                    <th className="px-4 py-3 font-medium">Partido</th>
                    <th className="px-4 py-3 font-medium">Inicio</th>
                    <th className="px-4 py-3 font-medium">{UI_TEXT.labels.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => {
                    const status = getMatchStatus(match);

                    return (
                      <tr
                        key={match.id}
                        className="border-b border-white/5 text-zinc-200 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4">{match.matchNumber}</td>
                        <td className="px-4 py-4">
                          {formatStageWithGroup(match.stage, match.groupName)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-white">
                              <TeamNameWithFlag teamName={match.homeTeam} />
                            </div>
                            <div className="text-xs text-zinc-500">vs</div>
                            <div className="font-medium text-white">
                              <TeamNameWithFlag teamName={match.awayTeam} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-zinc-300">
                          {formatDateTime(match.kickoffAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              status === UI_TEXT.matchStatus.open
                                ? "bg-emerald-500/10 text-emerald-300"
                                : status === UI_TEXT.matchStatus.closed
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMatches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-zinc-400"
                      >
                        No hay partidos que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}