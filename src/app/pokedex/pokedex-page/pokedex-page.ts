import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { PokemonStore } from '../state/pokemon.store';

@Component({
  selector: 'app-pokedex-page',
  imports: [
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './pokedex-page.html',
  styleUrl: './pokedex-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPageComponent {
  private readonly pokemonStore = inject(PokemonStore);

  readonly pokemon = toSignal(this.pokemonStore.pokemon$, {
    initialValue: [],
  });

  readonly loading = toSignal(this.pokemonStore.loading$, {
    initialValue: false,
  });

  readonly error = toSignal(this.pokemonStore.error$, {
    initialValue: null,
  });

  readonly isEmpty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.pokemon().length === 0,
  );

  readonly displayedColumns = [
    'sprite',
    'name',
    'types',
    'hp',
    'attack',
    'defense',
    'specialAttack',
    'specialDefense',
    'speed',
    'total',
  ];

  constructor() {
    this.loadPokemon();
  }

  retry(): void {
    this.loadPokemon();
  }

  getTotal(pokemonIndex: number): number {
    const stats = this.pokemon()[pokemonIndex]?.stats;

    if (!stats) {
      return 0;
    }

    return (
      stats.hp +
      stats.attack +
      stats.defense +
      stats.specialAttack +
      stats.specialDefense +
      stats.speed
    );
  }

  private loadPokemon(): void {
    this.pokemonStore.loadPokemon();
  }
}
