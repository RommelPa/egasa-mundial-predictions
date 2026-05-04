"use client";

import { useActionState, useMemo, useState } from "react";
import { saveMatchResult } from "../actions";
import { formatStage, isKnockoutStage } from "@/lib/domain/matches";
import { UI_TEXT } from "@/lib/ui/text";

type ResultFormProps = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  initialResult: {
    resultHome: number | null;
    resultAway: number | null;
    qualifiedTeam: string | null;
  };
};

const initialState = {
  success: false,
  error: "",
};

export function ResultForm({
  matchId,
  homeTeam,
  awayTeam,
  stage,
  initialResult,
}: ResultFormProps) {
  const knockout = useMemo(() => isKnockoutStage(stage), [stage]);

  const [resultHome, setResultHome] = useState(
    initialResult.resultHome !== null ? String(initialResult.resultHome) : ""
  );
  const [resultAway, setResultAway] = useState(
    initialResult.resultAway !== null ? String(initialResult.resultAway) : ""
  );
  const [qualifiedTeam, setQualifiedTeam] = useState(
    initialResult.qualifiedTeam ?? ""
  );

  const [state, formAction, pending] = useActionState(
    saveMatchResult.bind(null, matchId),
    initialState
  );

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div>
        <h3 className="text-lg font-semibold">
          {homeTeam} vs {awayTeam}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">{formatStage(stage)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`resultHome-${matchId}`}
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            {homeTeam}
          </label>
          <input
            id={`resultHome-${matchId}`}
            name="resultHome"
            type="number"
            min="0"
            value={resultHome}
            onChange={(e) => setResultHome(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label
            htmlFor={`resultAway-${matchId}`}
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            {awayTeam}
          </label>
          <input
            id={`resultAway-${matchId}`}
            name="resultAway"
            type="number"
            min="0"
            value={resultAway}
            onChange={(e) => setResultAway(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            placeholder="0"
            required
          />
        </div>
      </div>

      {knockout ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <label
            htmlFor={`qualifiedTeam-${matchId}`}
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            {UI_TEXT.labels.qualifiedTeam}
          </label>
          <select
            id={`qualifiedTeam-${matchId}`}
            name="qualifiedTeam"
            value={qualifiedTeam}
            onChange={(e) => setQualifiedTeam(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
            required
          >
            <option value="">Selecciona un equipo</option>
            <option value={homeTeam}>{homeTeam}</option>
            <option value={awayTeam}>{awayTeam}</option>
          </select>
          <p className="mt-2 text-xs text-zinc-400">
            {UI_TEXT.helper.knockoutQualifiedTeam}
          </p>
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Resultado guardado correctamente.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar resultado"}
      </button>
    </form>
  );
}