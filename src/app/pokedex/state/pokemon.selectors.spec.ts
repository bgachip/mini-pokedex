import { firstValueFrom, of } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import {
  selectAvailableTypes,
  selectFilteredPokemon,
  selectPagedPokemon,
} from './pokemon.selectors';

describe('Pokemon selectors', () => {
  const pokemon: Pokemon[] = [
    {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      sprite: '',
      types: ['grass', 'poison'],
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        specialAttack: 65,
        specialDefense: 65,
        speed: 45,
      },
    },
    {
      id: 4,
      name: 'charmander',
      height: 6,
      weight: 85,
      sprite: '',
      types: ['fire'],
      stats: {
        hp: 39,
        attack: 52,
        defense: 43,
        specialAttack: 60,
        specialDefense: 50,
        speed: 65,
      },
    },
    {
      id: 3,
      name: 'venusaur',
      height: 20,
      weight: 1000,
      sprite: '',
      types: ['grass', 'poison'],
      stats: {
        hp: 80,
        attack: 82,
        defense: 83,
        specialAttack: 100,
        specialDefense: 100,
        speed: 80,
      },
    },
  ];

  it('should return unique sorted Pokémon types', async () => {
    const result = await firstValueFrom(
      selectAvailableTypes(of(pokemon)),
    );

    expect(result).toEqual([
      'fire',
      'grass',
      'poison',
    ]);
  });

  it('should filter Pokémon by type', async () => {
    const result = await firstValueFrom(
      selectFilteredPokemon(
        of(pokemon),
        of('grass'),
      ),
    );

    expect(result.map((item) => item.name)).toEqual([
      'bulbasaur',
      'venusaur',
    ]);
  });

  it('should sort and paginate Pokémon', async () => {
    const result = await firstValueFrom(
      selectPagedPokemon(
        of(pokemon),
        of({
          active: 'attack',
          direction: 'desc',
        }),
        of({
          pageIndex: 0,
          pageSize: 2,
        }),
      ),
    );

    expect(result.map((item) => item.name)).toEqual([
      'venusaur',
      'charmander',
    ]);
  });
});
