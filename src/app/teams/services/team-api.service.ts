import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Team } from '../models/team.model';
import { TeamsResponse, CreateTeamResponse, RemoveTeamResponse } from '../models/team-api.model';
import { mapTeam } from '../utils/team.mapper';

@Injectable({
  providedIn: 'root',
})
export class TeamApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:4000';

  /**
   * Fetches all teams from the local GraphQL server.
   */
  getTeams(): Observable<Team[]> {
    return this.http
      .post<TeamsResponse>(this.apiUrl, {
        query: `
          query GetTeams {
            allTeams {
              id
              trainer_id
              name
              pokemon_ids
              created_at
            }
          }
        `,
      })
      .pipe(
        map((response) => response.data.allTeams.map(mapTeam)),
      );
  }

  /**
   * Creates a team on the local GraphQL server.
   */
  createTeam(
    trainerId: number,
    name: string,
    pokemonIds: number[],
  ): Observable<Team> {
    return this.http
      .post<CreateTeamResponse>(this.apiUrl, {
        query: `
        mutation CreateTeam(
          $trainerId: ID!
          $name: String!
          $pokemonIds: [Int]!
          $createdAt: String!
        ) {
          createTeam(
            trainer_id: $trainerId
            name: $name
            pokemon_ids: $pokemonIds
            created_at: $createdAt
          ) {
            id
            trainer_id
            name
            pokemon_ids
            created_at
          }
        }
      `,
        variables: {
          trainerId,
          name,
          pokemonIds,
          createdAt: new Date().toISOString(),
        },
      })
      .pipe(
        map((response) => mapTeam(response.data.createTeam)),
      );
  }

  /**
   * Deletes a team from the local GraphQL server.
   */
  deleteTeam(teamId: number): Observable<Team> {
    return this.http
      .post<RemoveTeamResponse>(this.apiUrl, {
        query: `
        mutation RemoveTeam($id: ID!) {
          removeTeam(id: $id) {
            id
            trainer_id
            name
            pokemon_ids
            created_at
          }
        }
      `,
        variables: {
          id: String(teamId),
        },
      })
      .pipe(
        map((response) => mapTeam(response.data.removeTeam)),
      );
  }
}
