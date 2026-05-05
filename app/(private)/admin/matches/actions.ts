"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { parseDatetimeLocal } from "@/lib/format/date";
import { isValidTeamName } from "@/lib/domain/teams";

export type CreateMatchActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  createdMatchNumber?: number;
  nextMatchNumber?: number;
  keepEditing?: boolean;
};

const ALLOWED_STAGES = [
  "GROUP",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
] as const;

const ALLOWED_GROUPS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

type StageValue = (typeof ALLOWED_STAGES)[number];
type GroupValue = (typeof ALLOWED_GROUPS)[number];

export async function createMatch(
  _prevState: CreateMatchActionState,
  formData: FormData
): Promise<CreateMatchActionState> {
  await requireAdmin();

  const matchNumberValue = formData.get("matchNumber")?.toString();
  const stageValue = formData.get("stage")?.toString();
  const groupNameValue =
    formData.get("groupName")?.toString().trim().toUpperCase() || "";
  const homeTeam = formData.get("homeTeam")?.toString().trim();
  const awayTeam = formData.get("awayTeam")?.toString().trim();
  const kickoffAtValue = formData.get("kickoffAt")?.toString();
  const submitMode = formData.get("submitMode")?.toString() ?? "save";
  const keepEditing = submitMode === "saveAndContinue";

  if (
    !matchNumberValue ||
    !stageValue ||
    !homeTeam ||
    !awayTeam ||
    !kickoffAtValue
  ) {
    return { error: "Todos los campos obligatorios deben completarse." };
  }

  const matchNumber = Number(matchNumberValue);

  if (!Number.isInteger(matchNumber) || matchNumber <= 0) {
    return { error: "El número de partido debe ser un entero positivo." };
  }

  if (!ALLOWED_STAGES.includes(stageValue as StageValue)) {
    return { error: "Fase inválida." };
  }

  if (!isValidTeamName(homeTeam) || !isValidTeamName(awayTeam)) {
    return { error: "Debes seleccionar equipos válidos del catálogo." };
  }

  if (homeTeam === awayTeam) {
    return { error: "El equipo local y visitante no pueden ser el mismo." };
  }

  const isGroupStage = stageValue === "GROUP";

  if (isGroupStage && !groupNameValue) {
    return { error: "Debes indicar el grupo para partidos de fase de grupos." };
  }

  if (isGroupStage && !ALLOWED_GROUPS.includes(groupNameValue as GroupValue)) {
    return { error: "El grupo debe ser una letra válida entre A y L." };
  }

  if (!isGroupStage && groupNameValue) {
    return { error: "Solo debes indicar grupo para partidos de fase de grupos." };
  }

  const kickoffAt = parseDatetimeLocal(kickoffAtValue);

  if (!kickoffAt) {
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
      stage: stageValue as StageValue,
      groupName: isGroupStage ? (groupNameValue as GroupValue) : null,
      homeTeam,
      awayTeam,
      kickoffAt,
    },
  });

  const latestMatch = await prisma.match.findFirst({
    orderBy: { matchNumber: "desc" },
    select: { matchNumber: true },
  });

  const nextMatchNumber = latestMatch ? latestMatch.matchNumber + 1 : matchNumber + 1;

  revalidatePath("/admin/matches");
  revalidatePath("/matches");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: keepEditing
      ? `Partido #${matchNumber} creado. Puedes seguir cargando.`
      : `Partido #${matchNumber} creado correctamente.`,
    createdMatchNumber: matchNumber,
    nextMatchNumber,
    keepEditing,
  };
}