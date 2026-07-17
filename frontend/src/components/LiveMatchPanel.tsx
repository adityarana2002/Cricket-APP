import React, { useEffect, useState } from 'react';
import { localMatchService, LocalMatch } from '../services/localMatchService';
import { parseScoreState, groupEventsIntoOvers, BallEvent } from '../types/scorecard';
import { getInitials } from '../utils/initials';
import { BattingTable, BowlingTable, InningsSection } from './ScorecardTables';
import '../pages/LocalMatchPage.css';
import './LiveMatchPanel.css';

interface LiveMatchPanelProps {
  match: LocalMatch;
  theme: 'light' | 'dark';
  onClose: () => void;
}

const POLL_MS = 5000;

const ballClass = (e: BallEvent): string => {
  switch (e.type) {
    case 'wicket': return 'lmp-ball lmp-ball-w';
    case 'four':   return 'lmp-ball lmp-ball-4';
    case 'six':    return 'lmp-ball lmp-ball-6';
    case 'wide':
    case 'noball': return 'lmp-ball lmp-ball-x';
    case 'dot':    return 'lmp-ball lmp-ball-dot';
    default:       return 'lmp-ball';
  }
};

/**
 * Read-only live match view, rendered inline on the dashboard once a spectator
 * has supplied a match code. Refetches by code (the id endpoint is owner-only),
 * so the code the viewer typed remains their sole claim to the match.
 *
 * The scoreline comes from the match row; the scorecard and ball-by-ball detail
 * come from the scorer's snapshot (scoreState), which may legitimately be absent
 * — e.g. the scorer has not entered players yet, or is on an older client.
 */
