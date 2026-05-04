"use client";

import { useActionState, useMemo, useState } from "react";
import { savePrediction } from "../../actions";
import { isKnockoutStage } from "@/lib/domain/matches";
import { UI_TEXT } from "@/lib/ui/text";

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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
      <h2 className="text-xl font-semibold">Tu pronóstico</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Puedes guardar o actualizar tu predicción para este partido.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="predictedHome"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              {homeTeam}
            </label>
            <input
              id="predictedHome"
              name="predictedHome"
              type="number"
              min="0"
              value={predictedHome}
              onChange={(e) => setPredictedHome(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label
              htmlFor="predictedAway"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              {awayTeam}
            </label>
            <input
              id="predictedAway"
              name="predictedAway"
              type="number"
              min="0"
              value={predictedAway}
              onChange={(e) => setPredictedAway(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
              placeholder="0"
              required
            />
          </div>
        </div>

        {knockout ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <label
              htmlFor="qualifiedTeam"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              {UI_TEXT.labels.qualifiedTeam}
            </label>
            <select
              id="qualifiedTeam"
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
            Pronóstico guardado correctamente.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar pronóstico"}
        </button>
      </form>
    </div>
  );
}