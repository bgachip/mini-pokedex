import { FormControl } from '@angular/forms';
import { firstValueFrom, Observable, of } from 'rxjs';

import { Team } from '../models/team.model';
import { uniqueTeamNameValidator } from './unique-team-name.validator';

describe('uniqueTeamNameValidator', () => {
  const teams: Team[] = [
    {
      id: 1,
      trainerId: 1,
      name: 'Kanto Starters',
      pokemonIds: [1, 4, 7],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  it('should reject an existing team name', async () => {
    const validator = uniqueTeamNameValidator(
      of(teams),
    );

    const control = new FormControl(
      'Kanto Starters',
    );

    const result = await firstValueFrom(
      validator(control) as Observable<
        Record<string, unknown> | null
      >,
    );

    expect(result).toEqual({
      teamNameTaken: true,
    });
  });

  it('should accept a unique team name', async () => {
    const validator = uniqueTeamNameValidator(
      of(teams),
    );

    const control = new FormControl(
      'My New Team',
    );

    const result = await firstValueFrom(
      validator(control) as Observable<
        Record<string, unknown> | null
      >,
    );

    expect(result).toBeNull();
  });

  it('should compare team names case-insensitively', async () => {
    const validator = uniqueTeamNameValidator(
      of(teams),
    );

    const control = new FormControl(
      'kanto starters',
    );

    const result = await firstValueFrom(
      validator(control) as Observable<
        Record<string, unknown> | null
      >,
    );

    expect(result).toEqual({
      teamNameTaken: true,
    });
  });
});
