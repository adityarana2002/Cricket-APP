import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { playerService, Player, CreatePlayerRequest } from '../services/playerService';
import './PlayersPage.css';

const BLANK_FORM: CreatePlayerRequest = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  role: 'BATSMAN',
  battingHand: 'RIGHT',
  bowlingType: 'RIGHT',
  jerseyNumber: 1,
  description: '',
  teamId: undefined,
};

const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreatePlayerRequest>(BLANK_FORM);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await playerService.getAllPlayers();
      setPlayers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'jerseyNumber' || name === 'teamId'
        ? (value ? parseInt(value) : (name === 'jerseyNumber' ? 1 : undefined))
        : value,
    }));
  };

  const openCreateForm = () => {
    setEditingPlayer(null);
    setFormData(BLANK_FORM);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      phoneNumber: player.phoneNumber || '',
      role: player.role,
      battingHand: player.battingHand,
      bowlingType: player.bowlingType,
      jerseyNumber: player.jerseyNumber,
      description: player.description || '',
      teamId: player.teamId,
    });
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setFormData(BLANK_FORM);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('First name, last name, and email are required');
      return;
    }
    try {
      setError('');
      if (editingPlayer) {
        await playerService.updatePlayer(editingPlayer.id, formData);
      } else {
        await playerService.createPlayer(formData);
      }
      closeForm();
      fetchPlayers();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editingPlayer ? 'update' : 'create'} player`);
    }
  };

  const handleDeletePlayer = async (playerId: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playerService.deletePlayer(playerId);
        fetchPlayers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete player');
      }
    }
  };

  const handleToggleStatus = async (player: Player) => {
    try {
      if (player.status === 'ACTIVE') {
        await playerService.deactivatePlayer(player.id);
      } else {
        await playerService.activatePlayer(player.id);
      }
      fetchPlayers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update player status');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'BATSMAN': return '🏏';
      case 'BOWLER': return '⚾';
      case 'ALL_ROUNDER': return '🌟';
      case 'WICKET_KEEPER': return '🧤';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => status === 'ACTIVE' ? 'status-active' : 'status-inactive';

  if (!localStorage.getItem('token')) {
    return (
      <div className="players-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please login to manage players</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  const filteredPlayers = players.filter(player => {
    const matchesRole = selectedRole === 'ALL' || player.role === selectedRole;
    const matchesSearch =
      player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="players-container">
      {/* Header */}
      <div className="players-header">
        <div className="header-content">
          <h1>👥 Player Management</h1>
          <p>Create and manage your cricket team players</p>
        </div>
        <button
          className={`btn btn-create ${showForm ? 'btn-cancel' : 'btn-primary'}`}
          onClick={showForm ? closeForm : openCreateForm}
        >
          {showForm ? '✕ Close' : '+ Add Player'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="create-player-form">
          <h2>{editingPlayer ? `Edit Player — ${editingPlayer.fullName}` : 'Add New Player'}</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" name="firstName" placeholder="e.g., Virat" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" placeholder="e.g., Kohli" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" placeholder="e.g., virat@cricket.com" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phoneNumber" placeholder="e.g., +91-9876543210" value={formData.phoneNumber} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Cricket Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Player Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="BATSMAN">Batsman</option>
                    <option value="BOWLER">Bowler</option>
                    <option value="ALL_ROUNDER">All-rounder</option>
                    <option value="WICKET_KEEPER">Wicket Keeper</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Jersey Number</label>
                  <input type="number" name="jerseyNumber" placeholder="1-99" min="1" max="99" value={formData.jerseyNumber} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Batting Hand *</label>
                  <select name="battingHand" value={formData.battingHand} onChange={handleInputChange}>
                    <option value="RIGHT">Right-handed</option>
                    <option value="LEFT">Left-handed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bowling Type *</label>
                  <select name="bowlingType" value={formData.bowlingType} onChange={handleInputChange}>
                    <option value="RIGHT">Right-arm</option>
                    <option value="LEFT">Left-arm</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea name="description" placeholder="Player bio, speciality, notes..." value={formData.description} onChange={handleInputChange} rows={3} />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingPlayer ? '✓ Save Changes' : '✓ Add Player'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          {['ALL', 'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'].map(role => (
            <button
              key={role}
              className={`filter-btn ${selectedRole === role ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role === 'ALL' ? '📋' : getRoleIcon(role)}{' '}
              {role === 'ALL' ? 'All Players' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && !showForm && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading players...</div>}

      {/* Players Grid */}
      {!loading && (
        <div className="players-grid">
          {filteredPlayers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Players Found</h3>
              <p>
                {players.length === 0
                  ? 'Add your first player to get started!'
                  : 'No players match your search criteria.'}
              </p>
              {players.length === 0 && (
                <button className="btn btn-primary" onClick={openCreateForm}>
                  + Add First Player
                </button>
              )}
            </div>
          ) : (
            filteredPlayers.map(player => (
              <div key={player.id} className="player-card">
                <div className="player-header">
                  <div className="player-info-header">
                    <div className="player-role-icon">{getRoleIcon(player.role)}</div>
                    <div className="player-names">
                      <h3>{player.fullName}</h3>
                      <p className="player-role">{player.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(player.status)}`}>
                    {player.status === 'ACTIVE' ? '✓ Active' : '○ Inactive'}
                  </span>
                </div>

                <div className="player-details">
                  <div className="detail-row"><span className="label">Email</span><span className="value">{player.email}</span></div>
                  <div className="detail-row"><span className="label">Phone</span><span className="value">{player.phoneNumber || '-'}</span></div>
                  <div className="detail-row"><span className="label">Jersey #</span><span className="value jersey-number">{player.jerseyNumber}</span></div>
                  <div className="detail-row"><span className="label">Team</span><span className="value">{player.teamName || '-'}</span></div>
                </div>

                <div className="player-cricket-stats">
                  <div className="stat"><div className="stat-label">Batting</div><div className="stat-value">{player.battingHand}</div></div>
                  <div className="stat"><div className="stat-label">Bowling</div><div className="stat-value">{player.bowlingType}</div></div>
                  <div className="stat"><div className="stat-label">Matches</div><div className="stat-value">{player.matchesPlayed || 0}</div></div>
                  <div className="stat"><div className="stat-label">Runs</div><div className="stat-value">{player.runsScored || 0}</div></div>
                </div>

                <div className="player-actions">
                  <button className="btn-action btn-edit" onClick={() => openEditForm(player)} title="Edit player">
                    ✎ Edit
                  </button>
                  <button
                    className={`btn-action ${player.status === 'ACTIVE' ? 'btn-deactivate' : 'btn-activate'}`}
                    onClick={() => handleToggleStatus(player)}
                    title={player.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  >
                    {player.status === 'ACTIVE' ? '⊘ Deactivate' : '✓ Activate'}
                  </button>
                  <button className="btn-action btn-delete" onClick={() => handleDeletePlayer(player.id)} title="Delete player">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
