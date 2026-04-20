import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateUserForm } from "./ui/create-user-form";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Usuarios</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Administra los usuarios que podrán ingresar y participar en el prode.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <CreateUserForm />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Usuarios registrados</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Lista actual de usuarios en el sistema.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Activo</th>
                    <th className="px-4 py-3 font-medium">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 text-zinc-200"
                    >
                      <td className="px-4 py-3">{user.username}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3">
                        {user.active ? "Sí" : "No"}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(user.createdAt).toLocaleString("es-PE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}