"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type ActionState = {
  success?: boolean;
  error?: string;
};

const ALLOWED_ROLES = ["ADMIN", "USER"] as const;
type RoleValue = (typeof ALLOWED_ROLES)[number];

export async function createUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();
  const roleValue = formData.get("role")?.toString();

  if (!username || !password || !roleValue) {
    return { error: "Todos los campos son obligatorios." };
  }

  if (!ALLOWED_ROLES.includes(roleValue as RoleValue)) {
    return { error: "Rol inválido." };
  }

  if (username.length < 3) {
    return { error: "El usuario debe tener al menos 3 caracteres." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
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
      role: roleValue as RoleValue,
      active: true,
    },
  });

  revalidatePath("/admin/users");

  return { success: true };
}