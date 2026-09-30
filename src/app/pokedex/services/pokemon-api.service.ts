import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, retry, timer } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import { PokemonListResponse } from '../models/pokemon-api.model';
import { mapPokemon } from '../utils/pokemon.mapper';

@Injectable({
  providedIn: 'root',
})
export class PokemonApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://beta.pokeapi.co/graphql/v1beta';

  /**
   * Fetches a paginated list of Pokémon.
   */
  getPokemonList(limit: number, offset: number): Observable<Pokemon[]> {
    return this.http
      .post<PokemonListResponse>(this.apiUrl, {
        query: `
          query GetPokemon($limit: Int, $offset: Int) {
            pokemon_v2_pokemon(limit: $limit, offset: $offset) {
              id
              name
              height
              weight
              pokemon_v2_pokemontypes {
                pokemon_v2_type {
                  name
                }
              }
              pokemon_v2_pokemonstats {
                base_stat
                pokemon_v2_stat {
                  name
                }
              }
              pokemon_v2_pokemonsprites {
                sprites
              }
            }
          }
        `,
        variables: {
          limit,
          offset,
        },
      })
      .pipe(
        retry({
          count: 2,
          delay: (_, retryCount) => timer(retryCount * 1000),
        }),
        map((response) =>
          response.data.pokemon_v2_pokemon.map(mapPokemon),
        ),
      );
  }
}
