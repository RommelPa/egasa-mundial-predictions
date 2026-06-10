"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  changePassword,
  type ChangePasswordActionState,
} from "../actions";

const initialState: ChangePasswordActionState = {
  success: false,
  error: "",
  message: "",
};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-2 block text-sm font-medium text-[#D1D4D1]"
        >
          Contraseña actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
          placeholder="••••••••"
          required
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="mb-2 block text-sm font-medium text-[#D1D4D1]"
        >
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
          placeholder="Mínimo 8 caracteres"
          required
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-[#D1D4D1]"
        >
          Confirmar nueva contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
          placeholder="Repite la nueva contraseña"
          required
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="text-xs leading-5 text-[#D1D4D1]/70">
          Usa una contraseña que puedas recordar, pero que no sea obvia. Evita
          nombres, años, “123456” o patrones fáciles.
        </p>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-[#E61D25]/30 bg-[#E61D25]/12 px-4 py-3 text-sm text-[#ffb3b7]">
          {state.error}
        </div>
      ) : null}

      {state.success && state.message ? (
        <div className="rounded-2xl border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-4 py-3 text-sm text-[#9be39a]">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[#2A398D] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Actualizando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}