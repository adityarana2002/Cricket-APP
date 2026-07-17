import React, { useEffect, useState } from 'react';
import { localMatchService, LocalMatch } from '../services/localMatchService';
import { getInitials } from '../utils/initials';
// The lm-*/sc-*/wm-* class names this modal renders are defined alongside the
// scorer styles, so the sheet is imported here to keep the component standalone.
import '../pages/LocalMatchPage.css';

interface WatchModalProps {
  match: LocalMatch;
  onClose: () => void;
}

/**
 * Read-only live viewer. Polls the score every 5s so spectators track the match
 * in near real time without any ability to edit it.
 *
 * Theming note: the light-theme rules for these classes are scoped under
 * `.lm-page[data-theme="light"]`, so render this inside an element carrying the
 * `lm-page` class and a `data-theme` attribute. Outside the local-match page,
 * wrap it in `<div className="lm-page lm-portal" data-theme={theme}>` — the
 * `lm-portal` modifier keeps the wrapper out of the host page's layout.
 */
const WatchModal: React.FC<WatchModalProps> = ({ match: initial, onClose }) => {
  const [match, setMatch] = useState<LocalMatch>(initial);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Poll the live score every 5s so spectators see updates in near real time.
  // Refetch by code, not id: the id endpoint is owner-only, and a spectator's
  // claim to this match is the code they supplied.
  const code = initial.matchCode;
  useEffect(() => {
    if (!code) return;
    let active = true;
    const poll = async () => {
      try {
        const fresh = await localMatchService.getLocalMatchByCode(code);
        if (active) { setMatch(fresh); setUpdatedAt(new Date()); }
      } catch { /* keep showing last known score */ }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => { active = false; clearInterval(iv); };
  }, [code]);

  const isBatTeam1 = match.battingTeam === match.team1Name;
  const batScore   = isBatTeam1 ? match.team1Score : match.team2Score;
  const batWkts    = isBatTeam1 ? match.team1Wickets : match.team2Wickets;
  const target     = match.currentInnings === 2
    ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1) : null;
  const runsNeeded = target !== null ? Math.max(0, target - batScore) : null;
  const totalBalls = match.currentOver * 6 + match.currentBall;
  const crr        = totalBalls > 0 ? ((batScore / totalBalls) * 6).toFixed(2) : '—';
  const isOver     = match.status === 'COMPLETED';

  return (
    <div className="lm-modal-overlay" onClick={onClose}>
      <div className="lm-modal sc-modal" onClick={e => e.stopPropagation()}>
        <div className="lm-modal-header">
          <div>
            <h2 className="lm-modal-title">
              {!isOver && <span className="live-dot" />}
              {isOver ? 'Match Result' : 'Watching Live'}
            </h2>
            <p className="lm-modal-sub">{match.team1Name} vs {match.team2Name} · {match.matchFormat}</p>
          </div>
          <button className="lm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wm-readonly-note">👁 View only — only the match creator can update the score</div>

        <div className="sc-score-header">
          <div className="sc-sh-team">
            <div className="sc-sh-avatar sc-avatar-bat">{getInitials(match.battingTeam)}</div>
            <div className="sc-sh-info">
              <div className="sc-sh-name">{match.battingTeam}</div>
              <div className="sc-sh-sub">Batting</div>
            </div>
          </div>
          <div className="sc-sh-center">
            <div className="sc-sh-big-score">{batScore}<span className="sc-sh-sep">/</span>{batWkts}</div>
            <div className="sc-sh-overs">{match.currentOver}.{match.currentBall}{match.totalOvers ? `/${match.totalOvers}` : ''} ov</div>
            {target && <div className="sc-sh-target">Tgt {target}</div>}
          </div>
          <div className="sc-sh-team sc-sh-right">
            <div className="sc-sh-info sc-sh-right-info">
              <div className="sc-sh-name">{match.bowlingTeam}</div>
              <div className="sc-sh-sub">Bowling</div>
            </div>
            <div className="sc-sh-avatar sc-avatar-bwl">{getInitials(match.bowlingTeam)}</div>
          </div>
        </div>

        <div className="sc-rate-bar">
          <div className="sc-rate-item">
            <span className="sc-rate-val">{crr}</span>
            <span className="sc-rate-lbl">CRR</span>
          </div>
          {runsNeeded !== null && !isOver && (
            <div className="sc-rate-item sc-rate-need">
              <span className="sc-rate-val">{runsNeeded}</span>
              <span className="sc-rate-lbl">Needed</span>
            </div>
          )}
        </div>

        {!isOver && (
          <div className="sc-live-panel">
            <div className="sc-lp-batters">
              <div className="sc-lp-batter sc-lp-striker">
                <div className="sc-lp-bat-left">
                  <div className="sc-lp-name-row">
                    <span className="sc-lp-bat-icon">🏏</span>
                    <span className="sc-lp-name">{match.striker || 'Striker'}</span>
                    <span className="sc-lp-star">*</span>
                  </div>
                </div>
              </div>
              <div className="sc-lp-batter sc-lp-ns">
                <div className="sc-lp-bat-left">
                  <div className="sc-lp-name-row">
                    <span className="sc-lp-name">{match.nonStriker || 'Non-striker'}</span>
                    <span className="sc-lp-ns-tag">non-striker</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sc-lp-bowler">
              <div className="sc-lp-bowl-left">
                <div className="sc-lp-name-row">
                  <span className="sc-lp-bowl-icon">🎯</span>
                  <span className="sc-lp-name">{match.currentBowler || 'Bowler'}</span>
                  <span className="sc-lp-ns-tag">bowling</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isOver && runsNeeded !== null && target !== null && (
          <div className="wm-chase">
            {match.battingTeam} need {runsNeeded} run{runsNeeded !== 1 ? 's' : ''} to win
          </div>
        )}

        {isOver && (
          <div className="wm-result-banner">
            {match.winnerName ? `🏆 ${match.winnerName} won the match!` : '🤝 Match Tied!'}
          </div>
        )}

        <div className="wm-footer">
          {isOver
            ? <span className="wm-updated">This match has ended</span>
            : updatedAt && (
                <span className="wm-updated">
                  ⟳ Auto-refreshing · updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
        </div>
      </div>
    </div>
  );
};

export default WatchModal;
