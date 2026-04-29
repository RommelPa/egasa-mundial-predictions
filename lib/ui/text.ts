export const UI_TEXT = {
  appName: "EGASA Prode Mundial 2026",

  labels: {
    ranking: "Ranking",
    matches: "Partidos",
    dashboard: "Dashboard",
    home: "Inicio",
    myPredictions: "Mis pronósticos",
    users: "Usuarios",
    adminMatches: "Admin Partidos",
    results: "Resultados",
    officialResult: "Resultado oficial",
    prediction: "Pronóstico",
    points: "Puntos",
    status: "Estado",
    stage: "Fase",
    qualifiedTeam: "Clasifica",
  },

  matchStatus: {
    open: "Abierto",
    closed: "Cerrado",
    finished: "Finalizado",
  },

  emptyStates: {
    noMatches: "Aún no hay partidos registrados.",
    noPredictions: "Aún no has registrado pronósticos.",
    noOpenMatches: "No hay partidos abiertos en este momento.",
    noFinishedPredictions:
      "Aún no tienes partidos finalizados con puntaje calculado.",
    noMatchPredictions: "No hay predicciones registradas para este partido.",
    noRanking: "Aún no hay usuarios con pronósticos para mostrar en el ranking.",
  },

  helper: {
    knockoutQualifiedTeam:
      "En eliminación debes indicar siempre qué equipo clasifica.",
    pendingMatch: "Partido aún no finalizado",
    noHits: "Sin aciertos",
    exactScore: "Marcador exacto",
    correctOutcome: "Resultado correcto",
    exactAndQualified: "Marcador exacto y clasificado correcto",
    outcomeAndQualified: "Resultado y clasificado correctos",
    onlyQualified: "Solo clasificado correcto",
  },
} as const;