import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';

export function selectPokemonCount(
  pokemon$: Observable<Pokemon[]>,
): Observable<number> {
  return pokemon$.pipe(
    map((pokemon) => pokemon.length),
    distinctUntilChanged(),
  );
}

export function selectPokemonByType(
  pokemon$: Observable<Pokemon[]>,
  selectedType$: Observable<string | null>,
): Observable<Pokemon[]> {
  return combineLatest([pokemon$, selectedType$]).pipe(
    map(([pokemon, selectedType]) => {
      if (!selectedType) {
        return pokemon;
      }

      return pokemon.filter((item) => item.types.includes(selectedType));
    }),
  );
}

export function selectAvailableTypes(
  pokemon$: Observable<Pokemon[]>,
): Observable<string[]> {
  return pokemon$.pipe(
    map((pokemon) => {
      const types = pokemon.flatMap((item) => item.types);

      return [...new Set(types)].sort();
    }),
  );
}
