"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const error = searchParams.get("error");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    await signIn("credentials", {
      username,
      password,
      callbackUrl: "/dashboard",
    });

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-[#D1D4D1]"
        >
          Usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/38 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15 placeholder:text-[#D1D4D1]/40"
          placeholder="admin"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[#D1D4D1]"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/38 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15 placeholder:text-[#D1D4D1]/40"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#E61D25]/30 bg-[#E61D25]/12 px-4 py-3 text-sm text-[#ffb3b7]">
          Credenciales inválidas. Verifica tu usuario y contraseña.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[#2A398D] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}