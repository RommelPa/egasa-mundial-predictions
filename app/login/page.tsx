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
    <main className="min-h-screen text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_480px]">
        <div className="max-w-2xl">
          <span className="mb-5 inline-flex w-fit rounded-full border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-3 py-1 text-sm text-[#3CAC3B]">
            Acceso privado
          </span>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Ingresa al prode del Mundial 2026
          </h1>

          <p className="mt-6 text-base leading-7 text-[#D1D4D1]/88 sm:text-lg">
            Entra a la plataforma para pronosticar, revisar tu rendimiento y
            competir por los primeros puestos.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#D1D4D1]">
            <div className="rounded-2xl border border-white/10 bg-[#474A4A]/20 px-4 py-3 shadow-lg shadow-black/10">
              Pronósticos antes del inicio
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#474A4A]/20 px-4 py-3 shadow-lg shadow-black/10">
              Puntaje automático
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#474A4A]/20 px-4 py-3 shadow-lg shadow-black/10">
              Ranking global
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-sm text-[#D1D4D1]/70 transition hover:text-white"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.20),rgba(71,74,74,0.18))] p-7 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <h2 className="text-2xl font-black">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-[#D1D4D1]/72">
              Usa tus credenciales para entrar a la plataforma.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}