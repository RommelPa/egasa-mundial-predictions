import { isKnockoutStage } from "@/lib/domain/matches";

type ValidatePredictionLikeInput = {
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  qualifiedTeam: string | null;
};

type ValidationResult =
  | {
      ok: true;
      normalizedQualifiedTeam: string | null;
    }
  | {
      ok: false;
      error: string;
    };

export function parseNonNegativeInteger(
  value: string | null | undefined,
  fieldLabel: string
): { ok: true; value: number } | { ok: false; error: string } {
  if (!value) {
    return { ok: false, error: `Debes completar ${fieldLabel}.` };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return {
      ok: false,
      error: `${fieldLabel} debe ser un entero mayor o igual a 0.`,
    };
  }

  return { ok: true, value: parsed };
}

export function validatePredictionLikeInput({
  stage,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  qualifiedTeam,
}: ValidatePredictionLikeInput): ValidationResult {
  const knockout = isKnockoutStage(stage);

  if (!knockout) {
    if (qualifiedTeam) {
      return {
        ok: false,
        error: "No debes indicar clasificado para partidos de fase de grupos.",
      };
    }

    return {
      ok: true,
      normalizedQualifiedTeam: null,
    };
  }

  if (!qualifiedTeam) {
    return {
      ok: false,
      error: "En eliminación debes indicar siempre qué equipo clasifica.",
    };
  }

  if (qualifiedTeam !== homeTeam && qualifiedTeam !== awayTeam) {
    return {
      ok: false,
      error: "El clasificado elegido no corresponde a este partido.",
    };
  }

  if (homeScore > awayScore && qualifiedTeam !== homeTeam) {
    return {
      ok: false,
      error: `El clasificado debe ser ${homeTeam} porque el marcador lo da como ganador.`,
    };
  }

  if (awayScore > homeScore && qualifiedTeam !== awayTeam) {
    return {
      ok: false,
      error: `El clasificado debe ser ${awayTeam} porque el marcador lo da como ganador.`,
    };
  }

  return {
    ok: true,
    normalizedQualifiedTeam: qualifiedTeam,
  };
}