import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { Pokemon } from '../../../pokedex/models/pokemon.model';
import { Team } from '../../models/team.model';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-team-card',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltip,
    MatProgressSpinnerModule,
  ],
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamCardComponent {
  readonly team = input.required<Team>();
  readonly pokemon = input<Pokemon[]>([]);
  readonly selected = input(false);
  readonly loading = input(false);

  readonly selectTeam = output<number>();
  readonly deleteTeam = output<number>();

  onSelect(): void {
    this.selectTeam.emit(this.team().id);
  }

  onDelete(): void {
    this.deleteTeam.emit(this.team().id);
  }
}
