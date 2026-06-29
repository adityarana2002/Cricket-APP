import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService, Tournament, CreateTournamentRequest } from '../services/tournamentService';
import './TournamentsPage.css';

const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchTournaments();
  }, [selectedStatus]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError('');
      let data: Tournament[];
      
      if (selectedStatus === 'ALL') {
        data = await tournamentService.getAllTournaments();
      } else {
        data = await tournamentService.getTournamentsByStatus(selectedStatus);
      }
      
      setTournaments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tournaments');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await tournamentService.createTournament(formData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        format: 'T20',
        location: '',
        status: 'UPCOMING',
      });
      fetchTournaments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tournament');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await tournamentService.deleteTournament(id);
        fetchTournaments();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete tournament');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UPCOMING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ONGOING':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredTournaments = tournaments.filter(tournament => 
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!localStorage.getItem('token')) {
    return (
      <div className="tournaments-container">
        <div className="auth-required">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view tournaments</p>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tournaments-container">
      <div className="tournaments-header mb-8">
        <div className="header-content">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Tournaments</h1>
          <p className="text-gray-600">Manage and organize cricket tournaments</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 flex items-center space-x-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <span>✕</span>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Create Tournament</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Tournament</h2>
          <form onSubmit={handleSubmit} className="tournament-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., IPL 2024"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                <select 
                  name="format" 
                  value={formData.format} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Dubai"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tournament description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                Create Tournament
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                selectedStatus === 'ALL' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('ALL')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                selectedStatus === 'UPCOMING' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('UPCOMING')}
            >
              📅 Upcoming
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                selectedStatus === 'ONGOING' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('ONGOING')}
            >
              🔴 Ongoing
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                selectedStatus === 'COMPLETED' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedStatus('COMPLETED')}
            >
              ✅ Completed
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No tournaments found</h3>
          <p className="text-gray-600 mb-6">Create your first tournament to get started</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            onClick={() => setShowForm(true)}
          >
            Create Tournament
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <div 
              key={tournament.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{tournament.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
                    {getStatusIcon(tournament.status)} {tournament.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span className="font-medium">{tournament.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{tournament.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Starts:</span>
                    <span className="font-medium">{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ends:</span>
                    <span className="font-medium">{new Date(tournament.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {tournament.description && (
                  <div className="mb-6">
                    <p className="text-gray-600 text-sm line-clamp-2">{tournament.description}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Created by: {tournament.createdByEmail}
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/tournaments/${tournament.id}`} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      View
                    </Link>
                    <button
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                      onClick={() => handleDelete(tournament.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
