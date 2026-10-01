import {distinctUntilChanged, map, Observable, shareReplay} from 'rxjs';

import {Pokemon} from '../models/pokemon.model';

export function selectAvailableTypes(
  pokemon$: Observable<Pokemon[]>,
): Observable<string[]> {
  return pokemon$.pipe(
    map((pokemon) => {
      const types = pokemon.flatMap((item) => item.types);

      return [...new Set(types)].sort();
    }),
    distinctUntilChanged(
      (previous, current) =>
        previous.length === current.length &&
        previous.every((type, index) => type === current[index]),
    ),
    shareReplay(1),
  );
}
