"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ActionState = {
  success?: boolean;
  error?: string;
};

export async function createUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const username = formData.get("username")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const roleValue = formData.get("role")?.toString();
  const activeValue = formData.get("active")?.toString();

  if (!username || !password || !roleValue) {
    return { error: "Todos los campos obligatorios deben completarse." };
  }

  if (username.length < 3) {
    return { error: "El usuario debe tener al menos 3 caracteres." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (!["ADMIN", "USER"].includes(roleValue)) {
    return { error: "Rol inválido." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: "Ese nombre de usuario ya existe." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: roleValue as Role,
      active: activeValue === "on",
    },
  });

  revalidatePath("/admin/users");

  return { success: true };
}