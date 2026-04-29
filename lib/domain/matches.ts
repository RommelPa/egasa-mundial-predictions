import { UI_TEXT } from "@/lib/ui/text";

export type MatchStatus =
  | typeof UI_TEXT.matchStatus.open
  | typeof UI_TEXT.matchStatus.closed
  | typeof UI_TEXT.matchStatus.finished;

export function isKnockoutStage(stage: string) {
  return stage !== "GROUP";
}

export function formatStage(stage: string) {
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