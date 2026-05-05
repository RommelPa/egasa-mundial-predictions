export const TEAMS = [
  { name: "Alemania", code: "GER", flagCode: "de" },
  { name: "Arabia Saudita", code: "KSA", flagCode: "sa" },
  { name: "Argelia", code: "ALG", flagCode: "dz" },
  { name: "Argentina", code: "ARG", flagCode: "ar" },
  { name: "Australia", code: "AUS", flagCode: "au" },
  { name: "Austria", code: "AUT", flagCode: "at" },
  { name: "Bélgica", code: "BEL", flagCode: "be" },
  { name: "Bosnia y Herzegovina", code: "BIH", flagCode: "ba" },
  { name: "Brasil", code: "BRA", flagCode: "br" },
  { name: "Cabo Verde", code: "CPV", flagCode: "cv" },
  { name: "Canadá", code: "CAN", flagCode: "ca" },
  { name: "Catar", code: "QAT", flagCode: "qa" },
  { name: "Colombia", code: "COL", flagCode: "co" },
  { name: "Corea del Sur", code: "KOR", flagCode: "kr" },
  { name: "Costa de Marfil", code: "CIV", flagCode: "ci" },
  { name: "Croacia", code: "CRO", flagCode: "hr" },
  { name: "Curazao", code: "CUW", flagCode: "cw" },
  { name: "Ecuador", code: "ECU", flagCode: "ec" },
  { name: "Egipto", code: "EGY", flagCode: "eg" },
  { name: "Escocia", code: "SCO", flagCode: "gb" },
  { name: "España", code: "ESP", flagCode: "es" },
  { name: "Estados Unidos", code: "USA", flagCode: "us" },
  { name: "Francia", code: "FRA", flagCode: "fr" },
  { name: "Ghana", code: "GHA", flagCode: "gh" },
  { name: "Haití", code: "HAI", flagCode: "ht" },
  { name: "Inglaterra", code: "ENG", flagCode: "gb" },
  { name: "Irak", code: "IRQ", flagCode: "iq" },
  { name: "Irán", code: "IRN", flagCode: "ir" },
  { name: "Japón", code: "JPN", flagCode: "jp" },
  { name: "Jordania", code: "JOR", flagCode: "jo" },
  { name: "Marruecos", code: "MAR", flagCode: "ma" },
  { name: "México", code: "MEX", flagCode: "mx" },
  { name: "Noruega", code: "NOR", flagCode: "no" },
  { name: "Nueva Zelanda", code: "NZL", flagCode: "nz" },
  { name: "Países Bajos", code: "NED", flagCode: "nl" },
  { name: "Panamá", code: "PAN", flagCode: "pa" },
  { name: "Paraguay", code: "PAR", flagCode: "py" },
  { name: "Portugal", code: "POR", flagCode: "pt" },
  { name: "RD Congo", code: "COD", flagCode: "cd" },
  { name: "República Checa", code: "CZE", flagCode: "cz" },
  { name: "Senegal", code: "SEN", flagCode: "sn" },
  { name: "Sudáfrica", code: "RSA", flagCode: "za" },
  { name: "Suecia", code: "SWE", flagCode: "se" },
  { name: "Suiza", code: "SUI", flagCode: "ch" },
  { name: "Túnez", code: "TUN", flagCode: "tn" },
  { name: "Turquía", code: "TUR", flagCode: "tr" },
  { name: "Uruguay", code: "URU", flagCode: "uy" },
  { name: "Uzbekistán", code: "UZB", flagCode: "uz" },
] as const;

export type Team = (typeof TEAMS)[number];
export type TeamName = Team["name"];

export const TEAM_NAMES = TEAMS.map((team) => team.name);

export function isValidTeamName(value: string): value is TeamName {
  return TEAM_NAMES.includes(value as TeamName);
}

export function getTeamByName(name: string) {
  return TEAMS.find((team) => team.name === name) ?? null;
}

export function searchTeams(query: string, excludeName?: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return TEAMS.filter((team) => {
    if (excludeName && team.name === excludeName) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      team.name.toLowerCase().includes(normalizedQuery) ||
      team.code.toLowerCase().includes(normalizedQuery)
    );
  });
}