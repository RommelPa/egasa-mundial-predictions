import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateUserForm } from "./ui/create-user-form";
import { UI_TEXT } from "@/lib/ui/text";

type UserRow = {
  id: string;
  username: string;
  role: string;
  active: boolean;
  createdAt: Date;
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const users: UserRow[] = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }, { username: "asc" }],
    select: {
      id: true,
      username: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
            Panel admin
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {UI_TEXT.labels.users}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Crea y revisa los usuarios que participarán en el prode.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <CreateUserForm />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Usuarios registrados</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Lista actual de usuarios disponibles en el sistema.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: UserRow) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 text-zinc-200"
                    >
                      <td className="px-4 py-3">{user.username}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3">
                        {user.active ? "Activo" : "Inactivo"}
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-zinc-400"
                      >
                        Aún no hay usuarios registrados.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}