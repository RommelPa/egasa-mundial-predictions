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
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-[#2A398D]/30 bg-[#2A398D]/15 px-3 py-1 text-sm text-[#D1D4D1]">
            Panel admin
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            {UI_TEXT.labels.users}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#D1D4D1]/80 sm:text-lg">
            Crea y administra los usuarios que participarán en el prode.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <CreateUserForm />

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.18),rgba(71,74,74,0.20))] p-6 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-black text-white">Usuarios registrados</h2>
            <p className="mt-2 text-sm text-[#D1D4D1]/75">
              Lista actual de usuarios disponibles en la plataforma.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-[#D1D4D1]/65">
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
                      className="border-b border-white/5 text-[#D1D4D1] transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{user.username}</div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            user.role === "ADMIN"
                              ? "border border-[#2A398D]/35 bg-[#2A398D]/20 text-[#D1D4D1]"
                              : "border border-white/10 bg-[#474A4A]/40 text-[#D1D4D1]"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            user.active
                              ? "border border-[#3CAC3B]/30 bg-[#3CAC3B]/15 text-[#3CAC3B]"
                              : "border border-[#474A4A]/50 bg-[#474A4A]/35 text-[#D1D4D1]/80"
                          }`}
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-10 text-center text-[#D1D4D1]/70"
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