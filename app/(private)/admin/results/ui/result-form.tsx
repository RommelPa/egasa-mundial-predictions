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
    <form
      action={formAction}
      className="space-y-5 rounded-[24px] border border-white/10 bg-[#474A4A]/16 p-5"
    >
      <div>
        <h3 className="text-lg font-bold text-white">
          {homeTeam} vs {awayTeam}
        </h3>
        <p className="mt-1 text-sm text-[#D1D4D1]/70">{formatStage(stage)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`resultHome-${matchId}`}
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
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
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label
            htmlFor={`resultAway-${matchId}`}
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
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
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            placeholder="0"
            required
          />
        </div>
      </div>

      {knockout ? (
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <label
            htmlFor={`qualifiedTeam-${matchId}`}
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            {UI_TEXT.labels.qualifiedTeam}
          </label>
          <select
            id={`qualifiedTeam-${matchId}`}
            name="qualifiedTeam"
            value={qualifiedTeam}
            onChange={(e) => setQualifiedTeam(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            required
          >
            <option value="">Selecciona un equipo</option>
            <option value={homeTeam}>{homeTeam}</option>
            <option value={awayTeam}>{awayTeam}</option>
          </select>
          <p className="mt-2 text-xs text-[#D1D4D1]/65">
            {UI_TEXT.helper.knockoutQualifiedTeam}
          </p>
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-2xl border border-[#E61D25]/30 bg-[#E61D25]/12 px-4 py-3 text-sm text-[#ffb3b7]">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-[#3CAC3B]/30 bg-[#3CAC3B]/12 px-4 py-3 text-sm text-[#9be39a]">
          Resultado guardado correctamente.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[#2A398D] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar resultado"}
      </button>
    </form>
  );
}