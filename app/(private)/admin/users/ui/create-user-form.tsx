"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "../actions";

const initialState = {
  success: false,
  error: "",
};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.20),rgba(71,74,74,0.18))] p-6 shadow-2xl shadow-black/20">
      <h2 className="text-2xl font-black text-white">Crear usuario</h2>
      <p className="mt-2 text-sm text-[#D1D4D1]/75">
        Crea manualmente usuarios para participar en el prode.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/45 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            placeholder="antonio"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            Contraseña temporal
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/45 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue="USER"
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/45 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#D1D4D1]">
          <input
            type="checkbox"
            name="active"
            defaultChecked
            className="h-4 w-4 rounded border-white/10 bg-[#474A4A]"
          />
          Usuario activo
        </label>

        {state.error ? (
          <div className="rounded-2xl border border-[#E61D25]/30 bg-[#E61D25]/12 px-4 py-3 text-sm text-[#ffb3b7]">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-2xl border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-4 py-3 text-sm text-[#9be39a]">
            Usuario creado correctamente.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-[#2A398D] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}