import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
        <div className="max-w-4xl">
          <span className="mb-5 inline-flex w-fit rounded-full border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-3 py-1 text-sm text-[#3CAC3B]">
            Plataforma privada EGASA
          </span>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            EGASA Prode Mundial 2026
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-7 text-[#D1D4D1]/88 sm:text-lg">
            Compite, pronostica y sigue en tiempo real el rendimiento de todos
            los participantes con una experiencia más cercana a un fantasy game
            que a un panel interno.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex rounded-2xl bg-[#2A398D] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317b]"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex rounded-2xl border border-white/10 bg-[#474A4A]/24 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#474A4A]/36"
            >
              Ir al dashboard
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.16),rgba(255,255,255,0.03))] p-5 shadow-2xl shadow-black/20">
            <div className="mb-3 inline-flex rounded-lg border border-[#2A398D]/30 bg-[#2A398D]/15 px-2.5 py-1 text-xs font-semibold text-[#D1D4D1]">
              Acceso
            </div>
            <h2 className="text-lg font-bold">Acceso privado</h2>
            <p className="mt-2 text-sm leading-6 text-[#D1D4D1]/72">
              Ingreso con usuario y contraseña, con administración separada para
              operación y juego.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(230,29,37,0.16),rgba(255,255,255,0.03))] p-5 shadow-2xl shadow-black/20">
            <div className="mb-3 inline-flex rounded-lg border border-[#E61D25]/30 bg-[#E61D25]/12 px-2.5 py-1 text-xs font-semibold text-[#ffd2d4]">
              Juego
            </div>
            <h2 className="text-lg font-bold">Pronósticos</h2>
            <p className="mt-2 text-sm leading-6 text-[#D1D4D1]/72">
              Registra y ajusta tus predicciones antes del inicio de cada
              partido.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.16),rgba(255,255,255,0.03))] p-5 shadow-2xl shadow-black/20">
            <div className="mb-3 inline-flex rounded-lg border border-[#2A398D]/30 bg-[#2A398D]/15 px-2.5 py-1 text-xs font-semibold text-[#D1D4D1]">
              Motor
            </div>
            <h2 className="text-lg font-bold">Puntaje automático</h2>
            <p className="mt-2 text-sm leading-6 text-[#D1D4D1]/72">
              El sistema evalúa marcador, resultado y clasificados según reglas
              de grupos y eliminación.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(60,172,59,0.16),rgba(255,255,255,0.03))] p-5 shadow-2xl shadow-black/20">
            <div className="mb-3 inline-flex rounded-lg border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-2.5 py-1 text-xs font-semibold text-[#9be39a]">
              Competencia
            </div>
            <h2 className="text-lg font-bold">Ranking y seguimiento</h2>
            <p className="mt-2 text-sm leading-6 text-[#D1D4D1]/72">
              Consulta posiciones, detalle de puntos y comparación de
              pronósticos tras cada cierre.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}