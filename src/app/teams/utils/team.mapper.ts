import { Team } from '../models/team.model';
import { TeamApiItem } from '../models/team-api.model';

export function mapTeam(item: TeamApiItem): Team {
  return {
    id: Number(item.id),
    trainerId: Number(item.trainer_id),
    name: item.name,
    pokemonIds: item.pokemon_ids,
    createdAt: item.created_at,
  };
}
