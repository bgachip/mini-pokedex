import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import {
  map,
  Observable,
  switchMap,
  take,
  timer,
} from 'rxjs';

import { Team } from '../models/team.model';

export function uniqueTeamNameValidator(
  teams$: Observable<Team[]>,
): AsyncValidatorFn {
  return (
    control: AbstractControl,
  ): Observable<ValidationErrors | null> =>
    timer(300).pipe(
      switchMap(() => teams$.pipe(take(1))),
      map((teams) => {
        const name = control.value
          .trim()
          .toLowerCase();

        const exists = teams.some(
          (team) =>
            team.name.toLowerCase() === name,
        );

        return exists
          ? { teamNameTaken: true }
          : null;
      }),
    );
}
