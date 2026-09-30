export interface TeamApiItem {
  id: number;
  trainer_id: number;
  name: string;
  pokemon_ids: number[];
  created_at: string;
}

export interface TeamsResponse {
  data: {
    allTeams: TeamApiItem[];
  };
}

export interface CreateTeamResponse {
  data: {
    createTeam: TeamApiItem;
  };
}

export interface RemoveTeamResponse {
  data: {
    removeTeam: TeamApiItem;
  };
}
