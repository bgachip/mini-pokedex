import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamStore } from './team.store';
import { TeamApiService } from '../services/team-api.service';
import { Team } from '../models/team.model';

describe('TeamStore', () => {
  let store: TeamStore;
  let teamApi: {
    getTeams: ReturnType<typeof vi.fn>;
    createTeam: ReturnType<typeof vi.fn>;
    deleteTeam: ReturnType<typeof vi.fn>;
  };

  const existingTeam: Team = {
    id: 1,
    trainerId: 1,
    name: 'Kanto Starters',
    pokemonIds: [1, 4, 7],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    teamApi = {
      getTeams: vi.fn(),
      createTeam: vi.fn(),
      deleteTeam: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TeamStore,
        {
          provide: TeamApiService,
          useValue: teamApi,
        },
      ],
    });

    store = TestBed.inject(TeamStore);
  });

  it('should rollback optimistic team creation when the API request fails', () => {
    const createTeamRequest$ = new Subject<Team>();

    teamApi.createTeam.mockReturnValue(
      createTeamRequest$.asObservable(),
    );

    const emittedTeams: Team[][] = [];

    const subscription = store.teams$.subscribe((teams) => {
      emittedTeams.push(teams);
    });

    store
      .createTeam(
        1,
        'Test Team',
        [25, 6, 9],
      )
      .subscribe({
        error: () => undefined,
      });

    expect(emittedTeams.at(-1)).toHaveLength(1);
    expect(emittedTeams.at(-1)?.[0].name).toBe(
      'Test Team',
    );

    createTeamRequest$.error(
      new Error('Create team failed'),
    );

    expect(emittedTeams.at(-1)).toEqual([]);

    subscription.unsubscribe();
  });
});
