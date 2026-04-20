import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          Sesión activa
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight">
          Bienvenido, {session.user.username}
        </h1>

        <p className="mt-4 text-zinc-400">
          Has iniciado sesión correctamente. Tu rol actual es{" "}
          <span className="font-semibold text-zinc-200">
            {session.user.role}
          </span>
          .
        </p>
      </div>
    </main>
  );
}