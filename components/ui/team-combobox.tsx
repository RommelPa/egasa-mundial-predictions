"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchTeams } from "@/lib/domain/teams";
import { TeamNameWithFlag } from "@/components/teams/team-name-with-flag";

type TeamComboboxProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeValue?: string;
  required?: boolean;
};

export function TeamCombobox({
  name,
  label,
  value,
  onChange,
  placeholder = "Buscar equipo",
  excludeValue,
  required = false,
}: TeamComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value]);

  const results = useMemo(() => {
    return searchTeams(query, excludeValue);
  }, [query, excludeValue]);

  return (
    <div ref={containerRef}>
      <label
        htmlFor={`${name}-search`}
        className="mb-2 block text-sm font-medium text-[#D1D4D1]"
      >
        {label}
      </label>

      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        value={value}
        required={required}
      />

      <div className="relative">
        <input
          id={`${name}-search`}
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) {
              onChange("");
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-2xl border border-white/10 bg-[#474A4A]/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3CAC3B]/50 focus:ring-2 focus:ring-[#3CAC3B]/15 placeholder:text-[#D1D4D1]/40"
        />

        {open ? (
          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-[24px] border border-white/10 bg-[#11161e] p-2 shadow-2xl shadow-black/40">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((team) => (
                  <button
                    key={team.code}
                    type="button"
                    onClick={() => {
                      onChange(team.name);
                      setQuery(team.name);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#D1D4D1] transition hover:bg-[#2A398D]/14"
                  >
                    <TeamNameWithFlag teamName={team.name} />
                    <span className="text-xs text-[#D1D4D1]/45">{team.code}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl px-3 py-3 text-sm text-[#D1D4D1]/70">
                No se encontraron equipos.
              </div>
            )}
          </div>
        ) : null}
      </div>

      {value ? (
        <p className="mt-2 text-xs text-[#D1D4D1]/65">
          Seleccionado: <span className="text-white">{value}</span>
        </p>
      ) : null}
    </div>
  );
}