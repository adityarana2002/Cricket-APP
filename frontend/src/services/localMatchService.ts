import apiClient from './api';

export interface CreateLocalMatchRequest {
  team1Name: string;
  team2Name: string;
  battingTeamId: number;
  matchFormat: string;
  location: string;
  description?: string;
  matchDate?: string;
  numberOfOvers?: number;
  oversPerBowler?: number;
  ballType?: string;
}

export interface UpdateScoreRequest {
  team1Score?: number;
  team2Score?: number;
  team1Wickets?: number;
  team2Wickets?: number;
  currentOver?: number;
  currentBall?: number;
  striker?: string;
  nonStriker?: string;
  currentBowler?: string;
}

export interface LocalMatch {
  id: number;
  matchCode?: string;
  team1Id: number;
  team2Id: number;
  team1Name: string;
  team2Name: string;
  battingTeam: string;
  bowlingTeam: string;
  matchFormat: string;
  location: string;
  description?: string;
  status: string;
  team1Score: number;
  team2Score: number;
  team1Wickets: number;
  team2Wickets: number;
  currentOver: number;
  currentBall: number;
  currentInnings: number;
  totalOvers?: number;
  oversPerBowler?: number;
  ballType?: string;
  striker?: string;
  nonStriker?: string;
  currentBowler?: string;
  winnerName?: string;
  isTie?: boolean;
  createdByEmail?: string;
  /** JSON scorecard snapshot — parse with parseScoreState() from types/scorecard. */
  scoreState?: string;
  matchDate: string;
  createdAt: string;
  updatedAt: string;
}

export const localMatchService = {
  async createLocalMatch(data: CreateLocalMatchRequest): Promise<LocalMatch> {
    const response = await apiClient.post('/local-matches', data);
    return response.data;
  },

  /** Owner-only: the server rejects ids the caller does not own with a 403. */
  async getLocalMatch(id: number): Promise<LocalMatch> {
    const response = await apiClient.get(`/local-matches/${id}`);
    return response.data;
  },

  /** The only way to reach someone else's match — holding the code grants access. */
  async getLocalMatchByCode(code: string): Promise<LocalMatch> {
    const response = await apiClient.get(`/local-matches/by-code/${code.toUpperCase()}`);
    return response.data;
  },

  /** The signed-in user's own matches (their history), newest first. */
  async getMyLocalMatches(): Promise<LocalMatch[]> {
    const response = await apiClient.get('/local-matches');
    return response.data;
  },

  /** Status filter across the caller's own matches only. */
  async getMyLocalMatchesByStatus(status: string): Promise<LocalMatch[]> {
    const response = await apiClient.get(`/local-matches/status/${status}`);
    return response.data;
  },

  async startMatch(id: number): Promise<LocalMatch> {
    const response = await apiClient.put(`/local-matches/${id}/start`);
    return response.data;
  },

  async updateScore(id: number, data: UpdateScoreRequest): Promise<LocalMatch> {
    const response = await apiClient.put(`/local-matches/${id}/score`, data);
    return response.data;
  },

  async switchInnings(id: number): Promise<LocalMatch> {
    const response = await apiClient.put(`/local-matches/${id}/switch-innings`);
    return response.data;
  },

  async endMatch(id: number, winnerTeamId?: number | null): Promise<LocalMatch> {
    // No winnerTeamId → the match is declared a TIE
    const query = winnerTeamId != null ? `?winnerTeamId=${winnerTeamId}` : '';
    const response = await apiClient.put(`/local-matches/${id}/end${query}`);
    return response.data;
  },

  /**
   * Push the scorer's scorecard snapshot (owner only). Deliberately separate
   * from updateScore: this is best-effort enrichment for spectators, so callers
   * should swallow failures rather than disrupt scoring.
   */
  async saveScoreState(id: number, state: string): Promise<void> {
    await apiClient.put(`/local-matches/${id}/score-state`, { state });
  },

  async deleteMatch(id: number): Promise<void> {
    await apiClient.delete(`/local-matches/${id}`);
  },
};
