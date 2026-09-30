import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, debounceTime, map, take } from 'rxjs';

import { Team } from '../models/team.model';

export function uniqueTeamNameValidator(
  teams$: Observable<Team[]>,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    teams$.pipe(
      debounceTime(300),
      take(1),
      map((teams) => {
        const name = control.value.trim().toLowerCase();

        const exists = teams.some(
          (team) => team.name.toLowerCase() === name,
        );

        return exists ? { teamNameTaken: true } : null;
      }),
    );
}
