import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal, viewChild,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSortModule,
  Sort,
} from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';

import {
  Pokemon,
  PokemonAbility,
  PokemonStats,
} from '../models/pokemon.model';
import {
  PokemonFilters,
  PokemonPagination,
  PokemonSort,
} from '../models/pokemon-table-state.model';
import { PokemonStore } from '../state/pokemon.store';
import {
  selectAvailableTypes,
  selectFilteredPokemon,
  selectPagedPokemon,
} from '../state/pokemon.selectors';
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

  readonly paginator = viewChild(MatPaginator);

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly typeControl = new FormControl('', {
    nonNullable: true,
  });

  private readonly sortSubject =
    new BehaviorSubject<PokemonSort>({
      active: 'name',
      direction: 'asc',
    });

  private readonly paginationSubject =
    new BehaviorSubject<PokemonPagination>({
      pageIndex: 0,
      pageSize: 10,
    });

  private readonly search$ =
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm) => of(searchTerm)),
    );

  private readonly type$ =
    this.typeControl.valueChanges.pipe(
      startWith(this.typeControl.value),
      distinctUntilChanged(),
    );

  private readonly filters$ = combineLatest([
    this.search$,
    this.type$,
  ]).pipe(
    map(
      ([searchTerm, type]): PokemonFilters => ({
        searchTerm,
        type,
      }),
    ),
    distinctUntilChanged(
      (previous, current) =>
        previous.searchTerm === current.searchTerm &&
        previous.type === current.type,
    ),
  );

  private readonly filteredPokemon$ =
    selectFilteredPokemon(
      this.pokemonStore.pokemon$,
      this.filters$,
    );

  private readonly pagedPokemon$ =
    selectPagedPokemon(
      this.filteredPokemon$,
      this.sortSubject.asObservable(),
      this.paginationSubject.asObservable(),
    );

  readonly pokemon = toSignal(
    this.pokemonStore.pokemon$,
    {
      initialValue: [],
    },
  );

  readonly filteredPokemon = toSignal(
    this.filteredPokemon$,
    {
      initialValue: [],
    },
  );

  readonly pagedPokemon = toSignal(
    this.pagedPokemon$,
    {
      initialValue: [],
    },
  );

  readonly loading = toSignal(
    this.pokemonStore.loading$,
    {
      initialValue: false,
    },
  );

  readonly error = toSignal(
    this.pokemonStore.error$,
    {
      initialValue: null,
    },
  );

  readonly availableTypes = toSignal(
    selectAvailableTypes(
      this.pokemonStore.pokemon$,
    ),
    {
      initialValue: [],
    },
  );

  readonly dataSource =
    new MatTableDataSource<Pokemon>();

  readonly totalCount = computed(
    () => this.filteredPokemon().length,
  );

  readonly isEmpty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.filteredPokemon().length === 0,
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
    this.filters$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.resetPagination();
      });

    this.pagedPokemon$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((pokemon) => {
        this.dataSource.data = pokemon;
      });

    this.loadPokemon();
  }

  retry(): void {
    this.loadPokemon();
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.sortSubject.next({
        active: 'name',
        direction: 'asc',
      });
    } else {
      this.sortSubject.next({
        active:
          sort.active as PokemonSort['active'],
        direction: sort.direction,
      });
    }

    this.resetPagination();
  }

  onPageChange(event: PageEvent): void {
    this.paginationSubject.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
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

  private resetPagination(): void {
    const pagination = this.paginationSubject.value;

    if (pagination.pageIndex !== 0) {
      this.paginationSubject.next({
        ...pagination,
        pageIndex: 0,
      });
    }

    const paginator = this.paginator();

    if (paginator && paginator.pageIndex !== 0) {
      paginator.firstPage();
    }
  }

  private loadPokemon(): void {
    this.pokemonStore.loadPokemon();
  }

  private loadAbilities(
    pokemonId: number,
  ): void {
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
