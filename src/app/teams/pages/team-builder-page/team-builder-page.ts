import {ChangeDetectionStrategy, Component, computed, effect, inject, signal,} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {TeamStore} from '../../state/team.store';
import {PokemonStore} from '../../../pokedex/state/pokemon.store';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {TeamFormDialogComponent} from '../../components/team-form-dialog/team-form-dialog';
import {Pokemon} from '../../../pokedex/models/pokemon.model';
import {TeamCardComponent} from '../../components/team-card/team-card';

@Component({
  selector: 'app-team-builder-page',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TeamCardComponent,
  ],
  templateUrl: './team-builder-page.html',
  styleUrl: './team-builder-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderPageComponent {
  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);
  private readonly dialog = inject(MatDialog);

  readonly selectedTeamId = signal<number | null>(
    this.loadSelectedTeamId(),
  );

  readonly pokemon = toSignal(this.pokemonStore.pokemon$, {
    initialValue: [],
  });

  readonly teams = toSignal(this.teamStore.teams$, {
    initialValue: [],
  });

  readonly loading = toSignal(this.teamStore.loading$, {
    initialValue: false,
  });

  readonly error = toSignal(this.teamStore.error$, {
    initialValue: null,
  });

  readonly isEmpty = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.teams().length === 0,
  );

  private readonly persistSelectedTeamEffect = effect(() => {
    const teamId = this.selectedTeamId();

    if (teamId === null) {
      localStorage.removeItem('selectedTeamId');
      return;
    }

    localStorage.setItem('selectedTeamId', String(teamId));
  });

  constructor() {
    this.loadTeams();
    this.pokemonStore.loadPokemon();
  }

  retry(): void {
    this.loadTeams();
  }

  openCreateTeamDialog(): void {
    this.dialog.open(TeamFormDialogComponent, {
      width: '700px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: false,
    });
  }

  getTeamPokemon(pokemonIds: number[]): Pokemon[] {
    const pokemonById = new Map(
      this.pokemon().map((pokemon) => [
        pokemon.id,
        pokemon,
      ]),
    );

    return pokemonIds
      .map((id) => pokemonById.get(id))
      .filter(
        (pokemon): pokemon is Pokemon =>
          pokemon !== undefined,
      );
  }

  deleteTeam(teamId: number): void {
    this.teamStore.deleteTeam(teamId);
  }

  selectTeam(teamId: number): void {
    this.selectedTeamId.set(teamId);
  }

  private loadSelectedTeamId(): number | null {
    const value = localStorage.getItem('selectedTeamId');

    if (value === null) {
      return null;
    }

    const teamId = Number(value);

    return Number.isNaN(teamId)
      ? null
      : teamId;
  }

  private loadTeams(): void {
    this.teamStore.loadTeams();
  }
}
