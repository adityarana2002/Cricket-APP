import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  localMatchService,
  LocalMatch,
  CreateLocalMatchRequest,
  UpdateScoreRequest,
} from '../services/localMatchService';
import {
  BallEvent,
  BallEventType,
  BatterStats,
  BowlerStats,
  InningsData,
  ScoreState,
  SCORE_STATE_VERSION,
} from '../types/scorecard';
import { getInitials } from '../utils/initials';
import WatchModal from '../components/WatchModal';
import { InningsSection } from '../components/ScorecardTables';
import './LocalMatchPage.css';

type StatusFilter = 'ALL' | 'UPCOMING' | 'LIVE' | 'COMPLETED';

const FORMAT_DEFAULT_OVERS: Record<string, number | undefined> = {
  T20: 20,
  ODI: 50,
  Test: undefined,
  Friendly: undefined,
};

const BALL_TYPES = [
  { value: 'Tennis', color: '#22c55e', shadow: 'rgba(34,197,94,0.45)' },
  { value: 'Leather', color: '#ef4444', shadow: 'rgba(239,68,68,0.45)' },
  { value: 'Other', color: '#f59e0b', shadow: 'rgba(245,158,11,0.45)' },
];

const BLANK_FORM: CreateLocalMatchRequest = {
  team1Name: '',
  team2Name: '',
  battingTeamId: 1,
  matchFormat: 'T20',
  location: '',
  description: '',
  matchDate: '',
  numberOfOvers: 20,
  oversPerBowler: 4,
  ballType: 'Tennis',
};

// ─── Scoring types ───────────────────────────────────────────────────────────
// The scorecard model is shared with the read-only live viewer — see types/scorecard.
interface OverSummary {
  overNum: number;
  runs: number;
  wickets: number;
}

const makeBlankBatter = (name: string, isStriker: boolean): BatterStats => ({
  name, runs: 0, balls: 0, fours: 0, sixes: 0, isStriker, isOut: false,
});

