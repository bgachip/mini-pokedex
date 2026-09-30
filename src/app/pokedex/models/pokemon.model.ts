export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprite: string;
  types: string[];
  stats: PokemonStats;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonAbility {
  name: string;
  description: string;
  isHidden: boolean;
}
