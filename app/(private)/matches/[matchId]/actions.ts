"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { isKnockoutStage } from "@/lib/domain/matches";
import {
  parseNonNegativeInteger,
  validatePredictionLikeInput,
} from "@/lib/domain/predictions";


type ActionState = {
  success?: boolean;
  error?: string;
};

export async function savePrediction(
  matchId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth();

  const predictedHomeValue = formData.get("predictedHome")?.toString();
  const predictedAwayValue = formData.get("predictedAway")?.toString();
  const qualifiedTeamRaw = formData.get("qualifiedTeam")?.toString();
  let qualifiedTeam = qualifiedTeamRaw?.trim() || null;

  const parsedHome = parseNonNegativeInteger(
    predictedHomeValue,
    "el marcador del equipo local"
  );

  if (!parsedHome.ok) {
    return { error: parsedHome.error };
  }

  const parsedAway = parseNonNegativeInteger(
    predictedAwayValue,
    "el marcador del equipo visitante"
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

  const now = new Date();

  if (now >= match.kickoffAt) {
    return {
      error: "Este partido ya inició. El pronóstico está cerrado y no puede modificarse.",
    };
  }

  const knockout = isKnockoutStage(match.stage);

  if (!knockout) {
    qualifiedTeam = null;
  }

  if (knockout) {
    if (parsedHome.value > parsedAway.value) {
      qualifiedTeam = match.homeTeam;
    }

    if (parsedAway.value > parsedHome.value) {
      qualifiedTeam = match.awayTeam;
    }
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

  const data = {
    predictedHome: parsedHome.value,
    predictedAway: parsedAway.value,
    qualifiedTeam: validation.normalizedQualifiedTeam,
  };

  const existingPrediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId: session.user.id,
        matchId,
      },
    },
  });

  if (existingPrediction) {
    await prisma.prediction.update({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId,
        },
      },
      data,
    });
  } else {
    await prisma.prediction.create({
      data: {
        userId: session.user.id,
        matchId,
        ...data,
      },
    });
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}/predict`);

  return { success: true };
}