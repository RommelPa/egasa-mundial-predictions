import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./ui/login-form";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_480px]">
        <div className="max-w-2xl">
          <span className="mb-5 inline-flex w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
            Acceso privado
          </span>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ingresa al prode del Mundial 2026
          </h1>

          <p className="mt-6 text-base leading-7 text-zinc-300 sm:text-lg">
            Accede con tu usuario y contraseña para registrar pronósticos,
            revisar tu puntaje y seguir el ranking global de participantes.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-zinc-400">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              Pronósticos antes del inicio
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              Puntaje automático
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              Ranking y seguimiento
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/20">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Usa tus credenciales para entrar a la plataforma.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}