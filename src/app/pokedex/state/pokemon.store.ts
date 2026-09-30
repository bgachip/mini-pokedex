import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import { PokemonApiService } from '../services/pokemon-api.service';

@Injectable({
  providedIn: 'root',
})
export class PokemonStore {
  private readonly pokemonApi = inject(PokemonApiService);

  private readonly pokemonSubject = new BehaviorSubject<Pokemon[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly pokemon$ = this.pokemonSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Loads Pokémon from the API.
   */
  /**
   * Loads and caches the first 151 Pokémon.
   */
  loadPokemon(): void {
    if (this.pokemonSubject.value.length > 0) {
      return;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.pokemonApi
      .getPokemonList(151, 0)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (pokemon) => {
          this.pokemonSubject.next(pokemon);
        },
        error: () => {
          this.errorSubject.next(
            'Failed to load Pokémon. Please try again.',
          );
        },
      });
  }
}
