import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminUsername = "admin";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "Falta ADMIN_SEED_PASSWORD en el entorno para ejecutar el seed."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    console.log(`El usuario '${adminUsername}' ya existe. No se creó de nuevo.`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("Admin creado correctamente:", {
    id: admin.id,
    username: admin.username,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });