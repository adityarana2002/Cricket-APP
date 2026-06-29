import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tournamentService, Tournament, CreateTournamentRequest } from '../services/tournamentService';
import './TournamentDetailsPage.css';

const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState<CreateTournamentRequest>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    format: 'T20',
    location: '',
    status: 'UPCOMING',
  });

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const data = await tournamentService.getTournament(parseInt(id));
      setTournament(data);
      setFormData({
        name: data.name,
        description: data.description,
        startDate: data.startDate.substring(0, 16),
        endDate: data.endDate.substring(0, 16),
        format: data.format,
        location: data.location,
        status: data.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tournament');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    try {
      setError('');
      await tournamentService.updateTournament(tournament.id, formData);
      setEditMode(false);
      fetchTournament();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tournament');
    }
  };

  const handleDelete = async () => {
    if (!tournament) return;
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await tournamentService.deleteTournament(tournament.id);
        navigate('/tournaments');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete tournament');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UPCOMING':
        return 'status-upcoming';
      case 'ONGOING':
        return 'status-ongoing';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UPCOMING':
        return '📅';
      case 'ONGOING':
        return '🔴';
      case 'COMPLETED':
        return '✅';
      default:
        return '';
    }
  };

  if (!localStorage.getItem('token')) {
    return (
      <div className="tournament-details-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <Link to="/login" className="btn">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="tournament-details-container"><div className="loading">Loading tournament details...</div></div>;
  }

  if (!tournament) {
    return (
      <div className="tournament-details-container">
        <div className="error-state">
          <h2>Tournament Not Found</h2>
          <Link to="/tournaments" className="btn">Back to Tournaments</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-details-container">
      <div className="details-header">
        <div className="header-top">
          <Link to="/tournaments" className="back-button">← Back</Link>
          <div>
            <h1>{tournament.name}</h1>
            <span className={`status-badge ${getStatusColor(tournament.status)}`}>
              {getStatusIcon(tournament.status)} {tournament.status}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`btn ${editMode ? 'btn-cancel' : 'btn-edit'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '✕ Cancel' : '✎ Edit'}
          </button>
          <button className="btn btn-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {editMode ? (
        <div className="edit-form-container">
          <h2>Edit Tournament</h2>
          <form onSubmit={handleUpdate} className="tournament-form">
            <div className="form-row">
              <div className="form-group">
                <label>Tournament Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Format *</label>
                <select name="format" value={formData.format} onChange={handleInputChange}>
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <button type="submit" className="btn btn-submit">Save Changes</button>
          </form>
        </div>
      ) : (
        <div className="tournament-info">
          <div className="info-grid">
            <div className="info-card">
              <h3>📋 Format</h3>
              <p>{tournament.format}</p>
            </div>
            <div className="info-card">
              <h3>📍 Location</h3>
              <p>{tournament.location}</p>
            </div>
            <div className="info-card">
              <h3>📅 Start Date</h3>
              <p>{new Date(tournament.startDate).toLocaleString()}</p>
            </div>
            <div className="info-card">
              <h3>📅 End Date</h3>
              <p>{new Date(tournament.endDate).toLocaleString()}</p>
            </div>
          </div>

          {tournament.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{tournament.description}</p>
            </div>
          )}

          <div className="meta-section">
            <h3>Tournament Information</h3>
            <div className="meta-grid">
              <div className="meta-item">
                <label>Status:</label>
                <span>{tournament.status}</span>
              </div>
              <div className="meta-item">
                <label>Created By:</label>
                <span>{tournament.createdByEmail}</span>
              </div>
              <div className="meta-item">
                <label>Created At:</label>
                <span>{new Date(tournament.createdAt).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <label>Last Updated:</label>
                <span>{new Date(tournament.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <h3>Actions</h3>
            <div className="action-buttons">
              <Link to="#" className="btn btn-action">
                🏟️ View Matches
              </Link>
              <Link to="#" className="btn btn-action">
                👥 Manage Teams
              </Link>
              <Link to="#" className="btn btn-action">
                📊 Leaderboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetailsPage;
