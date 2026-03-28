export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <span className="mb-4 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
          V1 en construcción
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          EGASA Prode Mundial 2026
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          Plataforma privada para registrar predicciones de partidos del Mundial
          2026, calcular puntos automáticamente y mostrar el ranking en tiempo
          real.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-semibold">Usuarios</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Acceso con usuario y contraseña, administrado manualmente.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-semibold">Predicciones</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Pronósticos editables hasta antes del inicio de cada partido.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-semibold">Ranking</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Tabla de posiciones en tiempo real con desempates definidos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}