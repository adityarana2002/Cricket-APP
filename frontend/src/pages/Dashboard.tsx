import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { localMatchService, LocalMatch } from '../services/localMatchService';
import JoinLiveMatchModal from '../components/JoinLiveMatchModal';
import WatchModal from '../components/WatchModal';
import './Dashboard.css';

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

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

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user,          setUser]      = useState<UserData | null>(null);
  const [loading,       setLoading]   = useState(true);
  const [error,         setError]     = useState('');
  const [recentMatches, setRecent]    = useState<LocalMatch[]>([]);

  // Live matches are never listed here — a spectator must supply a match code.
  const [joinOpen,   setJoinOpen]   = useState(false);
  const [watchMatch, setWatchMatch] = useState<LocalMatch | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('cricmax-theme') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('cricmax-theme', next);
  };

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { setError('Failed to load user data.'); }
    }
    const init = async () => {
      try {
        const mine = await localMatchService.getMyLocalMatches();
        setRecent(mine.slice(0, 5));
      } catch { /* graceful */ }
      finally { setLoading(false); }
    };
    init();
  }, []);

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

      {/* Match modals reuse the local-match page styles, whose light-theme rules
          are scoped under `.lm-page` — `lm-portal` supplies that scope without
          contributing any layout to the dashboard. */}
      {(joinOpen || watchMatch) && (
        <div className="lm-page lm-portal" data-theme={theme}>
          {joinOpen && (
            <JoinLiveMatchModal
              onClose={() => setJoinOpen(false)}
              onMatchFound={match => { setJoinOpen(false); setWatchMatch(match); }}
            />
          )}
          {watchMatch && (
            <WatchModal match={watchMatch} onClose={() => setWatchMatch(null)} />
          )}
        </div>
      )}

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

        {/* ── Watch Live (code-gated) — the primary action of the app ── */}
        <section className="dash-section">
          <div className="wl-hero">
            <div className="wl-hero-icon">📺</div>
            <div className="wl-hero-body">
              <h2 className="wl-hero-title">Watch a Live Match</h2>
              <p className="wl-hero-desc">
                Enter the match code shared by the scorer to follow the game ball by ball.
              </p>
            </div>
            <button className="wl-hero-btn" onClick={() => setJoinOpen(true)}>
              <span className="wl-hero-btn-icon">🔑</span>
              Show Live Match
            </button>
          </div>
        </section>

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
              <h2 className="dash-section-title">Your Recent Matches</h2>
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
