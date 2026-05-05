import { getTeamByName } from "@/lib/domain/teams";

type TeamNameWithFlagProps = {
  teamName: string;
  className?: string;
  flagClassName?: string;
  textClassName?: string;
};

export function TeamNameWithFlag({
  teamName,
  className = "",
  flagClassName = "",
  textClassName = "",
}: TeamNameWithFlagProps) {
  const team = getTeamByName(teamName);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {team ? (
        <span
          className={`fi fi-${team.flagCode} rounded-sm shadow-sm ${flagClassName}`}
          aria-hidden="true"
        />
      ) : (
        <span
          className={`inline-block h-3.5 w-5 rounded-sm bg-zinc-700 ${flagClassName}`}
          aria-hidden="true"
        />
      )}

      <span className={textClassName}>{teamName}</span>
    </span>
  );
}