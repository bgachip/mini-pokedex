import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Pokemon } from '../../../pokedex/models/pokemon.model';
import { PokemonStore } from '../../../pokedex/state/pokemon.store';
import { TeamStore } from '../../state/team.store';
import { uniqueTeamNameValidator } from '../../validators/unique-team-name.validator';

@Component({
  selector: 'app-team-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './team-form-dialog.html',
  styleUrl: './team-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamFormDialogComponent {
  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);
  private readonly dialogRef = inject(
    MatDialogRef<TeamFormDialogComponent>,
  );

  readonly submitted = signal(false);
  readonly selectedPokemon = signal<Pokemon[]>([]);

  readonly pokemon = toSignal(this.pokemonStore.pokemon$, {
    initialValue: [],
  });

  readonly pokemonSearchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly pokemonSearch = toSignal(
    this.pokemonSearchControl.valueChanges.pipe(
      startWith(this.pokemonSearchControl.value),
    ),
    {
      initialValue: '',
    },
  );

  readonly teamForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
      ],
      asyncValidators: [
        uniqueTeamNameValidator(this.teamStore.teams$),
      ],
    }),
  });

  readonly isTeamFull = computed(
    () => this.selectedPokemon().length >= 6,
  );

  readonly filteredPokemon = computed(() => {
    if (this.isTeamFull()) {
      return [];
    }

    const searchTerm = this.pokemonSearch()
      .trim()
      .toLowerCase();

    const selectedIds = new Set(
      this.selectedPokemon().map((pokemon) => pokemon.id),
    );

    return this.pokemon()
      .filter(
        (pokemon) =>
          !selectedIds.has(pokemon.id) &&
          pokemon.name.toLowerCase().includes(searchTerm),
      )
      .slice(0, 10);
  });

  constructor() {
    this.pokemonStore.loadPokemon();
  }

  selectPokemon(event: MatAutocompleteSelectedEvent): void {
    if (this.isTeamFull()) {
      return;
    }

    const pokemon = event.option.value as Pokemon;

    this.selectedPokemon.update((current) => [
      ...current,
      pokemon,
    ]);

    this.pokemonSearchControl.setValue('');
  }

  removePokemon(pokemonId: number): void {
    this.selectedPokemon.update((current) =>
      current.filter((pokemon) => pokemon.id !== pokemonId),
    );
  }

  createTeam(): void {
    this.submitted.set(true);

    if (
      this.teamForm.invalid ||
      this.teamForm.pending ||
      this.selectedPokemon().length === 0
    ) {
      this.teamForm.markAllAsTouched();
      return;
    }

    const pokemonIds = this.selectedPokemon().map(
      (pokemon) => pokemon.id,
    );

    this.teamStore.createTeam(
      1,
      this.teamForm.controls.name.value.trim(),
      pokemonIds,
    );

    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
