import { UI_TEXT } from "@/lib/ui/text";

export type MatchStatus =
  | typeof UI_TEXT.matchStatus.open
  | typeof UI_TEXT.matchStatus.closed
  | typeof UI_TEXT.matchStatus.finished;

const STAGE_LABELS: Record<string, string> = {
  GROUP: "Grupos",
  ROUND_OF_32: "Dieciseisavos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINAL: "Cuartos",
  SEMI_FINAL: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

const STAGE_ORDER: Record<string, number> = {
  GROUP: 1,
  ROUND_OF_32: 2,
  ROUND_OF_16: 3,
  QUARTER_FINAL: 4,
  SEMI_FINAL: 5,
  THIRD_PLACE: 6,
  FINAL: 7,
};

export function isGroupStage(stage: string) {
  return stage === "GROUP";
}

export function isKnockoutStage(stage: string) {
  return stage !== "GROUP";
}

export function formatStage(stage: string) {
  return STAGE_LABELS[stage] ?? stage;
}

export function formatGroupName(groupName: string | null | undefined) {
  if (!groupName) {
    return "Sin grupo";
  }

  return `Grupo ${groupName}`;
}

export function formatStageWithGroup(stage: string, groupName?: string | null) {
  if (isGroupStage(stage) && groupName) {
    return `${formatStage(stage)} · ${groupName}`;
  }

  return formatStage(stage);
}

export function getStageOrder(stage: string) {
  return STAGE_ORDER[stage] ?? 999;
}

export function getMatchStatus(
  match: {
    kickoffAt: Date;
    resultHome: number | null;
    resultAway: number | null;
  },
  now = new Date()
): MatchStatus {
  if (match.resultHome !== null && match.resultAway !== null) {
    return UI_TEXT.matchStatus.finished;
  }

  if (match.kickoffAt <= now) {
    return UI_TEXT.matchStatus.closed;
  }

  return UI_TEXT.matchStatus.open;
}

export function getWinnerFromScore(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): string | null {
  if (homeScore > awayScore) return homeTeam;
  if (awayScore > homeScore) return awayTeam;
  return null;
}

export function isValidQualifiedTeam(
  qualifiedTeam: string | null | undefined,
  homeTeam: string,
  awayTeam: string
): boolean {
  if (!qualifiedTeam) return false;
  return qualifiedTeam === homeTeam || qualifiedTeam === awayTeam;
}