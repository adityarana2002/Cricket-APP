import apiClient from './api';

export interface CreatePlayerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  battingHand: string;
  bowlingType: string;
  speciality?: string;
  jerseyNumber: number;
  description?: string;
  teamId?: number;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  battingHand: string;
  bowlingType: string;
  speciality?: string;
  jerseyNumber: number;
  description?: string;
  teamId?: number;
  teamName: string;
  status: string;
  matchesPlayed: number;
  runsScored: number;
  wicketsTaken: number;
  createdAt: string;
  updatedAt: string;
}

export const playerService = {
  async createPlayer(data: CreatePlayerRequest): Promise<Player> {
    const response = await apiClient.post('/players', data);
    return response.data;
  },

  async getPlayer(id: number): Promise<Player> {
    const response = await apiClient.get(`/players/${id}`);
    return response.data;
  },

  async getAllPlayers(): Promise<Player[]> {
    const response = await apiClient.get('/players');
    return response.data;
  },

  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    const response = await apiClient.get(`/players/team/${teamId}`);
    return response.data;
  },

  async getPlayersByRole(role: string): Promise<Player[]> {
    const response = await apiClient.get(`/players/role/${role}`);
    return response.data;
  },

  async updatePlayer(id: number, data: CreatePlayerRequest): Promise<Player> {
    const response = await apiClient.put(`/players/${id}`, data);
    return response.data;
  },

  async deletePlayer(id: number): Promise<void> {
    await apiClient.delete(`/players/${id}`);
  },

  async activatePlayer(id: number): Promise<Player> {
    const response = await apiClient.put(`/players/${id}/activate`);
    return response.data;
  },

  async deactivatePlayer(id: number): Promise<Player> {
    const response = await apiClient.put(`/players/${id}/deactivate`);
    return response.data;
  },
};
