"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex rounded-xl border border-white/10 bg-[#474A4A]/28 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#474A4A]/4૦ active:scale-[0.98]"
    >
      Cerrar sesión
    </button>
  );
}