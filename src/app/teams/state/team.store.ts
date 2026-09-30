import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';

import { Team } from '../models/team.model';
import { TeamApiService } from '../services/team-api.service';

@Injectable({
  providedIn: 'root',
})
export class TeamStore {
  private readonly teamApi = inject(TeamApiService);

  private readonly teamsSubject = new BehaviorSubject<Team[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly teams$ = this.teamsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Loads teams from the local GraphQL server.
   */
  loadTeams(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.teamApi
      .getTeams()
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe({
        next: (teams) => {
          this.teamsSubject.next(teams);
        },
        error: () => {
          this.errorSubject.next(
            'Failed to load teams. Please try again.',
          );
        },
      });
  }

  /**
   * Creates a team using an optimistic update.
   */
  createTeam(
    trainerId: number,
    name: string,
    pokemonIds: number[],
  ): void {
    const previousTeams = this.teamsSubject.value;

    const optimisticTeam: Team = {
      id: -Date.now(),
      trainerId,
      name,
      pokemonIds,
      createdAt: new Date().toISOString(),
    };

    this.teamsSubject.next([
      ...previousTeams,
      optimisticTeam,
    ]);

    this.errorSubject.next(null);

    this.teamApi
      .createTeam(trainerId, name, pokemonIds)
      .subscribe({
        next: (createdTeam) => {
          this.teamsSubject.next(
            this.teamsSubject.value.map((team) =>
              team.id === optimisticTeam.id
                ? createdTeam
                : team,
            ),
          );
        },
        error: () => {
          this.teamsSubject.next(previousTeams);

          this.errorSubject.next(
            'Failed to create team. Please try again.',
          );
        },
      });
  }

  /**
   * Deletes a team using an optimistic update.
   */
  deleteTeam(teamId: number): void {
    const previousTeams = this.teamsSubject.value;

    this.teamsSubject.next(
      previousTeams.filter((team) => team.id !== teamId),
    );

    this.errorSubject.next(null);

    this.teamApi.deleteTeam(teamId).subscribe({
      error: () => {
        this.teamsSubject.next(previousTeams);

        this.errorSubject.next(
          'Failed to delete team. Please try again.',
        );
      },
    });
  }
}
