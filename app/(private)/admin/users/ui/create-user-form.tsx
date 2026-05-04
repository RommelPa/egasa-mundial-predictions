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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
      <h2 className="text-xl font-semibold">Crear usuario</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Crea manualmente usuarios para participar en el prode.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            placeholder="antonio"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Contraseña temporal
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue="USER"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="active"
            defaultChecked
            className="h-4 w-4 rounded border-white/10 bg-zinc-900"
          />
          Usuario activo
        </label>

        {state.error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Usuario creado correctamente.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}