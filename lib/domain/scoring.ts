import { isKnockoutStage } from "@/lib/domain/matches";
import { UI_TEXT } from "@/lib/ui/text";

type ScorableMatch = {
  stage: string;
  homeTeam: string;
  awayTeam: string;
  resultHome: number | null;
  resultAway: number | null;
  qualifiedTeam: string | null;
};

type ScorablePrediction = {
  predictedHome: number;
  predictedAway: number;
  qualifiedTeam: string | null;
};

export type PredictionScoreBreakdown = {
  points: number;
  exact: boolean;
  correctOutcome: boolean;
  correctQualifiedTeam: boolean;
  scored: boolean;
  reason: string;
};

export type RankingRow = {
  userId: string;
  username: string;
  totalPoints: number;
  exactHits: number;
  qualifiedHits: number;
  scoredPredictions: number;
};

function getOutcome(home: number, away: number): "HOME" | "AWAY" | "DRAW" {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

function isExactScore(
  predictedHome: number,
  predictedAway: number,
  resultHome: number,
  resultAway: number
) {
  return predictedHome === resultHome && predictedAway === resultAway;
}

export function calculatePredictionScore(
  match: ScorableMatch,
  prediction: ScorablePrediction
): PredictionScoreBreakdown {
  if (match.resultHome === null || match.resultAway === null) {
    return {
      points: 0,
      exact: false,
      correctOutcome: false,
      correctQualifiedTeam: false,
      scored: false,
      reason: UI_TEXT.helper.pendingMatch,
    };
  }

  const exact = isExactScore(
    prediction.predictedHome,
    prediction.predictedAway,
    match.resultHome,
    match.resultAway
  );

  const predictedOutcome = getOutcome(
    prediction.predictedHome,
    prediction.predictedAway
  );
  const actualOutcome = getOutcome(match.resultHome, match.resultAway);
  const correctOutcome = predictedOutcome === actualOutcome;

  const knockout = isKnockoutStage(match.stage);

  if (!knockout) {
    if (exact) {
      return {
        points: 4,
        exact: true,
        correctOutcome: true,
        correctQualifiedTeam: false,
        scored: true,
        reason: UI_TEXT.helper.exactScore,
      };
    }

    if (correctOutcome) {
      return {
        points: 1,
        exact: false,
        correctOutcome: true,
        correctQualifiedTeam: false,
        scored: true,
        reason: UI_TEXT.helper.correctOutcome,
      };
    }

    return {
      points: 0,
      exact: false,
      correctOutcome: false,
      correctQualifiedTeam: false,
      scored: true,
      reason: UI_TEXT.helper.noHits,
    };
  }

  const correctQualifiedTeam =
    !!prediction.qualifiedTeam &&
    !!match.qualifiedTeam &&
    prediction.qualifiedTeam === match.qualifiedTeam;

  if (exact && correctQualifiedTeam) {
    return {
      points: 5,
      exact: true,
      correctOutcome: true,
      correctQualifiedTeam: true,
      scored: true,
      reason: UI_TEXT.helper.exactAndQualified,
    };
  }

  if (correctOutcome && correctQualifiedTeam) {
    return {
      points: 2,
      exact: false,
      correctOutcome: true,
      correctQualifiedTeam: true,
      scored: true,
      reason: UI_TEXT.helper.outcomeAndQualified,
    };
  }

  if (correctQualifiedTeam) {
    return {
      points: 1,
      exact: false,
      correctOutcome: false,
      correctQualifiedTeam: true,
      scored: true,
      reason: UI_TEXT.helper.onlyQualified,
    };
  }

  return {
    points: 0,
    exact: false,
    correctOutcome: false,
    correctQualifiedTeam: false,
    scored: true,
    reason: UI_TEXT.helper.noHits,
  };
}

export function buildRanking(
  users: Array<{
    id: string;
    username: string;
    predictions: Array<{
      predictedHome: number;
      predictedAway: number;
      qualifiedTeam: string | null;
      match: ScorableMatch;
    }>;
  }>
): RankingRow[] {
  const rows = users.map((user) => {
    let totalPoints = 0;
    let exactHits = 0;
    let qualifiedHits = 0;
    let scoredPredictions = 0;

    for (const prediction of user.predictions) {
      const result = calculatePredictionScore(prediction.match, prediction);

      if (!result.scored) continue;

      totalPoints += result.points;
      scoredPredictions += 1;

      if (result.exact) exactHits += 1;
      if (result.correctQualifiedTeam) qualifiedHits += 1;
    }

    return {
      userId: user.id,
      username: user.username,
      totalPoints,
      exactHits,
      qualifiedHits,
      scoredPredictions,
    };
  });

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    if (b.qualifiedHits !== a.qualifiedHits) {
      return b.qualifiedHits - a.qualifiedHits;
    }
    return a.username.localeCompare(b.username, "es");
  });

  return rows;
}