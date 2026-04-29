"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import {
  parseNonNegativeInteger,
  validatePredictionLikeInput,
} from "@/lib/domain/predictions";

type ActionState = {
  success?: boolean;
  error?: string;
};

export async function saveMatchResult(
  matchId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const resultHomeValue = formData.get("resultHome")?.toString();
  const resultAwayValue = formData.get("resultAway")?.toString();
  const qualifiedTeamRaw = formData.get("qualifiedTeam")?.toString();
  const qualifiedTeam = qualifiedTeamRaw?.trim() || null;

  const parsedHome = parseNonNegativeInteger(
    resultHomeValue,
    "el resultado del equipo local"
  );

  if (!parsedHome.ok) {
    return { error: parsedHome.error };
  }

  const parsedAway = parseNonNegativeInteger(
    resultAwayValue,
    "el resultado del equipo visitante"
  );

  if (!parsedAway.ok) {
    return { error: parsedAway.error };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    return { error: "El partido no existe." };
  }

  const validation = validatePredictionLikeInput({
    stage: match.stage,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: parsedHome.value,
    awayScore: parsedAway.value,
    qualifiedTeam,
  });

  if (!validation.ok) {
    return { error: validation.error };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      resultHome: parsedHome.value,
      resultAway: parsedAway.value,
      qualifiedTeam: validation.normalizedQualifiedTeam,
    },
  });

  revalidatePath("/admin/results");
  revalidatePath("/admin/matches");
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}/predict`);

  return { success: true };
}