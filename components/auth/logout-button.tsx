"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-medium text-white transition hover:bg-white/10 hover:text-zinc-100 active:scale-[0.98]"
    >
      Cerrar sesión
    </button>
  );
}