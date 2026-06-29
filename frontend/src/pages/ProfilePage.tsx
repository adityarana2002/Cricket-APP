import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { localMatchService, LocalMatch } from '../services/localMatchService';
import './ProfilePage.css';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  bio?: string;
  phone?: string;
  country?: string;
  profilePicture?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface UpdateProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  country: string;
}

type TabId = 'overview' | 'edit' | 'badges' | 'live';

// ── Constants ─────────────────────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  india: '🇮🇳', australia: '🇦🇺', england: '🇬🇧', 'united kingdom': '🇬🇧',
  pakistan: '🇵🇰', 'south africa': '🇿🇦', 'new zealand': '🇳🇿',
  'west indies': '🏴', 'sri lanka': '🇱🇰', srilanka: '🇱🇰',
  bangladesh: '🇧🇩', afghanistan: '🇦🇫', zimbabwe: '🇿🇼',
  'united states': '🇺🇸', usa: '🇺🇸', canada: '🇨🇦', uae: '🇦🇪',
};

const BADGES = [
  { id: 'first-match', icon: '🏏', label: 'First Match',    desc: 'Created your first local match',          earned: true,  color: '#6366f1' },
  { id: 'live-scorer', icon: '📊', label: 'Live Scorer',    desc: 'Scored a full match ball-by-ball',         earned: true,  color: '#22c55e' },
  { id: 'century',     icon: '💯', label: 'Century Maker',  desc: 'Recorded a 100+ run innings',              earned: false, color: '#f59e0b' },
  { id: 'hat-trick',   icon: '🎩', label: 'Hat Trick Hero', desc: '3 wickets in 3 consecutive balls',         earned: false, color: '#ec4899' },
  { id: 'allrounder',  icon: '⚡', label: 'All-Rounder',    desc: 'Scored runs and took wickets in one game', earned: false, color: '#06b6d4' },
  { id: 'veteran',     icon: '🏆', label: 'Veteran',        desc: 'Organised 10+ matches',                   earned: false, color: '#a855f7' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getFlag = (country?: string) =>
  country ? (COUNTRY_FLAGS[country.toLowerCase()] ?? '🌍') : '';

const getInit = (name: string): string => {
  const w = name.trim().split(/\s+/);
  return (w.length === 1 ? name.slice(0, 2) : (w[0][0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '?';
};

const calcCompletion = (u: UserData, f: UpdateProfileForm): number => {
  const slots = [u.email, f.firstName, f.lastName, f.phone, f.country, f.bio];
  return Math.round((slots.filter(s => s?.trim()).length / slots.length) * 100);
};

// ── WatchCard sub-component ───────────────────────────────────────────────────
interface WatchCardProps { match: LocalMatch; onRemove: () => void; }

const WatchCard: React.FC<WatchCardProps> = ({ match, onRemove }) => {
  const isLive     = match.status === 'LIVE';
  const isDone     = match.status === 'COMPLETED';
  const isUpcoming = match.status === 'UPCOMING';
  const isBatTeam1 = match.battingTeam === match.team1Name;

  const batScore = isBatTeam1 ? match.team1Score : match.team2Score;
  const target   = match.currentInnings === 2
    ? (isBatTeam1 ? match.team2Score + 1 : match.team1Score + 1)
    : null;
  const runsNeeded = target !== null ? Math.max(0, target - batScore) : null;
  const oversLeft  = match.totalOvers != null ? match.totalOvers - match.currentOver : null;

  return (
    <div className={`pp-wc ${isLive ? 'pp-wc-live' : isDone ? 'pp-wc-done' : 'pp-wc-up'}`}>

      {/* Header row */}
      <div className="pp-wc-head">
        <div className="pp-wc-status-chips">
          {isLive     && <span className="pp-wc-live-chip"><span className="pp-wc-dot"/>LIVE</span>}
          {isDone     && <span className="pp-wc-done-chip">✓ FINAL</span>}
          {isUpcoming && <span className="pp-wc-up-chip">UPCOMING</span>}
          <span className="pp-wc-fmt">{match.matchFormat}</span>
        </div>
        <div className="pp-wc-actions">
          <span className="pp-wc-id-pill">#{match.id}</span>
          <button className="pp-wc-rm" onClick={onRemove} title="Stop watching">✕</button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="pp-wc-board">
        {/* Team 1 */}
        <div className={`pp-wc-team ${match.battingTeam === match.team1Name ? 'pp-wc-batting' : 'pp-wc-bowling'}`}>
          <div className="pp-wc-av pp-wc-av1">{getInit(match.team1Name)}</div>
          <div className="pp-wc-tname">{match.team1Name}</div>
          <div className="pp-wc-score-row">
            <span className="pp-wc-runs">{match.team1Score}</span>
            <span className="pp-wc-sep">/</span>
            <span className="pp-wc-wkts">{match.team1Wickets}</span>
          </div>
          {match.battingTeam === match.team1Name && <span className="pp-wc-bat-tag">🏏 BAT</span>}
        </div>

        <div className="pp-wc-mid">
          <div className="pp-wc-vs">VS</div>
          {isLive && (
            <div className="pp-wc-overs-badge">
              {match.currentOver}.{match.currentBall}
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className={`pp-wc-team pp-wc-tr ${match.battingTeam === match.team2Name ? 'pp-wc-batting' : 'pp-wc-bowling'}`}>
          <div className="pp-wc-av pp-wc-av2">{getInit(match.team2Name)}</div>
          <div className="pp-wc-tname">{match.team2Name}</div>
          <div className="pp-wc-score-row">
            <span className="pp-wc-runs">{match.team2Score}</span>
            <span className="pp-wc-sep">/</span>
            <span className="pp-wc-wkts">{match.team2Wickets}</span>
          </div>
          {match.battingTeam === match.team2Name && <span className="pp-wc-bat-tag">🏏 BAT</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="pp-wc-foot">
        {isLive && target !== null && runsNeeded !== null && (
          <span className="pp-wc-target-txt">
            Target {target} · Need {runsNeeded} runs
            {oversLeft !== null && ` in ${oversLeft} over${oversLeft !== 1 ? 's' : ''}`}
          </span>
        )}
        {isDone && match.winnerName && (
          <span className="pp-wc-winner-txt">🏆 {match.winnerName} won!</span>
        )}
        {(isUpcoming || (!target && isLive)) && (
          <span className="pp-wc-detail-txt">
            {match.totalOvers ? `${match.totalOvers} overs` : match.matchFormat}
          </span>
        )}
        {match.location && match.location !== 'Local Ground' && (
          <span className="pp-wc-loc">📍 {match.location}</span>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  // Profile state
  const [user, setUser]            = useState<UserData | null>(null);
  const [activeTab, setActiveTab]  = useState<TabId>('overview');
  const [form, setForm]            = useState<UpdateProfileForm>({ firstName: '', lastName: '', phone: '', bio: '', country: '' });
  const [profilePicture, setPic]   = useState<string | null>(null);
  const [previewImage, setPreview] = useState<string | null>(null);
  const [loading, setLoading]      = useState(true);
  const [saving, setSaving]        = useState(false);
  const [error, setError]          = useState<string | null>(null);
  const [success, setSuccess]      = useState<string | null>(null);

  // Live-watching state — keyed by matchCode (e.g. "AB3K9MZ")
  const [watchedCodes, setWatchedCodes]     = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pp_watching_codes') || '[]'); } catch { return []; }
  });
  const [watchedMatches, setWatchedMatches] = useState<LocalMatch[]>([]);
  const [matchCodeInput, setMatchCodeInput] = useState('');
  const [addMatchErr, setAddMatchErr]       = useState('');
  const [loadingWatch, setLoadingWatch]     = useState(false);
  const [lastRefresh, setLastRefresh]       = useState<Date | null>(null);

  // ── Profile fetch ────────────────────────────────────────────────────────
  const syncUser = (data: UserData) => {
    setUser(data);
    setForm({ firstName: data.firstName || '', lastName: data.lastName || '', phone: data.phone || '', bio: data.bio || '', country: data.country || '' });
    const pic = data.profilePicture || localStorage.getItem(`profile_picture_${data.id}`);
    if (pic) setPic(pic);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const fetchProfile = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get('/auth/me');
      syncUser(res.data);
    } catch {
      const cached = localStorage.getItem('user');
      if (cached) { try { syncUser(JSON.parse(cached)); } catch { setError('Failed to load profile'); } }
      else setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live watch polling ───────────────────────────────────────────────────
  const fetchWatched = useCallback(async () => {
    if (watchedCodes.length === 0) { setWatchedMatches([]); return; }
    try {
      const results = await Promise.all(
        watchedCodes.map(code => localMatchService.getLocalMatchByCode(code).catch(() => null))
      );
      setWatchedMatches(results.filter(Boolean) as LocalMatch[]);
      setLastRefresh(new Date());
    } catch {}
  }, [watchedCodes]);

  useEffect(() => {
    fetchWatched();
    const iv = setInterval(fetchWatched, 6000);
    return () => clearInterval(iv);
  }, [fetchWatched]);

  useEffect(() => {
    localStorage.setItem('pp_watching_codes', JSON.stringify(watchedCodes));
  }, [watchedCodes]);

  // ── Watch handlers ───────────────────────────────────────────────────────
  const handleAddMatch = async () => {
    const code = matchCodeInput.trim().toUpperCase();
    if (!code) { setAddMatchErr('Please enter a Match Code (e.g. AB3K9MZ)'); return; }
    if (!/^[A-Z0-9]{5,10}$/.test(code)) { setAddMatchErr('Invalid format — use the code shown on the match card'); return; }
    if (watchedCodes.includes(code)) { setAddMatchErr('You are already watching this match'); return; }
    setLoadingWatch(true); setAddMatchErr('');
    try {
      await localMatchService.getLocalMatchByCode(code);
      setWatchedCodes(prev => [...prev, code]);
      setMatchCodeInput('');
    } catch {
      setAddMatchErr('Match not found. Double-check the code and try again.');
    } finally {
      setLoadingWatch(false);
    }
  };

  const handleRemoveWatch = (code: string) => {
    setWatchedCodes(prev => prev.filter(c => c !== code));
    setWatchedMatches(prev => prev.filter(m => m.matchCode !== code));
  };

  // ── Profile edit handlers ────────────────────────────────────────────────
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('File size exceeds 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('First and last name are required'); return; }
    setSaving(true); setError(null); setSuccess(null);
    try {
      const payload: any = { ...form };
      if (previewImage) payload.profilePicture = previewImage;
      const res = await apiClient.put('/auth/profile', payload);
      if (previewImage) { localStorage.setItem(`profile_picture_${res.data.id}`, previewImage); setPic(previewImage); setPreview(null); }
      syncUser(res.data);
      setActiveTab('overview');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', bio: user.bio || '', country: user.country || '' });
    setPreview(null); setError(null); setActiveTab('overview');
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const displayImage = previewImage || profilePicture;
  const initials     = user ? getInit(`${user.firstName} ${user.lastName}`) : '?';
  const completion   = user ? calcCompletion(user, form) : 0;
  const liveCount    = watchedMatches.filter(m => m.status === 'LIVE').length;

  const TABS: { id: TabId; icon: string; label: string; badge?: number }[] = [
    { id: 'overview', icon: '👤', label: 'Overview' },
    { id: 'edit',     icon: '✏️', label: 'Edit' },
    { id: 'badges',   icon: '🏅', label: 'Badges' },
    { id: 'live',     icon: '📡', label: 'Live',  badge: liveCount || undefined },
  ];

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="pp-root">
      <div className="pp-orb pp-orb-1" /><div className="pp-orb pp-orb-2" /><div className="pp-orb pp-orb-3" />
      <div className="pp-center-state"><div className="pp-spinner" /><p className="pp-state-txt">Loading profile…</p></div>
    </div>
  );
  if (!user) return (
    <div className="pp-root">
      <div className="pp-orb pp-orb-1" /><div className="pp-orb pp-orb-2" /><div className="pp-orb pp-orb-3" />
      <div className="pp-center-state">
        <div className="pp-state-icon">⚠</div>
        <p className="pp-state-txt">{error || 'No user data found'}</p>
        <button className="pp-retry-btn" onClick={fetchProfile}>Retry</button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="pp-root">
      <div className="pp-orb pp-orb-1" aria-hidden />
      <div className="pp-orb pp-orb-2" aria-hidden />
      <div className="pp-orb pp-orb-3" aria-hidden />

      {/* ── Hero ──────────────────────────────────── */}
      <div className="pp-hero">
        <div className="pp-hero-glow" aria-hidden />

        <div className="pp-hero-inner">
          {/* Square avatar with gradient border */}
          <div className="pp-avatar-ring">
            <div className="pp-avatar-core">
              {displayImage
                ? <img src={displayImage} alt="avatar" className="pp-avatar-img" />
                : <span className="pp-avatar-initials">{initials}</span>}
            </div>
          </div>

          {/* Identity */}
          <div className="pp-hero-info">
            <h1 className="pp-hero-name">{user.firstName} {user.lastName}</h1>
            <div className="pp-hero-chips">
              <span className="pp-chip pp-chip-role">{user.role}</span>
              {user.isActive && (
                <span className="pp-chip pp-chip-active">
                  <span className="pp-live-dot" />Active
                </span>
              )}
              {user.country && (
                <span className="pp-chip pp-chip-country">{getFlag(user.country)} {user.country}</span>
              )}
            </div>
            <div className="pp-hero-email">{user.email}</div>
          </div>
        </div>

        {/* Completion bar */}
        <div className="pp-compl">
          <div className="pp-compl-row">
            <span className="pp-compl-label">Profile Completion</span>
            <span className="pp-compl-pct">{completion}%</span>
          </div>
          <div className="pp-compl-track">
            <div className="pp-compl-fill" style={{ width: `${completion}%` }} />
          </div>
          {completion < 100 && <p className="pp-compl-hint">Complete your profile to unlock all features</p>}
        </div>

        {success && <div className="pp-toast">{success}</div>}
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="pp-tabs-wrap">
        <div className="pp-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`pp-tab ${activeTab === t.id ? 'pp-tab-on' : ''}`}
              onClick={() => { setActiveTab(t.id); setError(null); }}
            >
              <span className="pp-tab-icon">{t.icon}</span>
              <span className="pp-tab-label">{t.label}</span>
              {t.badge ? <span className="pp-tab-badge">{t.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────── */}
      <div className="pp-body">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="pp-overview">
            <div className="pp-info-grid">
              {[
                { icon: '✉',  label: 'Email',   value: user.email,    color: 'rgba(99,102,241,0.15)',  fg: '#818cf8' },
                { icon: '📱', label: 'Phone',   value: user.phone,    color: 'rgba(34,197,94,0.12)',   fg: '#4ade80' },
                { icon: '🌍', label: 'Country', value: user.country ? `${getFlag(user.country)} ${user.country}` : '', color: 'rgba(245,158,11,0.12)', fg: '#fbbf24' },
                { icon: '🎭', label: 'Role',    value: user.role,     color: 'rgba(168,85,247,0.12)',  fg: '#c084fc' },
                { icon: '⚡', label: 'Status',  value: user.isActive ? '● Active' : '○ Inactive', color: 'rgba(6,182,212,0.12)', fg: '#22d3ee' },
                ...(user.createdAt ? [{ icon: '📅', label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), color: 'rgba(239,68,68,0.1)', fg: '#f87171' }] : []),
              ].map((item, i) => (
                <div className="pp-info-card" key={i}>
                  <div className="pp-info-icon" style={{ background: item.color, color: item.fg }}>{item.icon}</div>
                  <div className="pp-info-body">
                    <div className="pp-info-lbl">{item.label}</div>
                    <div className={`pp-info-val ${!item.value ? 'pp-info-empty' : ''} ${item.label === 'Status' && user.isActive ? 'pp-val-active' : ''}`}>
                      {item.value || 'Not set'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {user.bio && (
              <div className="pp-bio-block">
                <div className="pp-bio-lbl">About</div>
                <p className="pp-bio-text">{user.bio}</p>
              </div>
            )}

            <button className="pp-cta-edit" onClick={() => setActiveTab('edit')}>✏️ Edit Profile</button>
          </div>
        )}

        {/* ── EDIT ── */}
        {activeTab === 'edit' && (
          <div className="pp-edit">
            {error && <div className="pp-err-banner">⚠ {error}</div>}

            <div className="pp-av-pick">
              <div className="pp-av-ring">
                <div className="pp-av-core">
                  {displayImage
                    ? <img src={displayImage} alt="preview" className="pp-avatar-img" />
                    : <span className="pp-avatar-initials">{initials}</span>}
                </div>
              </div>
              <label className="pp-photo-btn">
                📷 Change Photo
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              <p className="pp-photo-hint">JPG · PNG · max 5 MB</p>
            </div>

            <div className="pp-form-grid">
              <div className="pp-fld">
                <label className="pp-fld-lbl">First Name <span className="pp-req">*</span></label>
                <input className="pp-inp" type="text" name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="e.g. Virat" />
              </div>
              <div className="pp-fld">
                <label className="pp-fld-lbl">Last Name <span className="pp-req">*</span></label>
                <input className="pp-inp" type="text" name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="e.g. Kohli" />
              </div>
              <div className="pp-fld">
                <label className="pp-fld-lbl">Phone</label>
                <input className="pp-inp" type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 98765 43210" />
              </div>
              <div className="pp-fld">
                <label className="pp-fld-lbl">Country</label>
                <input className="pp-inp" type="text" name="country" value={form.country} onChange={handleFormChange} placeholder="e.g. India" />
              </div>
              <div className="pp-fld pp-fld-full">
                <label className="pp-fld-lbl">Bio</label>
                <textarea className="pp-inp pp-inp-ta" name="bio" value={form.bio} onChange={handleFormChange} placeholder="Tell the world about your cricket journey…" rows={4} />
              </div>
            </div>

            <div className="pp-form-actions">
              <button className="pp-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="pp-btn-spin" />Saving…</> : '✓  Save Changes'}
              </button>
              <button className="pp-cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── BADGES ── */}
        {activeTab === 'badges' && (
          <div className="pp-badges">
            <p className="pp-badges-sub">Earn badges by playing and scoring matches</p>
            <div className="pp-badges-grid">
              {BADGES.map(b => (
                <div key={b.id} className={`pp-badge-card ${b.earned ? 'pp-badge-on' : 'pp-badge-off'}`}>
                  <div className="pp-badge-icon"
                    style={{ background: b.earned ? `${b.color}20` : 'rgba(255,255,255,0.03)', borderColor: b.earned ? `${b.color}50` : 'rgba(255,255,255,0.07)', boxShadow: b.earned ? `0 0 20px ${b.color}30` : 'none' }}>
                    <span style={{ filter: b.earned ? 'none' : 'grayscale(1) opacity(0.3)' }}>{b.icon}</span>
                  </div>
                  <div className="pp-badge-lbl">{b.label}</div>
                  <div className="pp-badge-desc">{b.desc}</div>
                  {b.earned
                    ? <div className="pp-badge-pill pp-badge-pill-on">Earned ✓</div>
                    : <div className="pp-badge-pill pp-badge-pill-off">🔒 Locked</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE SCORES ── */}
        {activeTab === 'live' && (
          <div className="pp-live">

            {/* Watch a match – input card */}
            <div className="pp-live-add-card">
              <div className="pp-live-add-top">
                <span className="pp-live-add-icon">📡</span>
                <div>
                  <div className="pp-live-add-title">Watch a Match Live</div>
                  <div className="pp-live-add-sub">
                    Get the Match Code from the organiser and enter it below to follow live scores in real time
                  </div>
                </div>
              </div>
              <div className="pp-live-input-row">
                <input
                  className="pp-inp pp-live-inp"
                  type="text"
                  maxLength={10}
                  placeholder="Enter Match Code (e.g. AB3K9MZ)"
                  value={matchCodeInput}
                  onChange={e => { setMatchCodeInput(e.target.value.toUpperCase()); setAddMatchErr(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddMatch(); }}
                />
                <button className="pp-live-btn" onClick={handleAddMatch} disabled={loadingWatch}>
                  {loadingWatch ? <span className="pp-btn-spin" /> : '+ Watch'}
                </button>
              </div>
              {addMatchErr && <p className="pp-live-err">{addMatchErr}</p>}
              <p className="pp-live-hint">
                To share your match: go to Local Matches → the <strong>🔑 code</strong> is shown on each match card
              </p>
            </div>

            {/* Match list */}
            {watchedMatches.length > 0 ? (
              <div className="pp-live-list">
                <div className="pp-live-list-hdr">
                  <span className="pp-live-list-count">
                    Watching <strong>{watchedMatches.length}</strong> match{watchedMatches.length !== 1 ? 'es' : ''}
                  </span>
                  {liveCount > 0 && (
                    <span className="pp-live-refresh-pill">
                      <span className="pp-live-dot-sm" />
                      {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Auto-refreshing'}
                    </span>
                  )}
                </div>
                {watchedMatches.map(m => (
                  <WatchCard key={m.matchCode ?? m.id} match={m} onRemove={() => handleRemoveWatch(m.matchCode ?? '')} />
                ))}
              </div>
            ) : watchedCodes.length > 0 ? (
              <div className="pp-live-loading">
                <div className="pp-spinner" />
                <p>Loading matches…</p>
              </div>
            ) : (
              <div className="pp-live-empty">
                <div className="pp-live-empty-icon">🏏</div>
                <div className="pp-live-empty-title">No matches being watched</div>
                <div className="pp-live-empty-sub">
                  Ask the match organiser for the Match Code, then enter it above to see live scores
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
