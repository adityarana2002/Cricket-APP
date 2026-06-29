import apiClient from '../services/api';

export interface Tournament {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  format: string;
  location: string;
  status: string;
  createdById: number;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTournamentRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  format: string;
  location: string;
  status: string;
}

export const tournamentService = {
  getAllTournaments: async (): Promise<Tournament[]> => {
    const response = await apiClient.get('/tournaments');
    return response.data;
  },

  getTournament: async (id: number): Promise<Tournament> => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return response.data;
  },

  getTournamentsByStatus: async (status: string): Promise<Tournament[]> => {
    const response = await apiClient.get(`/tournaments/status/${status}`);
    return response.data;
  },

  createTournament: async (data: CreateTournamentRequest): Promise<Tournament> => {
    const response = await apiClient.post('/tournaments', data);
    return response.data;
  },

  updateTournament: async (id: number, data: CreateTournamentRequest): Promise<Tournament> => {
    const response = await apiClient.put(`/tournaments/${id}`, data);
    return response.data;
  },

  deleteTournament: async (id: number): Promise<void> => {
    await apiClient.delete(`/tournaments/${id}`);
  },
};
