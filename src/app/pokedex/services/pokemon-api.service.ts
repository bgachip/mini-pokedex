import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, map, retry, timer, shareReplay} from 'rxjs';

import {
  Pokemon,
  PokemonAbility,
} from '../models/pokemon.model';

import {
  PokemonAbilitiesResponse,
  PokemonListResponse,
} from '../models/pokemon-api.model';
import { mapPokemon } from '../utils/pokemon.mapper';

@Injectable({
  providedIn: 'root',
})
export class PokemonApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://beta.pokeapi.co/graphql/v1beta';

  private pokemonListCache$?: Observable<Pokemon[]>;

  /**
   * Fetches and caches the first 151 Pokémon.
   */
  getPokemonList(
    limit: number,
    offset: number,
  ): Observable<Pokemon[]> {
    if (
      limit === 151 &&
      offset === 0 &&
      this.pokemonListCache$
    ) {
      return this.pokemonListCache$;
    }

    const request$ = this.http
      .post<PokemonListResponse>(this.apiUrl, {
        query: `
        query GetPokemon($limit: Int, $offset: Int) {
          pokemon_v2_pokemon(limit: $limit, offset: $offset) {
            id
            name
            height
            weight
            pokemon_v2_pokemontypes {
              pokemon_v2_type { name }
            }
            pokemon_v2_pokemonstats {
              base_stat
              pokemon_v2_stat { name }
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
          delay: (_, retryCount) =>
            timer(retryCount * 1000),
        }),
        map((response) =>
          response.data.pokemon_v2_pokemon.map(mapPokemon),
        ),
        shareReplay(1),
      );

    if (limit === 151 && offset === 0) {
      this.pokemonListCache$ = request$;
    }

    return request$;
  }

  getPokemonAbilities(pokemonId: number): Observable<PokemonAbility[]> {
    return this.http
      .post<PokemonAbilitiesResponse>(this.apiUrl, {
        query: `
        query GetAbilities($pokemonId: Int) {
          pokemon_v2_pokemonability(
            where: { pokemon_id: { _eq: $pokemonId } }
          ) {
            pokemon_v2_ability {
              name
              pokemon_v2_abilityeffecttexts(
                where: { language_id: { _eq: 9 } }
              ) {
                short_effect
              }
            }
            is_hidden
          }
        }
      `,
        variables: {
          pokemonId,
        },
      })
      .pipe(
        retry({
          count: 2,
          delay: (_, retryCount) => timer(retryCount * 1000),
        }),
        map((response) =>
          response.data.pokemon_v2_pokemonability.map((ability) => ({
            name: ability.pokemon_v2_ability.name,
            description:
              ability.pokemon_v2_ability
                .pokemon_v2_abilityeffecttexts[0]?.short_effect ?? '',
            isHidden: ability.is_hidden,
          })),
        ),
      );
  }
}
