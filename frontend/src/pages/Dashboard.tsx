import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { localMatchService, LocalMatch } from '../services/localMatchService';
import './Dashboard.css';

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const getInit = (name: string): string => {
  const w = name.trim().split(/\s+/);
  return (w.length === 1 ? name.slice(0, 2) : (w[0][0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '??';
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getStatusMeta = (status: string): { label: string; cls: string } => {
  switch (status?.toUpperCase()) {
    case 'LIVE':      return { label: '🔴 Live',      cls: 'badge--live'      };
    case 'UPCOMING':  return { label: '📅 Upcoming',  cls: 'badge--upcoming'  };
    case 'COMPLETED': return { label: '✅ Completed', cls: 'badge--completed' };
    default:          return { label: status,          cls: 'badge--default'   };
  }
};

// ── Live Match Card ──────────────────────────────────────────────────────────
const DashLiveCard: React.FC<{ match: LocalMatch }> = ({ match }) => {
  const isBatTeam1  = match.battingTeam === match.team1Name;
  const target      = match.currentInnings === 2
    ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1)
    : null;
  const batScore    = isBatTeam1 ? match.team1Score : match.team2Score;
  const runsNeeded  = target !== null ? Math.max(0, target - batScore) : null;

  return (
    <div className="dlc-card">
      <div className="dlc-header">
        <div className="dlc-live-badge"><span className="dlc-dot" />LIVE</div>
        <div className="dlc-meta-right">
          <span className="dlc-format">{match.matchFormat}</span>
          {match.matchCode && <span className="dlc-code">🔑 {match.matchCode}</span>}
        </div>
      </div>

      <div className="dlc-scoreboard">
        <div className={`dlc-team ${match.battingTeam === match.team1Name ? 'dlc-batting' : 'dlc-bowling'}`}>
          <div className="dlc-av dlc-av1">{getInit(match.team1Name)}</div>
          <div className="dlc-tname">{match.team1Name}</div>
          <div className="dlc-score">
            <span className="dlc-runs">{match.team1Score}</span>
            <span className="dlc-sep">/</span>
            <span className="dlc-wkts">{match.team1Wickets}</span>
          </div>
          {match.battingTeam === match.team1Name && <span className="dlc-bat-tag">🏏 BAT</span>}
        </div>

        <div className="dlc-mid">
          <div className="dlc-vs">VS</div>
          <div className="dlc-ov-badge">
            {match.currentOver}.{match.currentBall}{match.totalOvers ? `/${match.totalOvers}` : ''}
          </div>
        </div>

        <div className={`dlc-team dlc-team-r ${match.battingTeam === match.team2Name ? 'dlc-batting' : 'dlc-bowling'}`}>
          <div className="dlc-av dlc-av2">{getInit(match.team2Name)}</div>
          <div className="dlc-tname">{match.team2Name}</div>
          <div className="dlc-score">
            <span className="dlc-runs">{match.team2Score}</span>
            <span className="dlc-sep">/</span>
            <span className="dlc-wkts">{match.team2Wickets}</span>
          </div>
          {match.battingTeam === match.team2Name && <span className="dlc-bat-tag">🏏 BAT</span>}
        </div>
      </div>

      <div className="dlc-footer">
        {target !== null && runsNeeded !== null && (
          <span className="dlc-target">Target {target} · Need {runsNeeded} more</span>
        )}
        {match.striker && (
          <span className="dlc-players">
            ⚡ {match.striker}{match.currentBowler && <> · 🎯 {match.currentBowler}</>}
          </span>
        )}
        {match.location && match.location !== 'Local Ground' && (
          <span className="dlc-loc">📍 {match.location}</span>
        )}
      </div>
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user,          setUser]      = useState<UserData | null>(null);
  const [loading,       setLoading]   = useState(true);
  const [error,         setError]     = useState('');
  const [recentMatches, setRecent]    = useState<LocalMatch[]>([]);
  const [liveMatches,   setLive]      = useState<LocalMatch[]>([]);
  const [totalMatches,  setTotal]     = useState(0);
  const [completedCount,setCompleted] = useState(0);
  const [upcomingCount, setUpcoming]  = useState(0);
  const [lastPoll,      setLastPoll]  = useState<Date | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('cricmax-theme') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('cricmax-theme', next);
  };

  const fetchLive = useCallback(async () => {
    try {
      const live = await localMatchService.getLocalMatchesByStatus('LIVE');
      setLive(live);
      setLastPoll(new Date());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { setError('Failed to load user data.'); }
    }
    const init = async () => {
      try {
        const all = await localMatchService.getAllLocalMatches();
        setRecent(all.slice(0, 5));
        setTotal(all.length);
        setLive(all.filter(m => m.status === 'LIVE'));
        setCompleted(all.filter(m => m.status === 'COMPLETED').length);
        setUpcoming(all.filter(m => m.status === 'UPCOMING').length);
        setLastPoll(new Date());
      } catch { /* graceful */ }
      finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    const iv = setInterval(fetchLive, 6000);
    return () => clearInterval(iv);
  }, [fetchLive]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <div className="dashboard" data-theme={theme}>
        <div className="dash-loading">
          <div className="dash-spinner" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" data-theme={theme}>
      <div className="dash-container">

        {/* ── Top Bar ── */}
        <div className="dash-topbar">
          <div className="dash-greeting">
            <h1>{getGreeting()}, {user?.firstName ?? 'Player'} 👋</h1>
            <p>{today}</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>

        {error && <div className="dash-error"><span>⚠</span>{error}</div>}

        {/* ── Stats Grid ── */}
        <div className="dash-stats-grid">
          <Link to="/local-matches" className="stat-card stat-card--blue">
            <div className="stat-icon">🏏</div>
            <div className="stat-body">
              <span className="stat-value">{totalMatches}</span>
              <span className="stat-label">Total Matches</span>
            </div>
          </Link>

          <div className="stat-card stat-card--red">
            <div className="stat-icon">🔴</div>
            <div className="stat-body">
              <span className="stat-value">{liveMatches.length}</span>
              <span className="stat-label">Live Now</span>
            </div>
          </div>

          <div className="stat-card stat-card--green">
            <div className="stat-icon">✅</div>
            <div className="stat-body">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card stat-card--amber">
            <div className="stat-icon">📅</div>
            <div className="stat-body">
              <span className="stat-value">{upcomingCount}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
        </div>

        {/* ── Live Matches ── */}
        {liveMatches.length > 0 && (
          <section className="dash-section">
            <div className="dlc-section-hdr">
              <div className="dlc-section-title">
                <span className="dlc-hdr-dot" />
                Live Matches
                <span className="dlc-hdr-count">{liveMatches.length}</span>
              </div>
              {lastPoll && (
                <span className="dlc-refresh-txt">
                  Updated {lastPoll.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
            <div className="dlc-grid">
              {liveMatches.map(m => <DashLiveCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* ── Main Grid: Quick Actions + Recent Matches ── */}
        <div className="dash-main-grid">

          {/* Quick Actions */}
          <section className="dash-section">
            <h2 className="dash-section-title">Quick Actions</h2>
            <div className="qa-grid">
              <button className="qa-card qa-card--primary" onClick={() => navigate('/local-matches')}>
                <div className="qa-icon">➕</div>
                <div className="qa-body">
                  <span className="qa-title">Create Match</span>
                  <span className="qa-desc">Start a new local match</span>
                </div>
                <span className="qa-arrow">→</span>
              </button>

              <button className="qa-card qa-card--secondary" onClick={() => navigate('/profile')}>
                <div className="qa-icon">👤</div>
                <div className="qa-body">
                  <span className="qa-title">My Profile</span>
                  <span className="qa-desc">View and edit details</span>
                </div>
                <span className="qa-arrow">→</span>
              </button>

              <Link to="/tournaments" className="qa-card qa-card--gold">
                <div className="qa-icon">🏆</div>
                <div className="qa-body">
                  <span className="qa-title">Tournaments</span>
                  <span className="qa-desc">Browse tournaments</span>
                </div>
                <span className="qa-arrow">→</span>
              </Link>

              <Link to="/players" className="qa-card qa-card--green">
                <div className="qa-icon">🌟</div>
                <div className="qa-body">
                  <span className="qa-title">Players</span>
                  <span className="qa-desc">Explore player stats</span>
                </div>
                <span className="qa-arrow">→</span>
              </Link>
            </div>
          </section>

          {/* Recent Matches */}
          <section className="dash-section">
            <div className="dash-section-hdr">
              <h2 className="dash-section-title">Recent Matches</h2>
              <Link to="/local-matches" className="dash-view-all">View All →</Link>
            </div>
            <div className="recent-card">
              {recentMatches.length > 0 ? (
                recentMatches.map(match => {
                  const meta = getStatusMeta(match.status);
                  return (
                    <div key={match.id} className="match-row">
                      <div className="match-teams">
                        <span className="match-team">{match.team1Name}</span>
                        <span className="match-vs">vs</span>
                        <span className="match-team">{match.team2Name}</span>
                      </div>
                      <div className="match-badges">
                        {match.createdAt && (
                          <span className="badge badge--date">
                            {new Date(match.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {match.location && (
                          <span className="badge badge--loc">📍 {match.location}</span>
                        )}
                        <span className={`badge ${meta.cls}`}>{meta.label}</span>
                      </div>
                      <Link to="/local-matches" className="match-detail-btn">Details</Link>
                    </div>
                  );
                })
              ) : (
                <div className="recent-empty">
                  <span className="recent-empty-icon">🏏</span>
                  <p>No matches yet. Create your first one!</p>
                  <button className="empty-cta" onClick={() => navigate('/local-matches')}>
                    Create Match
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Profile Card ── */}
        <section className="dash-section">
          <h2 className="dash-section-title">Your Profile</h2>
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{user?.firstName} {user?.lastName}</h3>
              <p className="profile-email">{user?.email}</p>
              <span className="profile-role-badge">{user?.role}</span>
            </div>
            <Link to="/profile" className="profile-cta">
              <span>👤</span> View Profile
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
