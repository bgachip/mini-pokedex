import { Pokemon, PokemonStats } from '../models/pokemon.model';
import { PokemonApiItem } from '../models/pokemon-api.model';

export function mapPokemon(item: PokemonApiItem): Pokemon {
  return {
    id: item.id,
    name: item.name,
    height: item.height,
    weight: item.weight,
    sprite: getSprite(item),
    types: item.pokemon_v2_pokemontypes.map(
      (type) => type.pokemon_v2_type.name,
    ),
    stats: mapStats(item),
  };
}

function mapStats(item: PokemonApiItem): PokemonStats {
  const stats = new Map(
    item.pokemon_v2_pokemonstats.map((stat) => [
      stat.pokemon_v2_stat.name,
      stat.base_stat,
    ]),
  );

  return {
    hp: stats.get('hp') ?? 0,
    attack: stats.get('attack') ?? 0,
    defense: stats.get('defense') ?? 0,
    specialAttack: stats.get('special-attack') ?? 0,
    specialDefense: stats.get('special-defense') ?? 0,
    speed: stats.get('speed') ?? 0,
  };
}

function getSprite(item: PokemonApiItem): string {
  const sprite = item.pokemon_v2_pokemonsprites[0]?.sprites;

  if (!sprite) {
    return '';
  }

  try {
    const sprites = JSON.parse(sprite) as {
      front_default?: string;
    };

    return sprites.front_default ?? '';
  } catch {
    return '';
  }
}
