import { ChangePasswordForm } from "./ui/change-password-form";

export default function ChangePasswordPage() {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <span className="inline-flex rounded-full border border-[#2A398D]/30 bg-[#2A398D]/15 px-3 py-1 text-sm text-[#D1D4D1]">
            Configuración
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Cambiar contraseña
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#D1D4D1]/80 sm:text-lg">
            Actualiza tu contraseña para usar una clave personal y dejar de
            depender de la contraseña que te asignaron inicialmente.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.18),rgba(71,74,74,0.18))] p-6 shadow-2xl shadow-black/20">
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}