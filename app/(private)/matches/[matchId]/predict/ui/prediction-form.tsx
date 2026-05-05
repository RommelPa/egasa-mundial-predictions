"use client";

import { useActionState, useMemo, useState } from "react";
import { savePrediction } from "../../actions";
import { isKnockoutStage } from "@/lib/domain/matches";
import { UI_TEXT } from "@/lib/ui/text";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type PredictionFormProps = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  initialPrediction: {
    predictedHome: number;
    predictedAway: number;
    qualifiedTeam: string | null;
  } | null;
};

const initialState = {
  success: false,
  error: "",
};

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  stage,
  initialPrediction,
}: PredictionFormProps) {
  const knockout = useMemo(() => isKnockoutStage(stage), [stage]);

  const [predictedHome, setPredictedHome] = useState(
    initialPrediction ? String(initialPrediction.predictedHome) : ""
  );
  const [predictedAway, setPredictedAway] = useState(
    initialPrediction ? String(initialPrediction.predictedAway) : ""
  );
  const [qualifiedTeam, setQualifiedTeam] = useState(
    initialPrediction?.qualifiedTeam ?? ""
  );

  const [state, formAction, pending] = useActionState(
    savePrediction.bind(null, matchId),
    initialState
  );

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/20">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Tu pronóstico</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Define tu marcador antes del inicio. Si el partido es de eliminación
          directa y termina empatado, también debes indicar qué equipo clasifica.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="text-white">
              <TeamNameWithFlag
                teamName={homeTeam}
                className="text-lg font-bold"
                flagClassName="h-5 w-7"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="predictedHome"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Goles local
              </label>
              <input
                id="predictedHome"
                name="predictedHome"
                type="number"
                min="0"
                value={predictedHome}
                onChange={(e) => setPredictedHome(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-4 text-center text-3xl font-black text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-zinc-400">
              VS
            </span>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="text-white">
              <TeamNameWithFlag
                teamName={awayTeam}
                className="text-lg font-bold"
                flagClassName="h-5 w-7"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="predictedAway"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Goles visitante
              </label>
              <input
                id="predictedAway"
                name="predictedAway"
                type="number"
                min="0"
                value={predictedAway}
                onChange={(e) => setPredictedAway(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-4 text-center text-3xl font-black text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        {knockout ? (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <label
              htmlFor="qualifiedTeam"
              className="mb-2 block text-sm font-semibold text-zinc-200"
            >
              {UI_TEXT.labels.qualifiedTeam}
            </label>
            <select
              id="qualifiedTeam"
              name="qualifiedTeam"
              value={qualifiedTeam}
              onChange={(e) => setQualifiedTeam(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-4 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
              required
            >
              <option value="">Selecciona un equipo</option>
              <option value={homeTeam}>{homeTeam}</option>
              <option value={awayTeam}>{awayTeam}</option>
            </select>
            <p className="mt-3 text-xs leading-5 text-zinc-400">
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
            Pronóstico guardado correctamente.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#2A398D] px-5 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar pronóstico"}
        </button>
      </form>
    </div>
  );
}