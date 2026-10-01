import {
  ChangeDetectionStrategy,
  Component,
  computed, DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatPaginator,
  MatPaginatorModule,
} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';

import {
  Pokemon,
  PokemonAbility,
  PokemonStats,
} from '../models/pokemon.model';
import {PokemonStore} from '../state/pokemon.store';
import {selectAvailableTypes} from '../state/pokemon.selectors';
import { PokemonApiService } from '../services/pokemon-api.service';
import { PokemonDetailComponent } from '../components/pokemon-detail/pokemon-detail';

@Component({
  selector: 'app-pokedex-page',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSidenavModule,
    PokemonDetailComponent,
  ],
  templateUrl: './pokedex-page.html',
  styleUrl: './pokedex-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPageComponent {
  private readonly pokemonStore = inject(PokemonStore);
  private readonly pokemonApi = inject(PokemonApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedPokemon = signal<Pokemon | null>(null);
  readonly abilities = signal<PokemonAbility[]>([]);
  readonly abilitiesLoading = signal(false);
  readonly abilitiesError = signal<string | null>(null);

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly typeControl = new FormControl('', {
    nonNullable: true,
  });

  private readonly filteredPokemon$ = this.searchControl.valueChanges.pipe(
    startWith(this.searchControl.value),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((searchTerm) =>
      combineLatest([
        this.pokemonStore.pokemon$,
        this.typeControl.valueChanges.pipe(
          startWith(this.typeControl.value),
          distinctUntilChanged(),
        ),
      ]).pipe(
        map(([pokemon, selectedType]) => {
          const normalizedSearchTerm = searchTerm
            .trim()
            .toLowerCase();

          return pokemon.filter((item) => {
            const matchesName = item.name
              .toLowerCase()
              .includes(normalizedSearchTerm);

            const matchesType =
              !selectedType ||
              item.types.includes(selectedType);

            return matchesName && matchesType;
          });
        }),
      ),
    ),
  );

  readonly filteredPokemon = toSignal(this.filteredPokemon$, {
    initialValue: [],
  });

  readonly pokemon = toSignal(this.pokemonStore.pokemon$, {
    initialValue: [],
  });

  readonly loading = toSignal(this.pokemonStore.loading$, {
    initialValue: false,
  });

  readonly error = toSignal(this.pokemonStore.error$, {
    initialValue: null,
  });

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly dataSource = new MatTableDataSource(this.pokemon());

  readonly isEmpty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.pokemon().length === 0,
  );

  readonly availableTypes = toSignal(
    selectAvailableTypes(this.pokemonStore.pokemon$),
    {
      initialValue: [],
    },
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

  private readonly updateTableEffect = effect(() => {
    this.dataSource.data = this.filteredPokemon();

    const sort = this.sort();
    const paginator = this.paginator();

    if (sort) {
      this.dataSource.sort = sort;
    }

    if (paginator) {
      this.dataSource.paginator = paginator;

      if (paginator.pageIndex > 0) {
        paginator.firstPage();
      }
    }
  });

  constructor() {
    this.dataSource.sortingDataAccessor = (pokemon, property) => {
      switch (property) {
        case 'types':
          return pokemon.types.join(', ');

        case 'hp':
          return pokemon.stats.hp;

        case 'attack':
          return pokemon.stats.attack;

        case 'defense':
          return pokemon.stats.defense;

        case 'specialAttack':
          return pokemon.stats.specialAttack;

        case 'specialDefense':
          return pokemon.stats.specialDefense;

        case 'speed':
          return pokemon.stats.speed;

        case 'total':
          return this.getTotal(pokemon.stats);

        case 'name':
          return pokemon.name;

        default:
          return '';
      }
    };

    this.loadPokemon();
  }

  retry(): void {
    this.loadPokemon();
  }

  getTotal(stats: PokemonStats): number {
    return (
      stats.hp +
      stats.attack +
      stats.defense +
      stats.specialAttack +
      stats.specialDefense +
      stats.speed
    );
  }

  selectPokemon(pokemon: Pokemon): void {
    this.selectedPokemon.set(pokemon);
    this.loadAbilities(pokemon.id);
  }

  closePokemonDetail(): void {
    this.selectedPokemon.set(null);
    this.abilities.set([]);
    this.abilitiesError.set(null);
  }

  retryAbilities(): void {
    const pokemon = this.selectedPokemon();

    if (pokemon) {
      this.loadAbilities(pokemon.id);
    }
  }

  private loadPokemon(): void {
    this.pokemonStore.loadPokemon();
  }

  private loadAbilities(pokemonId: number): void {
    this.abilitiesLoading.set(true);
    this.abilitiesError.set(null);
    this.abilities.set([]);

    this.pokemonApi
      .getPokemonAbilities(pokemonId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (abilities) => {
          this.abilities.set(abilities);
          this.abilitiesLoading.set(false);
        },
        error: () => {
          this.abilitiesError.set(
            'Failed to load abilities. Please try again.',
          );
          this.abilitiesLoading.set(false);
        },
      });
  }
}
