"use client";

import { useActionState, useEffect, useRef } from "react";
import { createMatch } from "../actions";

const initialState = {
  success: false,
  error: "",
};

export function CreateMatchForm() {
  const [state, formAction, pending] = useActionState(
    createMatch,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">Crear partido</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Registra manualmente partidos del Mundial 2026.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="matchNumber"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Número de partido
          </label>
          <input
            id="matchNumber"
            name="matchNumber"
            type="number"
            min="1"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
            placeholder="1"
            required
          />
        </div>

        <div>
          <label
            htmlFor="stage"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Fase
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue="GROUP"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
          >
            <option value="GROUP">Grupos</option>
            <option value="ROUND_OF_32">Dieciseisavos</option>
            <option value="ROUND_OF_16">Octavos</option>
            <option value="QUARTER_FINAL">Cuartos</option>
            <option value="SEMI_FINAL">Semifinal</option>
            <option value="THIRD_PLACE">Tercer puesto</option>
            <option value="FINAL">Final</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="homeTeam"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Equipo local
          </label>
          <input
            id="homeTeam"
            name="homeTeam"
            type="text"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
            placeholder="Brasil"
            required
          />
        </div>

        <div>
          <label
            htmlFor="awayTeam"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Equipo visitante
          </label>
          <input
            id="awayTeam"
            name="awayTeam"
            type="text"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
            placeholder="Alemania"
            required
          />
        </div>

        <div>
          <label
            htmlFor="kickoffAt"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Fecha y hora de inicio
          </label>
          <input
            id="kickoffAt"
            name="kickoffAt"
            type="datetime-local"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
            required
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}

        {state.success ? (
          <p className="text-sm text-emerald-400">
            Partido creado correctamente.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creando..." : "Crear partido"}
        </button>
      </form>
    </div>
  );
}