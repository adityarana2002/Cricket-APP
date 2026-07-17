import React from 'react';
import { BatterStats, BowlerStats, InningsData } from '../types/scorecard';
// cs-* classes live alongside the scorer styles; imported so this stays standalone.
import '../pages/LocalMatchPage.css';

/**
 * Batting/bowling scorecard tables, shared by the completed-match scorecard and
 * the read-only live viewer so both render a match identically.
 *
 * Theming note: the light-theme rules for cs-* are scoped under
 * `.lm-page[data-theme="light"]`. Render these inside an element carrying the
 * `lm-page` class and a `data-theme` attribute (use the `lm-portal` modifier
 * outside the local-match page).
 */

export const strikeRate = (runs: number, balls: number): string =>
  balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';

export const economy = (runs: number, overs: number, balls: number): string => {
  const totalBalls = overs * 6 + balls;
  return totalBalls > 0 ? ((runs / totalBalls) * 6).toFixed(1) : '—';
};

export const BattingTable: React.FC<{ batters: BatterStats[] }> = ({ batters }) => (
  <div className="cs-table-wrap">
    <div className="cs-table-head cs-bat-cols">
      <span className="cs-col-name">Batter</span>
      <span>R</span><span>B</span><span>4s</span><span>6s</span><span>SR</span>
    </div>
    {batters.filter(b => b.name).map((b, i) => (
      <div key={`${b.name}-${i}`} className={`cs-table-row cs-bat-cols ${!b.isOut ? 'cs-not-out' : ''}`}>
        <span className="cs-col-name">
          {b.name}{!b.isOut && <span className="cs-notout-star">*</span>}
        </span>
        <span className="cs-stat-runs">{b.runs}</span>
        <span>{b.balls}</span>
        <span className="cs-stat-four">{b.fours}</span>
        <span className="cs-stat-six">{b.sixes}</span>
        <span>{strikeRate(b.runs, b.balls)}</span>
      </div>
    ))}
  </div>
);

export const BowlingTable: React.FC<{ bowlers: BowlerStats[] }> = ({ bowlers }) => (
  <div className="cs-table-wrap">
    <div className="cs-table-head cs-bowl-cols">
      <span className="cs-col-name">Bowler</span>
      <span>O</span><span>R</span><span>W</span><span>ECON</span>
    </div>
    {bowlers.filter(b => b.name).map((b, i) => (
      <div key={`${b.name}-${i}`} className="cs-table-row cs-bowl-cols">
        <span className="cs-col-name">{b.name}</span>
        <span>{b.overs}.{b.balls}</span>
        <span>{b.runs}</span>
        <span className="cs-stat-wkt">{b.wickets}</span>
        <span>{economy(b.runs, b.overs, b.balls)}</span>
      </div>
    ))}
  </div>
);

/** One innings: header line plus its batting and bowling tables. */
export const InningsSection: React.FC<{ data: InningsData; label: string }> = ({ data, label }) => (
  <div className="cs-innings-block">
    <div className="cs-inn-header">
      <span className="cs-inn-label">{label}</span>
      <span className="cs-inn-score">
        {data.battingTeam} — {data.score}/{data.wickets}
      </span>
    </div>
    {data.batters.length > 0 && (
      <div className="cs-section">
        <div className="cs-section-title">Batting</div>
        <BattingTable batters={data.batters} />
      </div>
    )}
    {data.bowlers.length > 0 && (
      <div className="cs-section">
        <div className="cs-section-title">Bowling</div>
        <BowlingTable bowlers={data.bowlers} />
      </div>
    )}
  </div>
);
