import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
} from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import {
  PokemonPagination,
  PokemonSort,
} from '../models/pokemon-table-state.model';

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
        previous.every(
          (type, index) => type === current[index],
        ),
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
}

export function selectFilteredPokemon(
  pokemon$: Observable<Pokemon[]>,
  type$: Observable<string>,
): Observable<Pokemon[]> {
  return combineLatest([
    pokemon$,
    type$,
  ]).pipe(
    map(([pokemon, type]) =>
      pokemon.filter(
        (item) =>
          !type ||
          item.types.includes(type),
      ),
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
}

export function selectPagedPokemon(
  filteredPokemon$: Observable<Pokemon[]>,
  sort$: Observable<PokemonSort>,
  pagination$: Observable<PokemonPagination>,
): Observable<Pokemon[]> {
  return combineLatest([
    filteredPokemon$,
    sort$,
    pagination$,
  ]).pipe(
    map(([pokemon, sort, pagination]) => {
      const sortedPokemon = [...pokemon].sort(
        (a, b) => comparePokemon(a, b, sort),
      );

      const start =
        pagination.pageIndex * pagination.pageSize;

      return sortedPokemon.slice(
        start,
        start + pagination.pageSize,
      );
    }),
    distinctUntilChanged(
      (previous, current) =>
        previous.length === current.length &&
        previous.every(
          (pokemon, index) =>
            pokemon.id === current[index]?.id,
        ),
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
}

function comparePokemon(
  a: Pokemon,
  b: Pokemon,
  sort: PokemonSort,
): number {
  let result: number;

  switch (sort.active) {
    case 'hp':
      result = a.stats.hp - b.stats.hp;
      break;

    case 'attack':
      result = a.stats.attack - b.stats.attack;
      break;

    case 'defense':
      result = a.stats.defense - b.stats.defense;
      break;

    case 'specialAttack':
      result =
        a.stats.specialAttack -
        b.stats.specialAttack;
      break;

    case 'specialDefense':
      result =
        a.stats.specialDefense -
        b.stats.specialDefense;
      break;

    case 'speed':
      result = a.stats.speed - b.stats.speed;
      break;

    case 'total':
      result = getTotal(a) - getTotal(b);
      break;

    case 'name':
    default:
      result = a.name.localeCompare(b.name);
      break;
  }

  return sort.direction === 'desc'
    ? -result
    : result;
}

function getTotal(pokemon: Pokemon): number {
  const stats = pokemon.stats;

  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed
  );
}
