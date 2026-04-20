"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

type ActionState = {
  success?: boolean;
  error?: string;
};

function isKnockoutStage(stage: string) {
  return stage !== "GROUP";
}

export async function savePrediction(
  matchId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth();

  const predictedHomeValue = formData.get("predictedHome")?.toString();
  const predictedAwayValue = formData.get("predictedAway")?.toString();
  const qualifiedTeam = formData.get("qualifiedTeam")?.toString().trim() || null;

  if (!predictedHomeValue || !predictedAwayValue) {
    return { error: "Debes completar ambos marcadores." };
  }

  const predictedHome = Number(predictedHomeValue);
  const predictedAway = Number(predictedAwayValue);

  if (
    !Number.isInteger(predictedHome) ||
    !Number.isInteger(predictedAway) ||
    predictedHome < 0 ||
    predictedAway < 0
  ) {
    return { error: "Los marcadores deben ser enteros mayores o iguales a 0." };
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

  if (knockout && predictedHome === predictedAway && !qualifiedTeam) {
    return {
      error: "Si pronosticas empate en eliminación, debes indicar quién clasifica.",
    };
  }

  if (!knockout && qualifiedTeam) {
    return {
      error: "No debes indicar clasificado para partidos de fase de grupos.",
    };
  }

  if (
    knockout &&
    predictedHome === predictedAway &&
    qualifiedTeam &&
    qualifiedTeam !== match.homeTeam &&
    qualifiedTeam !== match.awayTeam
  ) {
    return { error: "El clasificado elegido no corresponde a este partido." };
  }

  if (knockout && predictedHome !== predictedAway && qualifiedTeam) {
    return {
      error: "Solo debes elegir clasificado si pronosticas empate en eliminación.",
    };
  }

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
      data: {
        predictedHome,
        predictedAway,
        qualifiedTeam:
          knockout && predictedHome === predictedAway ? qualifiedTeam : null,
      },
    });
  } else {
    await prisma.prediction.create({
      data: {
        userId: session.user.id,
        matchId,
        predictedHome,
        predictedAway,
        qualifiedTeam:
          knockout && predictedHome === predictedAway ? qualifiedTeam : null,
      },
    });
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}/predict`);

  return { success: true };
}