/** The completed first innings, stashed by the scorer at the innings break. */
const readStoredInnings1 = (matchId: number): InningsData | null => {
  try {
    const raw = localStorage.getItem(`crickmax_inn1_${matchId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const mergeIntoBowlerLedger = (ledger: BowlerStats[], bowler: BowlerStats): BowlerStats[] => {
  if (!bowler.name) return ledger;
  const i = ledger.findIndex(b => b.name === bowler.name);
  if (i >= 0) {
    const updated = [...ledger];
    updated[i] = {
      name: bowler.name,
      overs: updated[i].overs + bowler.overs,
      balls: updated[i].balls + bowler.balls,
      runs: updated[i].runs + bowler.runs,
      wickets: updated[i].wickets + bowler.wickets,
    };
    return updated;
  }
  return [...ledger, { ...bowler }];
};

// ─── Completed Scorecard ──────────────────────────────────────────────────────
const CompletedScorecard: React.FC<{ match: LocalMatch; onClose: () => void }> = ({ match, onClose }) => {
  const history: { innings1?: InningsData; innings2?: InningsData } | null = (() => {
    try {
      const raw = localStorage.getItem(`crickmax_history_${match.id}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  return (
    <div className="lm-modal-overlay" onClick={onClose}>
      <div className="lm-modal cs-modal" onClick={e => e.stopPropagation()}>
        <div className="lm-modal-header">
          <div>
            <h2 className="lm-modal-title">Final Scorecard</h2>
            <p className="lm-modal-sub">{match.team1Name} vs {match.team2Name} · {match.matchFormat}</p>
          </div>
          <button className="lm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="sc-final-board">
          <div className="sc-final-team">
            <div className="sc-final-avatar sc-avatar-t1">{getInitials(match.team1Name)}</div>
            <div className="sc-final-name">{match.team1Name}</div>
            <div className="sc-final-score">
              {match.team1Score}<span className="sc-sep">/</span>{match.team1Wickets}
            </div>
          </div>
          <div className="sc-final-vs">VS</div>
          <div className="sc-final-team">
            <div className="sc-final-avatar sc-avatar-t2">{getInitials(match.team2Name)}</div>
            <div className="sc-final-name">{match.team2Name}</div>
            <div className="sc-final-score">
              {match.team2Score}<span className="sc-sep">/</span>{match.team2Wickets}
            </div>
          </div>
        </div>

        {match.winnerName ? (
          <div className="sc-winner-banner">🏆 {match.winnerName} won the match!</div>
        ) : (
          <div className="sc-winner-banner sc-tie-banner">🤝 Match Tied — both teams finished level!</div>
        )}

        <div className="sc-meta-row">
          {match.ballType && <span className="sc-meta-pill">🎾 {match.ballType} Ball</span>}
          {match.location && match.location !== 'Local Ground' && (
            <span className="sc-meta-pill">📍 {match.location}</span>
          )}
          {match.totalOvers && <span className="sc-meta-pill">📋 {match.totalOvers} Overs</span>}
          {match.matchDate && (
            <span className="sc-meta-pill">
              🗓 {new Date(match.matchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {history ? (
          <div className="cs-body">
            {history.innings1 && <InningsSection data={history.innings1} label="1st Innings" />}
            {history.innings2 && <InningsSection data={history.innings2} label="2nd Innings" />}
          </div>
        ) : (
          <div className="cs-no-history">
            <p>Detailed scorecard not available for this match.</p>
            <p className="cs-no-history-sub">Detailed stats are saved for matches scored with the live scorer.</p>
          </div>
        )}

        <div className="sc-close-row">
          <button className="lm-btn lm-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Win Celebration ──────────────────────────────────────────────────────────
const _confettiItems = Array.from({ length: 60 }, (_, i) => ({
  left:     `${(i * 1.65 + 2) % 97}%`,
  duration: `${2.3 + (i % 7) * 0.35}s`,
  delay:    `-${(i * 0.29) % 2.7}s`,
  color:    ['#6366f1','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#ec4899','#fb923c'][i % 8],
  width:    `${7 + (i % 4) * 2}px`,
  height:   `${11 + (i % 5) * 3}px`,
}));

interface WinCelebrationProps {
  match: LocalMatch;
  onViewScorecard: () => void;
  onClose: () => void;
}
const WinCelebration: React.FC<WinCelebrationProps> = ({ match, onViewScorecard, onClose }) => {
  const isTie = match.isTie || !match.winnerName;
  const t1Score = `${match.team1Score}/${match.team1Wickets}`;
  const t2Score = `${match.team2Score}/${match.team2Wickets}`;

  const isTeam1Winner = match.winnerName === match.team1Name;
  const winScore  = `${isTeam1Winner ? match.team1Score : match.team2Score}/${isTeam1Winner ? match.team1Wickets : match.team2Wickets}`;
  const loserName = isTeam1Winner ? match.team2Name : match.team1Name;
  const loseScore = `${isTeam1Winner ? match.team2Score : match.team1Score}/${isTeam1Winner ? match.team2Wickets : match.team1Wickets}`;

  return (
    <div className={`win-overlay ${isTie ? 'win-tie' : ''}`} onClick={onClose}>
      {!isTie && (
        <div className="win-confetti-wrap" aria-hidden="true">
          {_confettiItems.map((c, i) => (
            <span key={i} className="win-confetti" style={{ left: c.left, width: c.width, height: c.height,
              background: c.color, animationDuration: c.duration, animationDelay: c.delay }} />
          ))}
        </div>
      )}
      <div className="win-card" onClick={e => e.stopPropagation()}>
        <div className="win-stars" aria-hidden="true">
          {['★','✦','✶','★','✦'].map((s, i) => <span key={i} className={`win-star win-star-${i}`}>{s}</span>)}
        </div>
        <div className="win-trophy-wrap">
          <div className="win-trophy">{isTie ? '🤝' : '🏆'}</div>
          <div className="win-glow" />
        </div>

        {isTie ? (
          <>
            <div className="win-badge-row"><span className="win-badge">MATCH TIED</span></div>
            <h1 className="win-team-name">It's a Tie!</h1>
            <p className="win-tagline">Both teams finished level — what a contest!</p>
            <div className="win-scoreboard">
              <div className="win-sc-team">
                <div className="win-sc-avatar win-av-gold">{getInitials(match.team1Name)}</div>
                <div className="win-sc-info">
                  <div className="win-sc-name">{match.team1Name}</div>
                  <div className="win-sc-score">{t1Score}</div>
                </div>
              </div>
              <div className="win-sc-vs">TIE</div>
              <div className="win-sc-team">
                <div className="win-sc-avatar win-av-gold">{getInitials(match.team2Name)}</div>
                <div className="win-sc-info">
                  <div className="win-sc-name">{match.team2Name}</div>
                  <div className="win-sc-score">{t2Score}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="win-badge-row"><span className="win-badge">MATCH WINNER</span></div>
            <h1 className="win-team-name">{match.winnerName}</h1>
            <p className="win-tagline">Clinched the victory!</p>
            <div className="win-scoreboard">
              <div className="win-sc-team win-sc-winner">
                <div className="win-sc-avatar win-av-gold">{getInitials(match.winnerName || '')}</div>
                <div className="win-sc-info">
                  <div className="win-sc-name">{match.winnerName}</div>
                  <div className="win-sc-score">{winScore}</div>
                </div>
                <span className="win-sc-crown">👑</span>
              </div>
              <div className="win-sc-vs">VS</div>
              <div className="win-sc-team win-sc-loser">
                <div className="win-sc-avatar win-av-grey">{getInitials(loserName)}</div>
                <div className="win-sc-info">
                  <div className="win-sc-name">{loserName}</div>
                  <div className="win-sc-score">{loseScore}</div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="win-meta">
          {match.matchFormat && <span className="win-meta-pill">{match.matchFormat}</span>}
          {match.location && <span className="win-meta-pill">📍 {match.location}</span>}
        </div>
        <div className="win-actions">
          <button className="win-btn-view" onClick={onViewScorecard}>📋 View Scorecard</button>
          <button className="win-btn-close-x" onClick={onClose}>✕ Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Score Modal (Live Scoring) ───────────────────────────────────────────────
interface ScoreModalProps {
  match: LocalMatch;
  onClose: () => void;
  onUpdate: (m: LocalMatch) => void;
  onEndMatch: (m: LocalMatch) => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ match, onClose, onUpdate, onEndMatch }) => {
  const [score, setScore] = useState<UpdateScoreRequest>({
    team1Score: match.team1Score, team2Score: match.team2Score,
    team1Wickets: match.team1Wickets, team2Wickets: match.team2Wickets,
    currentOver: match.currentOver, currentBall: match.currentBall,
  });
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [winner, setWinner] = useState<'team1' | 'team2' | 'tie' | ''>('');
  const [scoreHistory, setScoreHistory] = useState<UpdateScoreRequest[]>([]);
  const [eventLog, setEventLog] = useState<BallEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Per-player stats (replaces plain string state)
  const [batter1, setBatter1] = useState<BatterStats>(makeBlankBatter(match.striker || '', true));
  const [batter2, setBatter2] = useState<BatterStats>(makeBlankBatter(match.nonStriker || '', false));
  const [bowlerStats, setBowlerStats] = useState<BowlerStats>({
    name: match.currentBowler || '', overs: 0, balls: 0, runs: 0, wickets: 0,
  });
  const [playerHistory, setPlayerHistory] = useState<Array<{ b1: BatterStats; b2: BatterStats; bs: BowlerStats }>>([]);

  // Setup flow — shown before scoring if no player names exist yet
  const [setupDone, setSetupDone] = useState(!!(match.striker && match.nonStriker && match.currentBowler));
  const [setupForm, setSetupForm] = useState({
    striker: match.striker || '', nonStriker: match.nonStriker || '', bowler: match.currentBowler || '',
  });

  // Popups
  const [overSummary, setOverSummary] = useState<OverSummary | null>(null);
  const [pendingOverSummary, setPendingOverSummary] = useState<OverSummary | null>(null);
  const [newBowlerInput, setNewBowlerInput] = useState('');
  const [showNewBatsman, setShowNewBatsman] = useState(false);
  const [newBatsmanInput, setNewBatsmanInput] = useState('');
  // Tracks names of bowlers who have completed at least one over (for history chips)
  const [overBowlers, setOverBowlers] = useState<string[]>([]);
  // Accumulates all bowlers' and batters' stats across the innings
  const [bowlerLedger, setBowlerLedger] = useState<BowlerStats[]>([]);
  const [batterLedger, setBatterLedger] = useState<BatterStats[]>([]);

  // Resync when innings switches
  useEffect(() => {
    setScore({
      team1Score: match.team1Score, team2Score: match.team2Score,
      team1Wickets: match.team1Wickets, team2Wickets: match.team2Wickets,
      currentOver: match.currentOver, currentBall: match.currentBall,
    });
    setScoreHistory([]); setEventLog([]);
    setBatter1(makeBlankBatter(match.striker || '', true));
    setBatter2(makeBlankBatter(match.nonStriker || '', false));
    setBowlerStats({ name: match.currentBowler || '', overs: 0, balls: 0, runs: 0, wickets: 0 });
    setPlayerHistory([]);
    setSetupDone(!!(match.striker && match.nonStriker && match.currentBowler));
    setSetupForm({ striker: match.striker || '', nonStriker: match.nonStriker || '', bowler: match.currentBowler || '' });
    setOverSummary(null); setPendingOverSummary(null); setOverBowlers([]);
    setBowlerLedger([]); setBatterLedger([]); setError('');
  }, [match.currentInnings]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scorecard snapshot sync ────────────────────────────────────────────────
  // Per-batter figures, bowling figures and ball-by-ball detail live only in this
  // component's state — the match row itself stores just the aggregate score. Push
  // a snapshot so spectators holding the match code can see the full scorecard.
  //
  // Deliberately decoupled from saveScore(): this runs off committed state (never
  // a stale closure), is debounced, and swallows errors, so it cannot disturb the
  // scoring path in any way.
  useEffect(() => {
    if (!setupDone || match.status !== 'LIVE') return;

    const isNamed = (p: { name: string }) => !!p.name;
    const ledgerNames = new Set(batterLedger.map(b => b.name));
    const snapshot: ScoreState = {
      v: SCORE_STATE_VERSION,
      innings: match.currentInnings ?? 1,
      battingTeam: match.battingTeam,
      batters: [
        ...batterLedger,
        ...[batter1, batter2].filter(b => isNamed(b) && !ledgerNames.has(b.name)),
      ],
      bowlers: mergeIntoBowlerLedger(bowlerLedger, bowlerStats).filter(isNamed),
      events: eventLog,
      innings1: readStoredInnings1(match.id),
    };

    const timer = setTimeout(() => {
      localMatchService
        .saveScoreState(match.id, JSON.stringify(snapshot))
        .catch(() => { /* viewer convenience only — never surfaced to the scorer */ });
    }, 500);
    return () => clearTimeout(timer);
  }, [
    setupDone, match.status, match.id, match.currentInnings, match.battingTeam,
    batter1, batter2, bowlerStats, batterLedger, bowlerLedger, eventLog,
  ]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const FORMAT_OVERS: Record<string, number | null> = { T20: 20, ODI: 50, Test: null, Friendly: null };
  const maxOvers = match.totalOvers ?? FORMAT_OVERS[match.matchFormat] ?? null;
  const isFirstInnings = (match.currentInnings ?? 1) === 1;
  const isBatTeam1 = match.battingTeam === match.team1Name;

  const batScore = isBatTeam1 ? (score.team1Score ?? 0) : (score.team2Score ?? 0);
  const batWkts  = isBatTeam1 ? (score.team1Wickets ?? 0) : (score.team2Wickets ?? 0);
  const curOver  = score.currentOver ?? 0;
  const curBall  = score.currentBall ?? 0;
  const allOut   = batWkts >= 10;
  const oversUp  = maxOvers !== null && curOver >= maxOvers;
  const inningsOver = allOut || oversUp;

  const target      = !isFirstInnings ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1) : null;
  const runsNeeded  = target !== null ? Math.max(0, target - batScore) : null;
  const targetChased = target !== null && batScore >= target;

  const strikerStats    = batter1.isStriker ? batter1 : batter2;
  const nonStrikerStats = batter1.isStriker ? batter2 : batter1;

  // Run rates
  const totalBalls    = curOver * 6 + curBall;
  const crr           = totalBalls > 0 ? ((batScore / totalBalls) * 6).toFixed(2) : '—';
  const ballsLeft     = maxOvers !== null ? maxOvers * 6 - totalBalls : null;
  const rrr           = (!isFirstInnings && runsNeeded !== null && ballsLeft !== null && ballsLeft > 0)
                        ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : null;
  const lastWktIdx    = [...eventLog].map((e, i) => e.type === 'wicket' ? i : -1).filter(i => i >= 0).pop() ?? -1;
  const partnership   = eventLog.slice(lastWktIdx + 1).reduce((s, e) => s + e.runs, 0);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const advanceBall = (s: UpdateScoreRequest): UpdateScoreRequest => {
    let ball = (s.currentBall ?? 0) + 1;
    let over = s.currentOver ?? 0;
    if (ball >= 6) { ball = 0; over += 1; }
    return { ...s, currentBall: ball, currentOver: over };
  };

  const resetToMatch = () => setScore({
    team1Score: match.team1Score, team2Score: match.team2Score,
    team1Wickets: match.team1Wickets, team2Wickets: match.team2Wickets,
    currentOver: match.currentOver, currentBall: match.currentBall,
  });

  const fmtSR   = (runs: number, balls: number) => balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
  const fmtEcon = (runs: number, overs: number, balls: number) => {
    const tb = overs * 6 + balls;
    return tb > 0 ? ((runs / tb) * 6).toFixed(1) : '0.0';
  };

  // ── saveScore — fire-and-forget for ball entry (optimistic UI), awaited for heavy ops ──
  const saveScore = (
    s: UpdateScoreRequest,
    b1: BatterStats,
    b2: BatterStats,
    bs: BowlerStats,
    autoEntry = false,
  ): Promise<void> => {
    const payload = {
      ...s,
      striker:       (b1.isStriker ? b1.name : b2.name) || undefined,
      nonStriker:    (b1.isStriker ? b2.name : b1.name) || undefined,
      currentBowler: bs.name || undefined,
    };
    return localMatchService.updateScore(match.id, payload)
      .then(updated => { onUpdate(updated); })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Failed to save score');
        resetToMatch();
        if (autoEntry) {
          setScoreHistory(h => h.slice(0, -1));
          setEventLog(e => e.slice(0, -1));
          setPlayerHistory(h => h.slice(0, -1));
        }
      });
  };

  const handleSetupStart = async () => {
    const s = setupForm.striker.trim();
    const ns = setupForm.nonStriker.trim();
    const b  = setupForm.bowler.trim();
    if (!s || !ns || !b) return;
    const newB1: BatterStats = makeBlankBatter(s, true);
    const newB2: BatterStats = makeBlankBatter(ns, false);
    const newBs: BowlerStats = { name: b, overs: 0, balls: 0, runs: 0, wickets: 0 };
    setBatter1(newB1); setBatter2(newB2); setBowlerStats(newBs);
    setSetupDone(true);
    try {
      setSaving(true);
      const updated = await localMatchService.updateScore(match.id, {
        ...score, striker: s, nonStriker: ns, currentBowler: b,
      });
      onUpdate(updated);
    } catch { /* best-effort */ }
    finally { setSaving(false); }
  };

  // Group event log into overs
  const getOverGroups = (): Array<{ balls: BallEvent[]; overRuns: number; overWkts: number; isComplete: boolean }> => {
    const groups: Array<{ balls: BallEvent[]; overRuns: number; overWkts: number; isComplete: boolean }> = [];
    let current: BallEvent[] = [];
    let legalCount = 0;
    for (const ev of eventLog) {
      current.push(ev);
      if (ev.type !== 'wide' && ev.type !== 'noball') {
        legalCount++;
        if (legalCount === 6) {
          groups.push({ balls: current, overRuns: current.reduce((s, b) => s + b.runs, 0), overWkts: current.filter(b => b.type === 'wicket').length, isComplete: true });
          current = []; legalCount = 0;
        }
      }
    }
    if (current.length > 0)
      groups.push({ balls: current, overRuns: current.reduce((s, b) => s + b.runs, 0), overWkts: current.filter(b => b.type === 'wicket').length, isComplete: false });
    return groups;
  };
  const overGroups = getOverGroups();

  // Current over for the live ball-strip display
  const currentOvGroup  = overGroups.length > 0 && !overGroups[overGroups.length - 1].isComplete
    ? overGroups[overGroups.length - 1] : null;
  const currentOvBalls  = currentOvGroup?.balls ?? [];
  const legalInCurOv    = currentOvBalls.filter(b => b.type !== 'wide' && b.type !== 'noball').length;
  const currentOvRuns   = currentOvGroup?.overRuns ?? 0;
  const lastBall        = eventLog.length > 0 ? eventLog[eventLog.length - 1] : null;

  const addRuns = async (runs: number, legal = true, type: BallEventType = 'run') => {
    if (inningsOver) return;
    const prevBall = score.currentBall ?? 0;
    const prevOver = score.currentOver ?? 0;
    const isOverEnd = legal && prevBall === 5;
    const display = type === 'dot' ? '•' : type === 'wide' ? 'Wd' : type === 'noball' ? 'NB'
      : type === 'four' ? '4' : type === 'six' ? '6' : `${runs}`;

    setScoreHistory(prev => [...prev, { ...score }]);
    setEventLog(prev => [...prev, { display, runs, type }]);
    setPlayerHistory(prev => [...prev, { b1: batter1, b2: batter2, bs: bowlerStats }]);

    let s = { ...score };
    if (isBatTeam1) s.team1Score = (s.team1Score ?? 0) + runs;
    else            s.team2Score = (s.team2Score ?? 0) + runs;
    if (legal) s = advanceBall(s);
    setScore(s);

    // Update striker stats
    let newB1 = { ...batter1 };
    let newB2 = { ...batter2 };
    if (batter1.isStriker) {
      newB1 = { ...newB1, runs: newB1.runs + runs, balls: legal ? newB1.balls + 1 : newB1.balls,
        fours: newB1.fours + (type === 'four' ? 1 : 0), sixes: newB1.sixes + (type === 'six' ? 1 : 0) };
    } else {
      newB2 = { ...newB2, runs: newB2.runs + runs, balls: legal ? newB2.balls + 1 : newB2.balls,
        fours: newB2.fours + (type === 'four' ? 1 : 0), sixes: newB2.sixes + (type === 'six' ? 1 : 0) };
    }

    // Update bowler stats
    let newBs = { ...bowlerStats, runs: bowlerStats.runs + runs };
    if (legal) newBs = { ...newBs, balls: newBs.balls + 1 };

    // Strike rotation: (odd runs XOR over-end) determines net swap
    const netSwap = (Number(runs % 2 === 1) + Number(isOverEnd)) % 2 === 1;
    if (netSwap) { newB1 = { ...newB1, isStriker: !newB1.isStriker }; newB2 = { ...newB2, isStriker: !newB2.isStriker }; }

    // Check if innings/match will be over after this ball
    const newBatScore = isBatTeam1 ? (s.team1Score ?? 0) : (s.team2Score ?? 0);
    const newOversUp = maxOvers !== null && (s.currentOver ?? 0) >= maxOvers;
    const willChaseTarget = !isFirstInnings && target !== null && newBatScore >= target;

    if (isOverEnd) {
      const curOvEvents = overGroups[overGroups.length - 1]?.balls ?? [];
      const overRuns = curOvEvents.reduce((acc, b) => acc + b.runs, 0) + runs;
      const overWkts = curOvEvents.filter(b => b.type === 'wicket').length;
      newBs = { ...newBs, overs: newBs.overs + 1, balls: 0 };
      setOverBowlers(prev => [...prev, bowlerStats.name]);
      setNewBowlerInput('');
      // Only show new-bowler popup if innings is still ongoing
      if (!newOversUp && !willChaseTarget) {
        setOverSummary({ overNum: prevOver + 1, runs: overRuns, wickets: overWkts });
      }
    }

    setBatter1(newB1); setBatter2(newB2); setBowlerStats(newBs);
    // Fire score sync in background — UI already updated optimistically
    const saveProm = saveScore(s, newB1, newB2, newBs, true);

    // Helper: save innings history and call endMatch. winId null → declared a TIE.
    const autoEndMatch = async (winId: number | null, bowlerSnap: BowlerStats, batScore2: number) => {
      await saveProm;
      const finalBowlerLedger = mergeIntoBowlerLedger(bowlerLedger, bowlerSnap);
      const endLedgerNames = new Set(batterLedger.map(b => b.name));
      const currentInn: InningsData = {
        battingTeam: match.battingTeam,
        score: batScore2,
        wickets: isBatTeam1 ? (s.team1Wickets ?? 0) : (s.team2Wickets ?? 0),
        batters: [
          ...batterLedger,
          ...[newB1, newB2].filter(b => b.name && !endLedgerNames.has(b.name)),
        ],
        bowlers: finalBowlerLedger.filter(b => b.name),
      };
      const inn1Raw = localStorage.getItem(`crickmax_inn1_${match.id}`);
      const inn1: InningsData | null = inn1Raw ? JSON.parse(inn1Raw) : null;
      localStorage.setItem(`crickmax_history_${match.id}`, JSON.stringify(
        inn1 ? { innings1: inn1, innings2: currentInn } : { innings1: currentInn }
      ));
      localStorage.removeItem(`crickmax_inn1_${match.id}`);
      try {
        setSaving(true);
        const ended = await localMatchService.endMatch(match.id, winId);
        onEndMatch(ended);
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to end match');
        setSaving(false);
      }
    };

    if (willChaseTarget) {
      // Batting team chased the target — batting team wins
      await autoEndMatch(isBatTeam1 ? match.team1Id : match.team2Id, newBs, newBatScore);
    } else if (newOversUp && !isFirstInnings) {
      // Overs exhausted in 2nd innings, target not chased.
      // Scores level (batting total == first-innings total) → TIE, else bowling team wins.
      const isTieResult = target !== null && newBatScore === target - 1;
      await autoEndMatch(
        isTieResult ? null : (isBatTeam1 ? match.team2Id : match.team1Id),
        newBs, newBatScore,
      );
    }
  };

  const addWicket = async () => {
    if (inningsOver) return;
    const prevBall = score.currentBall ?? 0;
    const prevOver = score.currentOver ?? 0;
    const isOverEnd = prevBall === 5;

    setScoreHistory(prev => [...prev, { ...score }]);
    setEventLog(prev => [...prev, { display: 'W', runs: 0, type: 'wicket' }]);
    setPlayerHistory(prev => [...prev, { b1: batter1, b2: batter2, bs: bowlerStats }]);

    let s = { ...score };
    if (isBatTeam1) s.team1Wickets = Math.min((s.team1Wickets ?? 0) + 1, 10);
    else            s.team2Wickets = Math.min((s.team2Wickets ?? 0) + 1, 10);
    s = advanceBall(s);
    setScore(s);

    let newB1 = { ...batter1 };
    let newB2 = { ...batter2 };
    if (batter1.isStriker) newB1 = { ...newB1, isOut: true, balls: newB1.balls + 1 };
    else                   newB2 = { ...newB2, isOut: true, balls: newB2.balls + 1 };

    // Save dismissed batter to ledger
    const outBatter = batter1.isStriker ? newB1 : newB2;
    setBatterLedger(prev => [...prev, outBatter]);

    let newBs = { ...bowlerStats, wickets: bowlerStats.wickets + 1, balls: bowlerStats.balls + 1 };

    // Check if innings will be over after this wicket
    const newWkts = isBatTeam1 ? (s.team1Wickets ?? 0) : (s.team2Wickets ?? 0);
    const newInningsOver = newWkts >= 10 || (maxOvers !== null && (s.currentOver ?? 0) >= maxOvers);

    if (isOverEnd) {
      const curOvEvents = overGroups[overGroups.length - 1]?.balls ?? [];
      const overRuns = curOvEvents.reduce((acc, b) => acc + b.runs, 0);
      const overWkts = curOvEvents.filter(b => b.type === 'wicket').length + 1;
      newB1 = { ...newB1, isStriker: !newB1.isStriker }; newB2 = { ...newB2, isStriker: !newB2.isStriker };
      newBs = { ...newBs, overs: newBs.overs + 1, balls: 0 };
      setOverBowlers(prev => [...prev, bowlerStats.name]);
      setNewBowlerInput('');
      if (!newInningsOver) {
        setPendingOverSummary({ overNum: prevOver + 1, runs: overRuns, wickets: overWkts });
        setNewBatsmanInput(''); setShowNewBatsman(true);
      }
    } else if (!newInningsOver) {
      setNewBatsmanInput(''); setShowNewBatsman(true);
    }

    setBatter1(newB1); setBatter2(newB2); setBowlerStats(newBs);
    const wicketSaveProm = saveScore(s, newB1, newB2, newBs, true);

    // Auto-declare winner when 2nd innings ends by all-out — bowling team wins
    if (newInningsOver && !isFirstInnings) {
      await wicketSaveProm;
      const finalBowlerLedger = mergeIntoBowlerLedger(bowlerLedger, newBs);
      const endLedgerNames = new Set(batterLedger.map(b => b.name));
      const newBatScore2 = isBatTeam1 ? (s.team1Score ?? 0) : (s.team2Score ?? 0);
      const currentInn: InningsData = {
        battingTeam: match.battingTeam,
        score: newBatScore2,
        wickets: isBatTeam1 ? (s.team1Wickets ?? 0) : (s.team2Wickets ?? 0),
        batters: [
          ...batterLedger,
          ...[newB1, newB2].filter(b => b.name && !endLedgerNames.has(b.name)),
        ],
        bowlers: finalBowlerLedger.filter(b => b.name),
      };
      const inn1Raw = localStorage.getItem(`crickmax_inn1_${match.id}`);
      const inn1: InningsData | null = inn1Raw ? JSON.parse(inn1Raw) : null;
      localStorage.setItem(`crickmax_history_${match.id}`, JSON.stringify(
        inn1 ? { innings1: inn1, innings2: currentInn } : { innings1: currentInn }
      ));
      localStorage.removeItem(`crickmax_inn1_${match.id}`);
      try {
        setSaving(true);
        // Scores level when the chasing side is bowled out one run short of the
        // target (i.e. exactly the first-innings total) → TIE; else bowling team wins.
        const isTieResult = target !== null && newBatScore2 === target - 1;
        const winId = isTieResult ? null : (isBatTeam1 ? match.team2Id : match.team1Id);
        const ended = await localMatchService.endMatch(match.id, winId);
        onEndMatch(ended);
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to end match');
        setSaving(false);
      }
    }
  };

  const handleUndo = async () => {
    if (scoreHistory.length === 0 || saving) return;
    const prevScore   = scoreHistory[scoreHistory.length - 1];
    const prevPlayers = playerHistory.length > 0 ? playerHistory[playerHistory.length - 1] : null;
    setScoreHistory(h => h.slice(0, -1));
    setEventLog(e => e.slice(0, -1));
    setPlayerHistory(h => h.slice(0, -1));
    setScore(prevScore);
    const b1 = prevPlayers?.b1 ?? batter1;
    const b2 = prevPlayers?.b2 ?? batter2;
    const bs = prevPlayers?.bs ?? bowlerStats;
    if (prevPlayers) { setBatter1(b1); setBatter2(b2); setBowlerStats(bs); }
    try {
      setSaving(true);
      await saveScore(prevScore, b1, b2, bs, false);
    } finally { setSaving(false); }
  };

  const handleSwitchInnings = async () => {
    try {
      setSwitching(true); setError('');
      // Snapshot innings 1 before state resets
      const finalBowlerLedger = mergeIntoBowlerLedger(bowlerLedger, bowlerStats);
      const ledgerNames = new Set(batterLedger.map(b => b.name));
      const inn1: InningsData = {
        battingTeam: match.battingTeam,
        score: batScore,
        wickets: batWkts,
        batters: [
          ...batterLedger,
          ...[batter1, batter2].filter(b => b.name && !ledgerNames.has(b.name)),
        ],
        bowlers: finalBowlerLedger.filter(b => b.name),
      };
      localStorage.setItem(`crickmax_inn1_${match.id}`, JSON.stringify(inn1));
      const updated = await localMatchService.switchInnings(match.id);
      onUpdate(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to switch innings');
    } finally { setSwitching(false); }
  };

  const handleEndMatch = async () => {
    if (!winner) return;
    try {
      setSaving(true);
      // Snapshot current innings before modal closes
      const finalBowlerLedger = mergeIntoBowlerLedger(bowlerLedger, bowlerStats);
      const endLedgerNames = new Set(batterLedger.map(b => b.name));
      const currentInn: InningsData = {
        battingTeam: match.battingTeam,
        score: batScore,
        wickets: batWkts,
        batters: [
          ...batterLedger,
          ...[batter1, batter2].filter(b => b.name && !endLedgerNames.has(b.name)),
        ],
        bowlers: finalBowlerLedger.filter(b => b.name),
      };
      const inn1Raw = localStorage.getItem(`crickmax_inn1_${match.id}`);
      const inn1: InningsData | null = inn1Raw ? JSON.parse(inn1Raw) : null;
      const history = inn1
        ? { innings1: inn1, innings2: currentInn }
        : { innings1: currentInn };
      localStorage.setItem(`crickmax_history_${match.id}`, JSON.stringify(history));
      localStorage.removeItem(`crickmax_inn1_${match.id}`);

      const winId = winner === 'tie' ? null : (winner === 'team1' ? match.team1Id : match.team2Id);
      const ended = await localMatchService.endMatch(match.id, winId);
      onEndMatch(ended); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to end match');
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="lm-modal-overlay" onClick={onClose}>
      <div className="lm-modal sc-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="lm-modal-header">
          <div>
            <h2 className="lm-modal-title">
              <span className="live-dot" />
              Live Scoring
            </h2>
            <p className="lm-modal-sub">
              {match.team1Name} vs {match.team2Name} · {match.matchFormat}
              {match.totalOvers ? ` · ${match.totalOvers} overs` : ''}
            </p>
          </div>
          <button className="lm-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Innings bar */}
        <div className="sc-innings-bar">
          <span className={`sc-inn-chip ${isFirstInnings ? 'sc-inn-active' : 'sc-inn-done'}`}>
            {isFirstInnings ? '🏏' : '✓'} 1st Innings
          </span>
          <span className="sc-inn-arrow">›</span>
          <span className={`sc-inn-chip ${!isFirstInnings ? 'sc-inn-active' : 'sc-inn-idle'}`}>
            {!isFirstInnings ? '🏏' : ''} 2nd Innings
          </span>
          {!isFirstInnings && target !== null && (
            <span className="sc-target-badge">Target {target}</span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="sc-error">⚠ {error}<button onClick={() => setError('')}>✕</button></div>
        )}

        {/* Innings complete bar */}
        {!showEndConfirm && inningsOver && (
          <div className="sc-innings-done-bar">
            <span>{allOut ? `🎯 All Out — ${batScore} runs` : `🏁 ${maxOvers} overs complete`}</span>
            {isFirstInnings ? (
              <button className="sc-btn-switch" onClick={handleSwitchInnings} disabled={switching}>
                {switching ? '…' : '→ 2nd Innings'}
              </button>
            ) : (
              <button className="sc-btn-switch" onClick={() => setShowEndConfirm(true)}>Declare Winner</button>
            )}
          </div>
        )}

        {/* Target chased */}
        {!showEndConfirm && targetChased && (
          <div className="sc-target-chased">
            🏆 Target chased! {match.battingTeam} wins!
            <button className="sc-btn-switch sc-btn-gold" onClick={() => setShowEndConfirm(true)}>Declare</button>
          </div>
        )}

        {/* ── Setup screen (shown first, before scoring) ── */}
        {!showEndConfirm && !setupDone && (
          <div className="sc-setup">
            <div className="sc-setup-icon">🏏</div>
            <div className="sc-setup-title">Match Setup</div>
            <p className="sc-setup-sub">Enter player names before scoring starts</p>
            <div className="sc-setup-grid">
              <div className="sc-setup-field">
                <label className="sc-setup-label">⚡ Opening Striker</label>
                <input className="sc-setup-input" placeholder="e.g. Rohit Sharma"
                  value={setupForm.striker}
                  onChange={e => setSetupForm(f => ({ ...f, striker: e.target.value }))}
                  autoFocus />
              </div>
              <div className="sc-setup-field">
                <label className="sc-setup-label">🏏 Non-Striker</label>
                <input className="sc-setup-input" placeholder="e.g. Virat Kohli"
                  value={setupForm.nonStriker}
                  onChange={e => setSetupForm(f => ({ ...f, nonStriker: e.target.value }))} />
              </div>
              <div className="sc-setup-field">
                <label className="sc-setup-label">🎯 Opening Bowler</label>
                <input className="sc-setup-input" placeholder="e.g. Jasprit Bumrah"
                  value={setupForm.bowler}
                  onChange={e => setSetupForm(f => ({ ...f, bowler: e.target.value }))} />
              </div>
            </div>
            <button
              className="sc-setup-start-btn"
              onClick={handleSetupStart}
              disabled={!setupForm.striker.trim() || !setupForm.nonStriker.trim() || !setupForm.bowler.trim() || saving}
            >
              {saving ? 'Starting…' : '▶ Start Scoring'}
            </button>
          </div>
        )}

        {/* ── Main scoring UI (shown after setup) ── */}
        {setupDone && !showEndConfirm && (
          <>
            {/* Compact score header */}
            <div className="sc-score-header">
              <div className="sc-sh-team">
                <div className="sc-sh-avatar sc-avatar-bat">{getInitials(match.battingTeam)}</div>
                <div className="sc-sh-info">
                  <div className="sc-sh-name">{match.battingTeam}</div>
                  <div className="sc-sh-sub">Batting</div>
                </div>
              </div>
              <div className="sc-sh-center">
                <div className="sc-sh-big-score">
                  {batScore}<span className="sc-sh-sep">/</span>{batWkts}
                </div>
                <div className="sc-sh-overs">{curOver}.{curBall}{maxOvers ? `/${maxOvers}` : ''} ov</div>
                {!isFirstInnings && target && <div className="sc-sh-target">Tgt {target}</div>}
              </div>
              <div className="sc-sh-team sc-sh-right">
                <div className="sc-sh-info sc-sh-right-info">
                  <div className="sc-sh-name">{match.bowlingTeam}</div>
                  <div className="sc-sh-sub">Bowling</div>
                </div>
                <div className="sc-sh-avatar sc-avatar-bwl">{getInitials(match.bowlingTeam)}</div>
              </div>
            </div>

            {/* Rate bar */}
            <div className="sc-rate-bar">
              <div className="sc-rate-item">
                <span className="sc-rate-val">{crr}</span>
                <span className="sc-rate-lbl">CRR</span>
              </div>
              {rrr && (
                <div className="sc-rate-item sc-rate-rrr">
                  <span className="sc-rate-val">{rrr}</span>
                  <span className="sc-rate-lbl">RRR</span>
                </div>
              )}
              <div className="sc-rate-item">
                <span className="sc-rate-val">{partnership}</span>
                <span className="sc-rate-lbl">P'ship</span>
              </div>
              {runsNeeded !== null && !targetChased && (
                <div className="sc-rate-item sc-rate-need">
                  <span className="sc-rate-val">{runsNeeded}</span>
                  <span className="sc-rate-lbl">Needed</span>
                </div>
              )}
            </div>

            {/* Professional scorecard */}
            <div className="sc-scorecard">
              {/* Batters table */}
              <div className="sc-sc-section">
                <div className="sc-sc-header">
                  <span className="sc-sc-title">BATTERS</span>
                  <div className="sc-sc-cols">
                    <span>R</span><span>B</span><span>4s</span><span>6s</span><span>SR</span>
                  </div>
                </div>
                {[strikerStats, nonStrikerStats].map((b, idx) => (
                  <div key={idx} className={`sc-batter-row ${b.isStriker ? 'sc-row-striker' : ''}`}>
                    <div className="sc-batter-name">
                      {b.isStriker && <span className="sc-strike-indicator">⚡</span>}
                      <span className="sc-player-nm">
                        {b.name || (b.isStriker ? 'Striker' : 'Non-Striker')}
                        {b.isStriker && <span className="sc-star">*</span>}
                      </span>
                    </div>
                    <div className="sc-sc-cols">
                      <span className="sc-stat-runs">{b.runs}</span>
                      <span>{b.balls}</span>
                      <span className="sc-stat-four">{b.fours}</span>
                      <span className="sc-stat-six">{b.sixes}</span>
                      <span className={`sc-sr ${Number(fmtSR(b.runs, b.balls)) >= 150 ? 'sc-sr-high' : Number(fmtSR(b.runs, b.balls)) >= 100 ? 'sc-sr-ok' : 'sc-sr-low'}`}>
                        {fmtSR(b.runs, b.balls)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bowler table — current bowler + all previous bowlers */}
              <div className="sc-sc-section sc-bowler-section">
                <div className="sc-sc-header">
                  <span className="sc-sc-title">
                    BOWLING
                    {match.oversPerBowler && <span className="sc-bowl-limit-badge"> · max {match.oversPerBowler}ov</span>}
                  </span>
                  <div className="sc-sc-cols sc-bowl-cols">
                    <span>O</span><span>R</span><span>W</span><span>ECON</span>
                  </div>
                </div>
                <div className="sc-bowler-row sc-row-current-bowler">
                  <div className="sc-batter-name">
                    <span className="sc-bowl-marker">🎯</span>
                    <span className="sc-player-nm">{bowlerStats.name || 'Bowler'}</span>
                  </div>
                  <div className="sc-sc-cols sc-bowl-cols">
                    <span>
                      {bowlerStats.overs}.{bowlerStats.balls}
                      {match.oversPerBowler && <span className="sc-bowl-ov-cap">/{match.oversPerBowler}</span>}
                    </span>
                    <span>{bowlerStats.runs}</span>
                    <span className="sc-stat-wkt">{bowlerStats.wickets}</span>
                    <span>{fmtEcon(bowlerStats.runs, bowlerStats.overs, bowlerStats.balls)}</span>
                  </div>
                </div>
                {bowlerLedger.filter(b => b.name !== bowlerStats.name).map((b, i) => (
                  <div key={i} className="sc-bowler-row sc-row-past-bowler">
                    <div className="sc-batter-name">
                      <span className="sc-player-nm">{b.name}</span>
                    </div>
                    <div className="sc-sc-cols sc-bowl-cols">
                      <span>
                        {b.overs}.{b.balls}
                        {match.oversPerBowler && <span className="sc-bowl-ov-cap">/{match.oversPerBowler}</span>}
                      </span>
                      <span>{b.runs}</span>
                      <span className="sc-stat-wkt">{b.wickets}</span>
                      <span>{fmtEcon(b.runs, b.overs, b.balls)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ball entry */}
            {!inningsOver && (
              <div className="sc-ball-entry">
                <div className="sc-entry-header">
                  <span className="sc-section-title">Ball Entry</span>
                  <button
                    className="sc-undo-btn"
                    onClick={handleUndo}
                    disabled={scoreHistory.length === 0 || saving}
                    title="Undo last ball entry"
                  >
                    ↩ Undo
                    {scoreHistory.length > 0 && <span className="sc-undo-count">{scoreHistory.length}</span>}
                  </button>
                </div>
                <div className="sc-run-row">
                  {([0, 1, 2, 3, 4, 6] as const).map(r => (
                    <button key={r} className={`sc-run-btn sc-run-${r}`}
                      onClick={() => addRuns(r, true, r === 0 ? 'dot' : r === 4 ? 'four' : r === 6 ? 'six' : 'run')}
                      disabled={saving}>
                      {r === 0 ? '•' : r === 6 ? '6!' : `+${r}`}
                    </button>
                  ))}
                  <button className="sc-run-btn sc-wicket" onClick={addWicket} disabled={saving}>W</button>
                  <button className="sc-run-btn sc-wide" onClick={() => addRuns(1, false, 'wide')} disabled={saving} title="Wide: +1 run, ball doesn't count">Wd</button>
                  <button className="sc-run-btn sc-noball" onClick={() => addRuns(1, false, 'noball')} disabled={saving} title="No Ball: +1 run, ball doesn't count">NB</button>
                </div>
                {saving && <div className="sc-saving-txt">Saving…</div>}
                {maxOvers !== null && (
                  <div className="sc-overs-left">
                    {maxOvers - curOver} over{maxOvers - curOver !== 1 ? 's' : ''} remaining
                    {match.oversPerBowler ? ` · ${match.oversPerBowler} overs/bowler` : ''}
                  </div>
                )}
              </div>
            )}

            {/* ── Current over ball strip (relocated above the run chart) ── */}
            {setupDone && !inningsOver && (
              <div className="sc-cur-ov-strip">
                <div className="sc-cos-meta">
                  <span className="sc-cos-ov-num">OV {curOver + 1}</span>
                  <span className="sc-cos-runs">{currentOvRuns} runs</span>
                </div>
                <div className="sc-cos-balls">
                  {currentOvBalls.map((ball, i) => (
                    <span
                      key={i}
                      className={`sc-cos-ball sc-cos-${ball.type} ${i === currentOvBalls.length - 1 ? 'sc-cos-last' : ''}`}
                    >
                      {ball.display}
                    </span>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - legalInCurOv) }).map((_, i) => (
                    <span key={`e${i}`} className="sc-cos-ball sc-cos-empty">·</span>
                  ))}
                </div>
                {lastBall && (
                  <div className={`sc-cos-last-badge sc-cos-badge-${lastBall.type}`}>
                    {lastBall.type === 'wicket' ? 'WICKET!' : lastBall.type === 'four' ? 'FOUR!' : lastBall.type === 'six' ? 'SIX!' : lastBall.type === 'wide' ? 'WIDE' : lastBall.type === 'noball' ? 'NO BALL' : lastBall.runs === 0 ? 'DOT' : `${lastBall.runs} RUN${lastBall.runs !== 1 ? 'S' : ''}`}
                  </div>
                )}
              </div>
            )}

            {/* Over-by-over history (run chart) */}
            {eventLog.length > 0 && (
              <div className="sc-history-panel">
                <div className="sc-history-hdr" onClick={() => setShowHistory(s => !s)}>
                  <span className="sc-section-title" style={{ margin: 0 }}>Over History</span>
                  <div className="sc-history-meta">
                    <span className="sc-history-badge">{overGroups.length} over{overGroups.length !== 1 ? 's' : ''}</span>
                    <span className="sc-history-toggle">{showHistory ? '▲' : '▼'}</span>
                  </div>
                </div>
                {showHistory && (
                  <div className="sc-history-body">
                    {overGroups.map((group, ovIdx) => {
                      const legalInGroup = group.balls.filter(b => b.type !== 'wide' && b.type !== 'noball').length;
                      const emptySlots = group.isComplete ? 0 : Math.max(0, 6 - legalInGroup);
                      const bowlerForOver = group.isComplete ? overBowlers[ovIdx] : bowlerStats.name;
                      return (
                        <div key={ovIdx} className={`sc-ov-row ${!group.isComplete ? 'sc-ov-current' : ''}`}>
                          <div className="sc-ov-label">
                            <div className="sc-ov-num-row">
                              <span className="sc-ov-num">OV {ovIdx + 1}</span>
                              {!group.isComplete && <span className="sc-ov-live-dot" />}
                            </div>
                            {bowlerForOver && <span className="sc-ov-bowler-nm">{bowlerForOver}</span>}
                          </div>
                          <div className="sc-ov-balls">
                            {group.balls.map((ball, bi) => (
                              <span key={bi} className={`sc-ball sc-ball-${ball.type}`}>{ball.display}</span>
                            ))}
                            {Array.from({ length: emptySlots }).map((_, i) => (
                              <span key={`e${i}`} className="sc-ball sc-ball-empty">·</span>
                            ))}
                          </div>
                          <div className="sc-ov-total">
                            <span className="sc-ov-runs">{group.overRuns}</span>
                            <span className="sc-ov-label-sm">run{group.overRuns !== 1 ? 's' : ''}</span>
                            {group.overWkts > 0 && <span className="sc-ov-wkts">{group.overWkts}W</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="sc-end-row">
              <button className="sc-end-btn" onClick={() => setShowEndConfirm(true)}>
                🏁 End Match &amp; Declare Winner
              </button>
            </div>

            {/* Over-complete popup */}
            {overSummary && (
              <div className="sc-popup-overlay" onClick={() => setOverSummary(null)}>
                <div className="sc-over-popup" onClick={e => e.stopPropagation()}>
                  <div className="sc-ovp-badge">OVER {overSummary.overNum} COMPLETE</div>
                  <div className="sc-ovp-stats">
                    <div className="sc-ovp-stat"><div className="sc-ovp-val">{overSummary.runs}</div><div className="sc-ovp-lbl">Runs</div></div>
                    <div className="sc-ovp-divider" />
                    <div className="sc-ovp-stat"><div className="sc-ovp-val sc-ovp-wkt">{overSummary.wickets}</div><div className="sc-ovp-lbl">Wickets</div></div>
                    <div className="sc-ovp-divider" />
                    <div className="sc-ovp-stat"><div className="sc-ovp-val">{maxOvers ? `${maxOvers - overSummary.overNum}` : '—'}</div><div className="sc-ovp-lbl">Left</div></div>
                  </div>
                  <div className="sc-ovp-bowler-row">
                    {overBowlers.length > 0 && (
                      <div className="sc-bowler-hist">
                        <div className="sc-pf-label">Previous bowlers</div>
                        <div className="sc-bowler-chips">
                          {[...new Set(overBowlers)].map(name => {
                            const ledOvs = bowlerLedger.find(b => b.name === name)?.overs ?? 0;
                            const curOvs = bowlerStats.name === name ? bowlerStats.overs : 0;
                            const totalOvs = ledOvs + curOvs;
                            const isJustBowled = name === bowlerStats.name;
                            const isAtLimit = !!(match.oversPerBowler && totalOvs >= match.oversPerBowler);
                            const disabled = isJustBowled || isAtLimit;
                            return (
                              <button
                                key={name}
                                className={`sc-bowler-chip ${newBowlerInput === name ? 'sc-chip-sel' : ''} ${disabled ? 'sc-chip-disabled' : ''}`}
                                onClick={() => { if (!disabled) setNewBowlerInput(name); }}
                                disabled={disabled}
                              >
                                {name}
                                {match.oversPerBowler
                                  ? <span className="sc-chip-overs"> {totalOvs}/{match.oversPerBowler}</span>
                                  : totalOvs > 0 ? <span className="sc-chip-overs"> {totalOvs}ov</span> : null}
                              </button>
                            );
                          })}
                        </div>
                        <div className="sc-bowler-hist-note">Last bowler cannot bowl consecutive overs</div>
                      </div>
                    )}
                    <label className="sc-pf-label">🎯 New Bowler</label>
                    <input className="sc-pf-input" placeholder="Enter bowler name…" value={newBowlerInput}
                      onChange={e => setNewBowlerInput(e.target.value)} autoFocus />
                  </div>
                  {(() => {
                    const t = newBowlerInput.trim();
                    const isSame = t === bowlerStats.name;
                    const ledOvs = bowlerLedger.find(b => b.name === t)?.overs ?? 0;
                    const curOvs = bowlerStats.name === t ? bowlerStats.overs : 0;
                    const atLimit = !!(match.oversPerBowler && (ledOvs + curOvs) >= match.oversPerBowler);
                    const blocked = isSame || atLimit;
                    return (
                      <button className="sc-ovp-done-btn" disabled={blocked} onClick={() => {
                        if (blocked) return;
                        setBowlerLedger(prev => mergeIntoBowlerLedger(prev, bowlerStats));
                        if (t) setBowlerStats({ name: t, overs: 0, balls: 0, runs: 0, wickets: 0 });
                        setOverSummary(null);
                      }}>
                        {isSame ? '✗ Same bowler can\'t bowl consecutive overs'
                          : atLimit ? `✗ ${t} has reached their over limit`
                          : t ? `✓ ${t} to bowl next` : 'Continue →'}
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* New-batsman popup */}
            {showNewBatsman && (
              <div className="sc-popup-overlay" onClick={() => setShowNewBatsman(false)}>
                <div className="sc-over-popup" onClick={e => e.stopPropagation()}>
                  <div className="sc-ovp-badge sc-ovp-wicket-badge">WICKET!</div>
                  <p className="sc-ovp-sub">Who's the new batsman coming in?</p>
                  <input className="sc-pf-input sc-pf-input-lg" placeholder="New batsman name…"
                    value={newBatsmanInput} onChange={e => setNewBatsmanInput(e.target.value)} autoFocus />
                  <button className="sc-ovp-done-btn" onClick={() => {
                    const newName = newBatsmanInput.trim();
                    if (newName) {
                      // Replace the dismissed batter (identified by isOut, not isStriker —
                      // isStriker may have been swapped already on end-of-over wickets)
                      if (batter1.isOut) setBatter1(makeBlankBatter(newName, batter1.isStriker));
                      else               setBatter2(makeBlankBatter(newName, batter2.isStriker));
                    }
                    setShowNewBatsman(false); setNewBatsmanInput('');
                    // If this was a wicket on the last ball, now show the new-bowler popup
                    if (pendingOverSummary) {
                      setOverSummary(pendingOverSummary);
                      setPendingOverSummary(null);
                    }
                  }}>
                    {newBatsmanInput.trim() ? `✓ ${newBatsmanInput} to bat` : 'Skip'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Winner declaration */}
        {showEndConfirm && (
          <div className="sc-end-confirm">
            <div className="sc-trophy">🏆</div>
            <h3>Declare Match Winner</h3>
            <p>Select the winning team:</p>
            <div className="sc-winner-pick">
              <div className={`sc-winner-team ${winner === 'team1' ? 'picked' : ''}`} onClick={() => setWinner('team1')}>
                <div className="sc-wp-avatar sc-avatar-t1">{getInitials(match.team1Name)}</div>
                <div className="sc-wp-name">{match.team1Name}</div>
                <div className="sc-wp-score">{score.team1Score ?? 0}/{score.team1Wickets ?? 0}</div>
              </div>
              <div className="sc-wp-vs">VS</div>
              <div className={`sc-winner-team ${winner === 'team2' ? 'picked' : ''}`} onClick={() => setWinner('team2')}>
                <div className="sc-wp-avatar sc-avatar-t2">{getInitials(match.team2Name)}</div>
                <div className="sc-wp-name">{match.team2Name}</div>
                <div className="sc-wp-score">{score.team2Score ?? 0}/{score.team2Wickets ?? 0}</div>
              </div>
            </div>
            <button
              className={`sc-tie-option ${winner === 'tie' ? 'sc-tie-picked' : ''}`}
              onClick={() => setWinner('tie')}
            >
              🤝 Match Tied (no winner)
            </button>
            {!winner && <p className="sc-pick-hint">Tap a team above, or choose “Match Tied”</p>}
            <div className="sc-end-actions">
              <button className="sc-confirm-btn" onClick={handleEndMatch} disabled={!winner || saving}>
                {saving ? 'Saving…'
                  : winner === 'tie' ? '🤝 Declare Match Tied'
                  : winner ? `🏆 ${winner === 'team1' ? match.team1Name : match.team2Name} Wins!`
                  : 'Select a result first'}
              </button>
              <button className="sc-back-btn" onClick={() => setShowEndConfirm(false)}>← Back to Scoring</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Match Card ───────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: LocalMatch;
  deleting: boolean;
  canScore: boolean;
  onStart: () => void;
  onOpenScorecard: () => void;
  onWatch: () => void;
  onDelete: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, deleting, canScore, onStart, onOpenScorecard, onWatch, onDelete }) => {
  const isLive = match.status === 'LIVE';
  const isDone = match.status === 'COMPLETED';
  const isUp = match.status === 'UPCOMING';
  const isBatTeam1 = match.battingTeam === match.team1Name;

  const target = isLive && match.currentInnings === 2
    ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1)
    : null;

  const ballIcon = match.ballType === 'Leather' ? '🔴'
    : match.ballType === 'Other' ? '🟡' : '🎾';

  return (
    <div className={`mc-card ${isLive ? 'mc-live' : isDone ? 'mc-done' : ''}`}>

      {/* Top strip */}
      <div className="mc-top">
        <div className="mc-status-group">
          {isLive && <span className="mc-live-dot" />}
          <span className={`mc-status ${isLive ? 'mc-s-live' : isDone ? 'mc-s-done' : 'mc-s-up'}`}>
            {isLive ? 'LIVE' : isDone ? 'COMPLETED' : 'UPCOMING'}
          </span>
        </div>
        <div className="mc-tags">
          <span className="mc-format-tag">{match.matchFormat}</span>
          {match.totalOvers && <span className="mc-overs-tag">{match.totalOvers} ov</span>}
          {match.ballType && <span className="mc-ball-tag">{ballIcon}</span>}
          {isLive && match.currentInnings === 2 && <span className="mc-inn-tag">2nd Inn</span>}
        </div>
      </div>

      {/* Teams scoreboard */}
      <div className="mc-scoreboard">
        <div className="mc-team-col">
          <div className={`mc-avatar mc-av-t1`}>{getInitials(match.team1Name)}</div>
          <div className="mc-team-name">{match.team1Name}</div>
          <div className="mc-bat-tag">{isBatTeam1 ? '🏏 BAT' : '🎯 BOWL'}</div>
          {(isLive || isDone) && (
            <div className="mc-score">{match.team1Score}<span className="mc-wkt-sep">/</span>{match.team1Wickets}</div>
          )}
        </div>

        <div className="mc-mid">
          <div className="mc-vs-badge">VS</div>
          {(isLive || isDone) && (
            <div className="mc-over-badge">
              {match.currentOver}.{match.currentBall}
              {match.totalOvers ? `/${match.totalOvers}` : ''}
            </div>
          )}
          {target !== null && <div className="mc-target-badge">Tgt {target}</div>}
        </div>

        <div className="mc-team-col mc-team-right">
          <div className="mc-avatar mc-av-t2">{getInitials(match.team2Name)}</div>
          <div className="mc-team-name">{match.team2Name}</div>
          <div className="mc-bat-tag">{!isBatTeam1 ? '🏏 BAT' : '🎯 BOWL'}</div>
          {(isLive || isDone) && (
            <div className="mc-score">{match.team2Score}<span className="mc-wkt-sep">/</span>{match.team2Wickets}</div>
          )}
        </div>
      </div>

      {/* Winner / tie banner */}
      {isDone && (
        match.winnerName
          ? <div className="mc-winner">🏆 {match.winnerName} won!</div>
          : <div className="mc-winner mc-tie">🤝 Match Tied!</div>
      )}

      {/* Meta */}
      <div className="mc-meta">
        {match.matchCode && (
          <span className="mc-id-pill" title="Share this code so others can watch live">
            🔑 {match.matchCode}
          </span>
        )}
        {match.location && match.location !== 'Local Ground' && (
          <span>📍 {match.location}</span>
        )}
        {match.matchDate && (
          <span>
            🗓 {new Date(match.matchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mc-actions">
        {isUp && canScore && (
          <button className="mc-btn mc-btn-start" onClick={onStart}>▶ Start Match</button>
        )}
        {isUp && !canScore && (
          <button className="mc-btn mc-btn-locked" disabled>🔒 Owner only</button>
        )}
        {isLive && canScore && (
          <button className="mc-btn mc-btn-score" onClick={onOpenScorecard}>📊 Score Live</button>
        )}
        {isLive && !canScore && (
          <button className="mc-btn mc-btn-watch" onClick={onWatch}>👁 Watch Live</button>
        )}
        {isDone && (
          <button className="mc-btn mc-btn-view" onClick={onOpenScorecard}>📋 Scorecard</button>
        )}
        {!isLive && canScore && (
          <button className="mc-btn mc-btn-del" onClick={onDelete} disabled={deleting}>
            {deleting ? '…' : '🗑'}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Create Match Form ────────────────────────────────────────────────────────
interface CreateFormProps {
  onCreated: (m: LocalMatch) => void;
  onCancel: () => void;
}

const CreateMatchForm: React.FC<CreateFormProps> = ({ onCreated, onCancel }) => {
  const [form, setForm] = useState<CreateLocalMatchRequest>(BLANK_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      if (name === 'battingTeamId') return { ...prev, battingTeamId: parseInt(value) };
      if (name === 'numberOfOvers') return { ...prev, numberOfOvers: value ? parseInt(value) : undefined };
      if (name === 'oversPerBowler') return { ...prev, oversPerBowler: value ? parseInt(value) : undefined };
      return { ...prev, [name]: value };
    });
  };

  const selectFormat = (fmt: string) => {
    setForm(prev => ({
      ...prev,
      matchFormat: fmt,
      numberOfOvers: FORMAT_DEFAULT_OVERS[fmt],
      oversPerBowler: fmt === 'T20' ? 4 : fmt === 'ODI' ? 10 : undefined,
    }));
  };

  const selectBallType = (bt: string) => setForm(prev => ({ ...prev, ballType: bt }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.team1Name.trim() || !form.team2Name.trim()) {
      setError('Both team names are required'); return;
    }
    if (form.team1Name.trim().toLowerCase() === form.team2Name.trim().toLowerCase()) {
      setError('Team names must be different'); return;
    }
    try {
      setSubmitting(true); setError('');
      const created = await localMatchService.createLocalMatch(form);
      onCreated(created);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create match');
    } finally {
      setSubmitting(false);
    }
  };

  const t1Init = form.team1Name ? getInitials(form.team1Name) : 'T1';
  const t2Init = form.team2Name ? getInitials(form.team2Name) : 'T2';

  return (
    <form className="cf-wrap" onSubmit={handleSubmit}>
      {/* Form header */}
      <div className="cf-header">
        <h2 className="cf-title">Create New Match</h2>
        <button type="button" className="cf-close-btn" onClick={onCancel}>✕</button>
      </div>

      {error && <div className="cf-error">{error}</div>}

      {/* ── Teams ── */}
      <div className="cf-section">
        <div className="cf-teams-row">
          <div className="cf-team-block">
            <div className="cf-avatar cf-av-1">{t1Init}</div>
            <input
              className="cf-team-input"
              type="text"
              name="team1Name"
              placeholder="Team 1 name"
              value={form.team1Name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="cf-vs-wrap">
            <div className="cf-vs-diamond">
              <span>vs</span>
            </div>
          </div>

          <div className="cf-team-block">
            <div className="cf-avatar cf-av-2">{t2Init}</div>
            <input
              className="cf-team-input"
              type="text"
              name="team2Name"
              placeholder="Team 2 name"
              value={form.team2Name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* ── Match Type ── */}
      <div className="cf-section">
        <div className="cf-label">Match Type</div>
        <div className="cf-format-row">
          {['T20', 'ODI', 'Test', 'Friendly'].map(fmt => (
            <button
              key={fmt}
              type="button"
              className={`cf-format-pill ${form.matchFormat === fmt ? 'cf-fmt-active' : ''}`}
              onClick={() => selectFormat(fmt)}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overs ── */}
      <div className="cf-section">
        <div className="cf-overs-row">
          <div className="cf-overs-field">
            <div className="cf-label">No. of Overs</div>
            <input
              className="cf-overs-input"
              type="number"
              name="numberOfOvers"
              min="1"
              max="100"
              placeholder="—"
              value={form.numberOfOvers ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className="cf-overs-field">
            <div className="cf-label">Overs per Bowler</div>
            <input
              className="cf-overs-input"
              type="number"
              name="oversPerBowler"
              min="1"
              max="50"
              placeholder="—"
              value={form.oversPerBowler ?? ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ── Toss ── */}
      {(form.team1Name || form.team2Name) && (
        <div className="cf-section">
          <div className="cf-label">Toss — Who Bats First?</div>
          <div className="cf-toss-row">
            <label className={`cf-toss-opt ${form.battingTeamId === 1 ? 'cf-toss-sel' : ''}`}>
              <input type="radio" name="battingTeamId" value="1"
                checked={form.battingTeamId === 1} onChange={handleChange} />
              <div className="cf-toss-av cf-toss-av1">{t1Init}</div>
              <span className="cf-toss-name">{form.team1Name || 'Team 1'}</span>
              <span className="cf-toss-sub">Bats First</span>
            </label>
            <label className={`cf-toss-opt ${form.battingTeamId === 2 ? 'cf-toss-sel' : ''}`}>
              <input type="radio" name="battingTeamId" value="2"
                checked={form.battingTeamId === 2} onChange={handleChange} />
              <div className="cf-toss-av cf-toss-av2">{t2Init}</div>
              <span className="cf-toss-name">{form.team2Name || 'Team 2'}</span>
              <span className="cf-toss-sub">Bats First</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Venue & Date ── */}
      <div className="cf-section">
        <div className="cf-venue-row">
          <div className="cf-venue-field">
            <div className="cf-field-label">Ground / Venue</div>
            <input
              className="cf-line-input"
              type="text"
              name="location"
              placeholder="e.g., Wankhede Stadium"
              value={form.location}
              onChange={handleChange}
            />
          </div>
          <div className="cf-venue-field">
            <div className="cf-field-label">Date &amp; Time</div>
            <input
              className="cf-line-input"
              type="datetime-local"
              name="matchDate"
              value={form.matchDate || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ── Ball Type ── */}
      <div className="cf-section">
        <div className="cf-label">Ball Type</div>
        <div className="cf-ball-row">
          {BALL_TYPES.map(bt => (
            <label
              key={bt.value}
              className={`cf-ball-opt ${form.ballType === bt.value ? 'cf-ball-sel' : ''}`}
              onClick={() => selectBallType(bt.value)}
            >
              <input
                type="radio" name="ballType" value={bt.value}
                checked={form.ballType === bt.value}
                onChange={() => selectBallType(bt.value)}
              />
              <div
                className="cf-ball-circle"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${bt.color}dd, ${bt.color}66)`,
                  boxShadow: form.ballType === bt.value ? `0 0 14px ${bt.shadow}` : 'none',
                }}
              />
              <span className="cf-ball-label">{bt.value}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="cf-section">
        <div className="cf-field-label">Notes (optional)</div>
        <textarea
          className="cf-line-input cf-notes"
          name="description"
          rows={2}
          placeholder="Any notes about this match…"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      {/* ── Actions ── */}
      <div className="cf-actions">
        <button type="button" className="cf-cancel-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="cf-create-btn" disabled={submitting}>
          {submitting ? 'Creating…' : '🚀 Create Match'}
        </button>
      </div>
    </form>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const LocalMatchPage: React.FC = () => {
  const [matches, setMatches] = useState<LocalMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [activeMatch, setActiveMatch] = useState<LocalMatch | null>(null);
  const [watchMatch, setWatchMatch] = useState<LocalMatch | null>(null);
  const [celebrationMatch, setCelebrationMatch] = useState<LocalMatch | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Current user's email — used to decide who may score (own) vs only watch a match
  const currentUserEmail: string = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw).email ?? '') : '';
    } catch { return ''; }
  })();
  // A match is editable only by its creator. Legacy matches (no owner) stay open.
  const canScoreMatch = (m: LocalMatch): boolean =>
    !m.createdByEmail || m.createdByEmail.toLowerCase() === currentUserEmail.toLowerCase();
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('crickmax_theme') as 'dark' | 'light') || 'dark'
  );

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crickmax_theme', next);
  };

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true); setError('');
      // Own matches only — this list is the user's private history.
      const data = await localMatchService.getMyLocalMatches();
      setMatches(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load matches. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleCreated = (m: LocalMatch) => {
    setMatches(prev => [m, ...prev]);
    setShowForm(false);
  };

  const handleStartMatch = async (id: number) => {
    try {
      const started = await localMatchService.startMatch(id);
      setMatches(prev => prev.map(m => m.id === id ? started : m));
      setActiveMatch(started);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start match');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this match? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await localMatchService.deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete match');
    } finally {
      setDeletingId(null);
    }
  };

  const handleScoreUpdate = (updated: LocalMatch) => {
    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
    setActiveMatch(updated);
  };

  const handleMatchEnded = (ended: LocalMatch) => {
    setMatches(prev => prev.map(m => m.id === ended.id ? ended : m));
    setActiveMatch(null);
    setCelebrationMatch(ended);
  };

  const filtered = statusFilter === 'ALL' ? matches : matches.filter(m => m.status === statusFilter);
  const counts = {
    ALL: matches.length,
    UPCOMING: matches.filter(m => m.status === 'UPCOMING').length,
    LIVE: matches.filter(m => m.status === 'LIVE').length,
    COMPLETED: matches.filter(m => m.status === 'COMPLETED').length,
  };

  if (!localStorage.getItem('token')) {
    return (
      <div className="lm-page" data-theme={theme}>
        <div className="lm-auth-wall">
          <div className="lm-auth-icon">🔒</div>
          <h2>Login Required</h2>
          <p>Please login to manage local matches</p>
          <Link to="/login" className="lm-btn lm-btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lm-page" data-theme={theme}>
      {/* Win Celebration */}
      {celebrationMatch && (
        <WinCelebration
          match={celebrationMatch}
          onViewScorecard={() => { setActiveMatch(celebrationMatch); setCelebrationMatch(null); }}
          onClose={() => setCelebrationMatch(null)}
        />
      )}
      {/* Modals */}
      {activeMatch?.status === 'LIVE' && (
        <ScoreModal
          match={activeMatch}
          onClose={() => setActiveMatch(null)}
          onUpdate={handleScoreUpdate}
          onEndMatch={handleMatchEnded}
        />
      )}
      {activeMatch?.status === 'COMPLETED' && (
        <CompletedScorecard match={activeMatch} onClose={() => setActiveMatch(null)} />
      )}
      {watchMatch && (
        <WatchModal match={watchMatch} onClose={() => setWatchMatch(null)} />
      )}

      {/* Hero */}
      <div className="lm-hero">
        <div className="lm-hero-inner">
          <div className="lm-hero-text">
            <div className="lm-hero-badge">🏏 CRICKET</div>
            <h1 className="lm-hero-title">Local Matches</h1>
            <p className="lm-hero-sub">Set up, score and manage your matches in real time</p>
          </div>
          <div className="lm-hero-btns">
            <button
              className={`lm-btn ${showForm ? 'lm-btn-outline' : 'lm-btn-primary'}`}
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? '✕ Cancel' : '+ New Match'}
            </button>
            <button className="lm-btn lm-btn-ghost" onClick={fetchMatches} disabled={loading}>
              ↻
            </button>
            <button
              className="lm-btn lm-btn-theme"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀' : '☽'}
            </button>
          </div>
        </div>

      </div>

      {/* Create form */}
      {showForm && <CreateMatchForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      {/* Error */}
      {error && (
        <div className="lm-error-bar">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="lm-tabs">
        {(['ALL', 'UPCOMING', 'LIVE', 'COMPLETED'] as StatusFilter[]).map(s => (
          <button
            key={s}
            className={`lm-tab ${statusFilter === s ? 'lm-tab-active' : ''} lm-tab-${s.toLowerCase()}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'LIVE' && <span className="lm-tab-dot" />}
            {s === 'ALL' ? 'All' : s === 'UPCOMING' ? 'Upcoming' : s === 'LIVE' ? 'Live' : 'Completed'}
            <span className="lm-tab-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Matches */}
      {loading ? (
        <div className="lm-loading">
          <div className="lm-spinner" />
          <p>Loading matches…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lm-empty">
          <div className="lm-empty-icon">🏏</div>
          <h3>{statusFilter === 'ALL' ? 'No matches yet' : `No ${statusFilter.toLowerCase()} matches`}</h3>
          <p>{statusFilter === 'ALL' ? 'Create your first local match!' : 'Switch to All or create a match.'}</p>
          {statusFilter === 'ALL' && (
            <button className="lm-btn lm-btn-primary" onClick={() => setShowForm(true)}>
              + Create First Match
            </button>
          )}
        </div>
      ) : (
        <div className="lm-grid">
          {filtered.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              deleting={deletingId === match.id}
              canScore={canScoreMatch(match)}
              onStart={() => handleStartMatch(match.id)}
              onOpenScorecard={() => setActiveMatch(match)}
              onWatch={() => setWatchMatch(match)}
              onDelete={() => handleDelete(match.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalMatchPage;