const LiveMatchPanel: React.FC<LiveMatchPanelProps> = ({ match: initial, theme, onClose }) => {
  const [match, setMatch] = useState<LocalMatch>(initial);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [tab, setTab] = useState<'live' | 'scorecard'>('live');

  const code = initial.matchCode;

  useEffect(() => { setMatch(initial); }, [initial]);

  useEffect(() => {
    if (!code) return;
    let active = true;
    const poll = async () => {
      try {
        const fresh = await localMatchService.getLocalMatchByCode(code);
        if (active) { setMatch(fresh); setUpdatedAt(new Date()); }
      } catch { /* keep showing the last known score */ }
    };
    poll();
    const iv = setInterval(poll, POLL_MS);
    return () => { active = false; clearInterval(iv); };
  }, [code]);

  const isOver      = match.status === 'COMPLETED';
  const isBatTeam1  = match.battingTeam === match.team1Name;
  const batScore    = isBatTeam1 ? match.team1Score : match.team2Score;
  const batWkts     = isBatTeam1 ? match.team1Wickets : match.team2Wickets;
  const target      = match.currentInnings === 2
    ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1) : null;
  const runsNeeded  = target !== null ? Math.max(0, target - batScore) : null;
  const totalBalls  = match.currentOver * 6 + match.currentBall;
  const crr         = totalBalls > 0 ? ((batScore / totalBalls) * 6).toFixed(2) : '—';

  const state    = parseScoreState(match.scoreState);
  const overs    = state ? groupEventsIntoOvers(state.events) : [];
  const thisOver = overs.length ? overs[overs.length - 1] : [];
  const striker  = state?.batters.find(b => b.isStriker && !b.isOut);
  const nonStrik = state?.batters.find(b => !b.isStriker && !b.isOut);
  const bowler   = state?.bowlers.length ? state.bowlers[state.bowlers.length - 1] : null;

  const ballsLeft = match.totalOvers != null
    ? Math.max(0, match.totalOvers * 6 - totalBalls)
    : null;

  return (
    <div className="lm-page lm-portal" data-theme={theme}>
      <div className="lmp">

        {/* Header */}
        <div className="lmp-head">
          <div className="lmp-head-left">
            <span className={`lmp-status ${isOver ? 'lmp-status-done' : 'lmp-status-live'}`}>
              {!isOver && <span className="lmp-dot" />}
              {isOver ? 'FINAL' : 'LIVE'}
            </span>
            <span className="lmp-teams">{match.team1Name} vs {match.team2Name}</span>
            {match.matchCode && <span className="lmp-code">🔑 {match.matchCode}</span>}
          </div>
          <button className="lmp-close" onClick={onClose} aria-label="Stop watching">✕</button>
        </div>

        {/* Scoreline */}
        <div className="lmp-scoreline">
          <div className="lmp-side">
            <div className="lmp-av">{getInitials(match.battingTeam)}</div>
            <div className="lmp-side-txt">
              <div className="lmp-side-name">{match.battingTeam}</div>
              <div className="lmp-side-sub">Batting</div>
            </div>
          </div>

          <div className="lmp-figures">
            <div className="lmp-runs">
              {batScore}<span className="lmp-slash">/</span>{batWkts}
            </div>
            <div className="lmp-overs">
              {match.currentOver}.{match.currentBall}
              {match.totalOvers ? ` / ${match.totalOvers}` : ''} ov
            </div>
          </div>

          <div className="lmp-side lmp-side-r">
            <div className="lmp-side-txt lmp-side-txt-r">
              <div className="lmp-side-name">{match.bowlingTeam}</div>
              <div className="lmp-side-sub">Bowling</div>
            </div>
            <div className="lmp-av lmp-av-bowl">{getInitials(match.bowlingTeam)}</div>
          </div>
        </div>

        {/* Rates */}
        <div className="lmp-rates">
          <div className="lmp-rate"><span className="lmp-rate-v">{crr}</span><span className="lmp-rate-l">CRR</span></div>
          {target !== null && !isOver && (
            <div className="lmp-rate"><span className="lmp-rate-v">{target}</span><span className="lmp-rate-l">Target</span></div>
          )}
          {runsNeeded !== null && !isOver && (
            <div className="lmp-rate lmp-rate-need"><span className="lmp-rate-v">{runsNeeded}</span><span className="lmp-rate-l">Need</span></div>
          )}
          {ballsLeft !== null && !isOver && (
            <div className="lmp-rate"><span className="lmp-rate-v">{ballsLeft}</span><span className="lmp-rate-l">Balls left</span></div>
          )}
        </div>

        {isOver && (
          <div className="lmp-result">
            {match.winnerName ? `🏆 ${match.winnerName} won the match!` : '🤝 Match Tied!'}
          </div>
        )}
        {!isOver && runsNeeded !== null && (
          <div className="lmp-chase">
            {match.battingTeam} need {runsNeeded} run{runsNeeded !== 1 ? 's' : ''} to win
            {ballsLeft !== null && ballsLeft > 0 && ` from ${ballsLeft} ball${ballsLeft !== 1 ? 's' : ''}`}
          </div>
        )}

        {/* Tabs */}
        <div className="lmp-tabs">
          <button className={`lmp-tab ${tab === 'live' ? 'lmp-tab-on' : ''}`} onClick={() => setTab('live')}>
            Live
          </button>
          <button className={`lmp-tab ${tab === 'scorecard' ? 'lmp-tab-on' : ''}`} onClick={() => setTab('scorecard')}>
            Scorecard
          </button>
        </div>

        {/* No snapshot yet — the scoreline above is still accurate */}
        {!state && (
          <div className="lmp-empty">
            ⏳ Waiting for the scorer — detailed scorecard appears once scoring starts.
          </div>
        )}

        {state && tab === 'live' && (
          <>
            <div className="lmp-crease">
              <div className="lmp-crease-row">
                <span className="lmp-crease-name">
                  🏏 {striker?.name || '—'}<span className="lmp-star">*</span>
                </span>
                <span className="lmp-crease-fig">
                  {striker ? `${striker.runs} (${striker.balls})` : '—'}
                </span>
              </div>
              <div className="lmp-crease-row">
                <span className="lmp-crease-name">{nonStrik?.name || '—'}</span>
                <span className="lmp-crease-fig">
                  {nonStrik ? `${nonStrik.runs} (${nonStrik.balls})` : '—'}
                </span>
              </div>
              <div className="lmp-crease-row lmp-crease-bowl">
                <span className="lmp-crease-name">🎯 {bowler?.name || '—'}</span>
                <span className="lmp-crease-fig">
                  {bowler ? `${bowler.overs}.${bowler.balls}–${bowler.runs}–${bowler.wickets}` : '—'}
                </span>
              </div>
            </div>

            <div className="lmp-over">
              <div className="lmp-over-lbl">This over</div>
              <div className="lmp-over-balls">
                {thisOver.length === 0
                  ? <span className="lmp-over-none">No balls bowled yet</span>
                  : thisOver.map((e, i) => (
                      <span key={i} className={ballClass(e)}>{e.display}</span>
                    ))}
              </div>
            </div>

            {overs.length > 1 && (
              <div className="lmp-over">
                <div className="lmp-over-lbl">Recent overs</div>
                <div className="lmp-hist">
                  {overs.slice(0, -1).slice(-6).map((ov, i) => {
                    const runs = ov.reduce((s, b) => s + b.runs, 0);
                    const wkts = ov.filter(b => b.type === 'wicket').length;
                    return (
                      <span key={i} className="lmp-hist-ov">
                        <span className="lmp-hist-runs">{runs}</span>
                        {wkts > 0 && <span className="lmp-hist-w">{wkts}w</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {state && tab === 'scorecard' && (
          <div className="lmp-card">
            {state.innings1 && (
              <InningsSection data={state.innings1} label="1st Innings" />
            )}
            <div className="cs-innings-block">
              <div className="cs-inn-header">
                <span className="cs-inn-label">
                  {state.innings === 2 ? '2nd Innings' : '1st Innings'}
                </span>
                <span className="cs-inn-score">
                  {state.battingTeam} — {batScore}/{batWkts}
                </span>
              </div>
              <div className="cs-section">
                <div className="cs-section-title">Batting</div>
                <BattingTable batters={state.batters} />
              </div>
              <div className="cs-section">
                <div className="cs-section-title">Bowling</div>
                <BowlingTable bowlers={state.bowlers} />
              </div>
            </div>
          </div>
        )}

        <div className="lmp-foot">
          {isOver
            ? <span>This match has ended</span>
            : updatedAt && (
                <span>
                  ⟳ Auto-refreshing · updated {updatedAt.toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                </span>
              )}
        </div>

      </div>
    </div>
  );
};

export default LiveMatchPanel;
