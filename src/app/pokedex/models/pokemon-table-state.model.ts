export type PokemonSortField =
  | 'name'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'specialAttack'
  | 'specialDefense'
  | 'speed'
  | 'total';

export interface PokemonSort {
  active: PokemonSortField;
  direction: 'asc' | 'desc';
}

export interface PokemonPagination {
  pageIndex: number;
  pageSize: number;
}
