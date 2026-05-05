"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createMatch,
  type CreateMatchActionState,
} from "../actions";
import { TeamCombobox } from "@/components/ui/team-combobox";

const initialState: CreateMatchActionState = {
  success: false,
  error: "",
  message: "",
  nextMatchNumber: 1,
};

const GROUP_OPTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

type CreateMatchFormProps = {
  nextMatchNumber: number;
};

export function CreateMatchForm({ nextMatchNumber }: CreateMatchFormProps) {
  const [state, formAction, pending] = useActionState(createMatch, {
    ...initialState,
    nextMatchNumber,
  });

  const formRef = useRef<HTMLFormElement>(null);

  const [stage, setStage] = useState("GROUP");
  const [groupName, setGroupName] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchNumber, setMatchNumber] = useState(String(nextMatchNumber));
  const [submitMode, setSubmitMode] = useState<"save" | "saveAndContinue">("save");

  const isGroupStage = useMemo(() => stage === "GROUP", [stage]);

  useEffect(() => {
    setMatchNumber(String(nextMatchNumber));
  }, [nextMatchNumber]);

  useEffect(() => {
    if (!isGroupStage) {
      setGroupName("");
    }
  }, [isGroupStage]);

  useEffect(() => {
    if (!state.success) return;

    const nextNumber = state.nextMatchNumber ?? Number(matchNumber) + 1;

    if (state.keepEditing) {
      setMatchNumber(String(nextNumber));
      setHomeTeam("");
      setAwayTeam("");

      const kickoffInput = formRef.current?.elements.namedItem(
        "kickoffAt"
      ) as HTMLInputElement | null;

      if (kickoffInput) {
        kickoffInput.value = "";
      }

      return;
    }

    formRef.current?.reset();
    setStage("GROUP");
    setGroupName("");
    setHomeTeam("");
    setAwayTeam("");
    setMatchNumber(String(nextNumber));
  }, [state.success, state.keepEditing, state.nextMatchNumber, matchNumber]);

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,57,141,0.20),rgba(71,74,74,0.18))] p-6 shadow-2xl shadow-black/20">
      <h2 className="text-2xl font-black text-white">Crear partido</h2>
      <p className="mt-2 text-sm text-[#D1D4D1]/75">
        Registra manualmente partidos del Mundial 2026.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="submitMode" value={submitMode} />

        <div>
          <label
            htmlFor="matchNumber"
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            Número de partido
          </label>
          <input
            id="matchNumber"
            name="matchNumber"
            type="number"
            min="1"
            value={matchNumber}
            onChange={(e) => setMatchNumber(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            placeholder="1"
            required
          />
          <p className="mt-2 text-xs text-[#D1D4D1]/65">
            Sugerido automáticamente según el último partido registrado.
          </p>
        </div>

        <div>
          <label
            htmlFor="stage"
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            Fase
          </label>
          <select
            id="stage"
            name="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
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

        {isGroupStage ? (
          <div>
            <label
              htmlFor="groupName"
              className="mb-2 block text-sm font-medium text-[#D1D4D1]"
            >
              Grupo
            </label>
            <select
              id="groupName"
              name="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
              required
            >
              <option value="">Selecciona un grupo</option>
              {GROUP_OPTIONS.map((group) => (
                <option key={group} value={group}>
                  Grupo {group}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#D1D4D1]/65">
              Este valor se mantiene si eliges guardar y seguir cargando.
            </p>
          </div>
        ) : null}

        <TeamCombobox
          name="homeTeam"
          label="Equipo local"
          value={homeTeam}
          onChange={setHomeTeam}
          excludeValue={awayTeam}
          placeholder="Busca el equipo local"
          required
        />

        <TeamCombobox
          name="awayTeam"
          label="Equipo visitante"
          value={awayTeam}
          onChange={setAwayTeam}
          excludeValue={homeTeam}
          placeholder="Busca el equipo visitante"
          required
        />

        <div>
          <label
            htmlFor="kickoffAt"
            className="mb-2 block text-sm font-medium text-[#D1D4D1]"
          >
            Fecha y hora de inicio
          </label>
          <input
            id="kickoffAt"
            name="kickoffAt"
            type="datetime-local"
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15"
            required
          />
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

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={pending}
            onClick={() => setSubmitMode("save")}
            className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/28 px-4 py-3 text-sm font-bold text-white transition hover:bg-[#474A4A]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && submitMode === "save" ? "Guardando..." : "Guardar"}
          </button>

          <button
            type="submit"
            disabled={pending}
            onClick={() => setSubmitMode("saveAndContinue")}
            className="w-full rounded-2xl bg-[#2A398D] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#24317c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && submitMode === "saveAndContinue"
              ? "Guardando..."
              : "Guardar y crear otro"}
          </button>
        </div>
      </form>
    </div>
  );
}