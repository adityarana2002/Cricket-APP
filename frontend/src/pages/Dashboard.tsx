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

// ── Live Match Card ──────────────────────────────────────────────────────────
const DashLiveCard: React.FC<{ match: LocalMatch }> = ({ match }) => {
  const isBatTeam1 = match.battingTeam === match.team1Name;
  const target = match.currentInnings === 2
    ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1)
    : null;
  const batScore = isBatTeam1 ? match.team1Score : match.team2Score;
  const runsNeeded = target !== null ? Math.max(0, target - batScore) : null;

  return (
    <div className="dlc-card">
      <div className="dlc-header">
        <div className="dlc-live-badge">
          <span className="dlc-dot" />
          LIVE
        </div>
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
          {match.battingTeam === match.team1Name && (
            <span className="dlc-bat-tag">🏏 BAT</span>
          )}
        </div>

        <div className="dlc-mid">
          <div className="dlc-vs">VS</div>
          <div className="dlc-ov-badge">
            {match.currentOver}.{match.currentBall}
            {match.totalOvers ? `/${match.totalOvers}` : ''}
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
          {match.battingTeam === match.team2Name && (
            <span className="dlc-bat-tag">🏏 BAT</span>
          )}
        </div>
      </div>

      <div className="dlc-footer">
        {target !== null && runsNeeded !== null && (
          <span className="dlc-target">
            Target {target} · Need {runsNeeded} more
          </span>
        )}
        {match.striker && (
          <span className="dlc-players">
            ⚡ {match.striker}
            {match.currentBowler && <> · 🎯 {match.currentBowler}</>}
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
  const [user, setUser]           = useState<UserData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [recentMatches, setRecent] = useState<LocalMatch[]>([]);
  const [liveMatches, setLive]    = useState<LocalMatch[]>([]);
  const [totalMatches, setTotal]  = useState(0);
  const [lastPoll, setLastPoll]   = useState<Date | null>(null);

  const fetchLive = useCallback(async () => {
    try {
      const live = await localMatchService.getLocalMatchesByStatus('LIVE');
      setLive(live);
      setLastPoll(new Date());
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch { setError('Failed to load user data'); }
    }

    const init = async () => {
      try {
        const all = await localMatchService.getAllLocalMatches();
        setRecent(all.slice(0, 5));
        setTotal(all.length);
        setLive(all.filter(m => m.status === 'LIVE'));
        setLastPoll(new Date());
      } catch { /* fail gracefully */ }
      finally { setLoading(false); }
    };
    init();
  }, []);

  // Poll live matches every 6 seconds
  useEffect(() => {
    const iv = setInterval(fetchLive, 6000);
    return () => clearInterval(iv);
  }, [fetchLive]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING':  return 'bg-yellow-100 text-yellow-800';
      case 'LIVE':      return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING':  return '📅 Upcoming';
      case 'LIVE':      return '🔴 Live';
      case 'COMPLETED': return '✅ Completed';
      default:          return status;
    }
  };

  if (loading) return (
    <div className="dashboard flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-container">

        <div className="welcome-section mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your cricket activities today</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/local-matches"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300 block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Matches</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalMatches}</p>
              </div>
              <div className="text-3xl">🏏</div>
            </div>
          </Link>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Live Now</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{liveMatches.length}</p>
              </div>
              <div className="text-3xl">🔴</div>
            </div>
          </div>
        </div>

        {/* ── Live Matches ── */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
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
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/local-matches')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>➕</span><span>Create Match</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>👤</span><span>My Profile</span>
            </button>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Matches</h2>
            <Link to="/local-matches" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {recentMatches.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentMatches.map(match => (
                  <div key={match.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="font-bold text-gray-800">{match.team1Name}</div>
                          <div className="text-gray-400 text-sm">vs</div>
                          <div className="font-bold text-gray-800">{match.team2Name}</div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {match.createdAt && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {new Date(match.createdAt).toLocaleDateString()}
                            </span>
                          )}
                          {match.location && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {match.location}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {getStatusLabel(match.status)}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/local-matches"
                        className="mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No matches yet. Create your first match!</p>
                <button
                  onClick={() => navigate('/local-matches')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Create Match
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">Role: {user?.role}</p>
              </div>
              <Link
                to="/profile"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>👤</span><span>View Profile</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
