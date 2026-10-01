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
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeleteTeamDialogComponent} from '../../components/delete-team-dialog/delete-team-dialog';

@Component({
  selector: 'app-team-builder-page',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TeamCardComponent,
    MatIcon,
  ],
  templateUrl: './team-builder-page.html',
  styleUrl: './team-builder-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderPageComponent {
  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly selectedTeamId = signal<number | null>(
    this.loadSelectedTeamId(),
  );

  readonly pokemon = toSignal(this.pokemonStore.pokemon$, {
    initialValue: [],
  });

  readonly pokemonLoading = toSignal(this.pokemonStore.loading$, {
    initialValue: false,
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
    const team = this.teams().find(
      (team) => team.id === teamId,
    );

    if (!team) {
      return;
    }

    const dialogRef = this.dialog.open(
      DeleteTeamDialogComponent,
      {
        width: '400px',
        data: {
          teamName: team.name,
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.teamStore.deleteTeam(teamId).subscribe({
        next: () => {
          if (this.selectedTeamId() === teamId) {
            this.selectedTeamId.set(null);
          }

          this.snackBar.open(
            'Team deleted successfully.',
            'Close',
            {
              duration: 3000,
            },
          );
        },
        error: () => {
          this.snackBar.open(
            'Failed to delete team. Please try again.',
            'Close',
            {
              duration: 5000,
            },
          );
        },
      });
    });
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
