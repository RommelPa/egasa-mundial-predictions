"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export type ChangePasswordActionState = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function changePassword(
  _prevState: ChangePasswordActionState,
  formData: FormData
): Promise<ChangePasswordActionState> {
  const session = await requireAuth();

  const currentPassword = formData.get("currentPassword")?.toString().trim() ?? "";
  const newPassword = formData.get("newPassword")?.toString().trim() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString().trim() ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Todos los campos son obligatorios." };
  }

  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "La nueva contraseña y su confirmación no coinciden." };
  }

  if (currentPassword === newPassword) {
    return { error: "La nueva contraseña debe ser diferente a la actual." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return { error: "No se encontró el usuario autenticado." };
  }

  const currentPasswordIsValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!currentPasswordIsValid) {
    return { error: "La contraseña actual es incorrecta." };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return {
    success: true,
    message: "Contraseña actualizada correctamente.",
  };
}