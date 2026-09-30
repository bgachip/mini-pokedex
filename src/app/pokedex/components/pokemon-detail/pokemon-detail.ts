import {
  ChangeDetectionStrategy,
  Component, computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  Pokemon,
  PokemonAbility,
} from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-detail',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetailComponent {
  readonly pokemon = input.required<Pokemon>();
  readonly abilities = input<PokemonAbility[]>([]);
  readonly abilitiesLoading = input(false);
  readonly abilitiesError = input<string | null>(null);

  readonly closeDetail = output<void>();
  readonly retryAbilities = output<void>();

  readonly radarPoints = computed(() => {
    const stats = this.pokemon().stats;

    const values = [
      stats.hp,
      stats.attack,
      stats.defense,
      stats.specialAttack,
      stats.specialDefense,
      stats.speed,
    ];

    const center = 100;
    const radius = 80;
    const maxStat = 150;

    return values
      .map((value, index) => {
        const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
        const normalizedValue = Math.min(value / maxStat, 1);
        const pointRadius = radius * normalizedValue;

        const x = center + Math.cos(angle) * pointRadius;
        const y = center + Math.sin(angle) * pointRadius;

        return `${x},${y}`;
      })
      .join(' ');
  });

  getTotal(): number {
    const stats = this.pokemon().stats;

    return (
      stats.hp +
      stats.attack +
      stats.defense +
      stats.specialAttack +
      stats.specialDefense +
      stats.speed
    );
  }
}
