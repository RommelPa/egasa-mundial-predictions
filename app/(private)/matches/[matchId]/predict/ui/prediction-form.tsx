"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { savePrediction } from "../../actions";

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

function isKnockoutStage(stage: string) {
  return stage !== "GROUP";
}

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

  const formRef = useRef<HTMLFormElement>(null);

  const showQualifiedTeam =
    knockout &&
    predictedHome !== "" &&
    predictedAway !== "" &&
    Number(predictedHome) === Number(predictedAway);

  useEffect(() => {
    if (!showQualifiedTeam) {
      setQualifiedTeam("");
    }
  }, [showQualifiedTeam]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPredictedHome(
        initialPrediction ? String(initialPrediction.predictedHome) : predictedHome
      );
      setPredictedAway(
        initialPrediction ? String(initialPrediction.predictedAway) : predictedAway
      );
    }
  }, [state.success, initialPrediction, predictedHome, predictedAway]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">Tu pronóstico</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Puedes guardar o actualizar tu predicción para este partido.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
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
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
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
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
              placeholder="0"
              required
            />
          </div>
        </div>

        {showQualifiedTeam ? (
          <div>
            <label
              htmlFor="qualifiedTeam"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Clasificado por penales
            </label>
            <select
              id="qualifiedTeam"
              name="qualifiedTeam"
              value={qualifiedTeam}
              onChange={(e) => setQualifiedTeam(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none"
              required
            >
              <option value="">Selecciona un equipo</option>
              <option value={homeTeam}>{homeTeam}</option>
              <option value={awayTeam}>{awayTeam}</option>
            </select>
          </div>
        ) : null}

        {state.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}

        {state.success ? (
          <p className="text-sm text-emerald-400">
            Pronóstico guardado correctamente.
          </p>
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