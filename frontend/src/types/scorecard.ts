/**
 * Scorecard model shared by the scorer (which produces it) and the read-only
 * live viewer (which renders it).
 *
 * The backend stores `ScoreState` verbatim as an opaque JSON string on the match
 * (see Match.scoreState). It is the only way scorecard detail reaches a
 * spectator — the match columns themselves hold just the aggregate score.
 */

export type BallEventType = 'dot' | 'run' | 'four' | 'six' | 'wicket' | 'wide' | 'noball';

export interface BallEvent {
  display: string;
  runs: number;
  type: BallEventType;
}

export interface BatterStats {
  name: string; runs: number; balls: number; fours: number; sixes: number;
  isStriker: boolean; isOut: boolean;
}

export interface BowlerStats {
  name: string; overs: number; balls: number; runs: number; wickets: number;
}

export interface InningsData {
  battingTeam: string;
  score: number;
  wickets: number;
  batters: BatterStats[];
  bowlers: BowlerStats[];
}

/** Versioned so an older snapshot can be ignored rather than mis-rendered. */
export const SCORE_STATE_VERSION = 1;

export interface ScoreState {
  v: number;
  innings: number;
  battingTeam: string;
  /** Everyone who has batted this innings, including the batters at the crease. */
  batters: BatterStats[];
  /** Every bowler used this innings, including the one currently bowling. */
  bowlers: BowlerStats[];
  /** Ball-by-ball events for the current innings, oldest first. */
  events: BallEvent[];
  /** The completed first innings, present once the match is in its second. */
  innings1?: InningsData | null;
}

/** Parse a snapshot, tolerating null/legacy/corrupt payloads. */
export const parseScoreState = (raw?: string | null): ScoreState | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ScoreState;
    if (!parsed || parsed.v !== SCORE_STATE_VERSION) return null;
    if (!Array.isArray(parsed.batters) || !Array.isArray(parsed.bowlers)) return null;
    return { ...parsed, events: Array.isArray(parsed.events) ? parsed.events : [] };
  } catch {
    return null;
  }
};

/** Group a flat event list into overs, oldest first. A legal ball advances the over. */
export const groupEventsIntoOvers = (events: BallEvent[]): BallEvent[][] => {
  const overs: BallEvent[][] = [];
  let current: BallEvent[] = [];
  let legal = 0;
  for (const e of events) {
    current.push(e);
    if (e.type !== 'wide' && e.type !== 'noball') legal++;
    if (legal === 6) {
      overs.push(current);
      current = [];
      legal = 0;
    }
  }
  if (current.length) overs.push(current);
  return overs;
};
