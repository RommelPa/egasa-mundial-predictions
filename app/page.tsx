import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <span className="mb-4 inline-flex w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          Plataforma privada EGASA
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          EGASA Prode Mundial 2026
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
          Plataforma interna para registrar pronósticos del Mundial 2026,
          calcular puntajes automáticamente, revisar resultados y seguir el
          ranking global de participantes.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ir al dashboard
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Acceso privado</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Ingreso con usuario y contraseña, con gestión administrada
              manualmente.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Pronósticos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Cada usuario puede registrar y editar su pronóstico hasta antes
              del inicio de cada partido.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Puntaje automático</h2>
            <p className="mt-2 text-sm text-zinc-400">
              El sistema evalúa resultados, clasificados y aplica reglas de
              puntuación de forma automática.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Ranking y seguimiento</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Consulta posiciones, detalle de puntos y comparación de
              predicciones después del cierre de cada partido.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}