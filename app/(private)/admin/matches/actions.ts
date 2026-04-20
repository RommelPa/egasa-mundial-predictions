"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { Stage } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ActionState = {
  success?: boolean;
  error?: string;
};

export async function createMatch(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const matchNumberValue = formData.get("matchNumber")?.toString();
  const stageValue = formData.get("stage")?.toString();
  const homeTeam = formData.get("homeTeam")?.toString().trim();
  const awayTeam = formData.get("awayTeam")?.toString().trim();
  const kickoffAtValue = formData.get("kickoffAt")?.toString();

  if (
    !matchNumberValue ||
    !stageValue ||
    !homeTeam ||
    !awayTeam ||
    !kickoffAtValue
  ) {
    return { error: "Todos los campos son obligatorios." };
  }

  const matchNumber = Number(matchNumberValue);

  if (!Number.isInteger(matchNumber) || matchNumber <= 0) {
    return { error: "El número de partido debe ser un entero positivo." };
  }

  if (homeTeam.toLowerCase() === awayTeam.toLowerCase()) {
    return { error: "El equipo local y visitante no pueden ser el mismo." };
  }

  if (
    ![
      "GROUP",
      "ROUND_OF_32",
      "ROUND_OF_16",
      "QUARTER_FINAL",
      "SEMI_FINAL",
      "THIRD_PLACE",
      "FINAL",
    ].includes(stageValue)
  ) {
    return { error: "Fase inválida." };
  }

  const kickoffAt = new Date(kickoffAtValue);

  if (Number.isNaN(kickoffAt.getTime())) {
    return { error: "La fecha y hora del partido no es válida." };
  }

  const existingMatch = await prisma.match.findUnique({
    where: { matchNumber },
  });

  if (existingMatch) {
    return { error: "Ese número de partido ya existe." };
  }

  await prisma.match.create({
    data: {
      matchNumber,
      stage: stageValue as Stage,
      homeTeam,
      awayTeam,
      kickoffAt,
    },
  });

  revalidatePath("/admin/matches");

  return { success: true };
}