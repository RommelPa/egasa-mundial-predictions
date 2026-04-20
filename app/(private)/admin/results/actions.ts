"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

type ActionState = {
  success?: boolean;
  error?: string;
};

function isKnockoutStage(stage: string) {
  return stage !== "GROUP";
}

export async function saveMatchResult(
  matchId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const resultHomeValue = formData.get("resultHome")?.toString();
  const resultAwayValue = formData.get("resultAway")?.toString();
  const qualifiedTeam = formData.get("qualifiedTeam")?.toString().trim() || null;

  if (!resultHomeValue || !resultAwayValue) {
    return { error: "Debes completar ambos marcadores del resultado." };
  }

  const resultHome = Number(resultHomeValue);
  const resultAway = Number(resultAwayValue);

  if (
    !Number.isInteger(resultHome) ||
    !Number.isInteger(resultAway) ||
    resultHome < 0 ||
    resultAway < 0
  ) {
    return { error: "Los resultados deben ser enteros mayores o iguales a 0." };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    return { error: "El partido no existe." };
  }

  const knockout = isKnockoutStage(match.stage);

  if (!knockout && qualifiedTeam) {
    return {
      error: "No debes indicar clasificado para partidos de fase de grupos.",
    };
  }

  if (knockout && resultHome === resultAway && !qualifiedTeam) {
    return {
      error: "Si el resultado termina en empate en eliminación, debes indicar quién clasifica.",
    };
  }

  if (
    knockout &&
    resultHome === resultAway &&
    qualifiedTeam &&
    qualifiedTeam !== match.homeTeam &&
    qualifiedTeam !== match.awayTeam
  ) {
    return { error: "El clasificado elegido no corresponde a este partido." };
  }

  if (knockout && resultHome !== resultAway && qualifiedTeam) {
    return {
      error: "Solo debes indicar clasificado si el resultado termina en empate.",
    };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      resultHome,
      resultAway,
      qualifiedTeam:
        knockout && resultHome === resultAway ? qualifiedTeam : null,
    },
  });

  revalidatePath("/admin/results");
  revalidatePath("/admin/matches");
  revalidatePath("/matches");

  return { success: true };
}