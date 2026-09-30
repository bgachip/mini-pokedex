export interface PokemonListResponse {
  data: {
    pokemon_v2_pokemon: PokemonApiItem[];
  };
}

export interface PokemonApiItem {
  id: number;
  name: string;
  height: number;
  weight: number;
  pokemon_v2_pokemontypes: PokemonApiType[];
  pokemon_v2_pokemonstats: PokemonApiStat[];
  pokemon_v2_pokemonsprites: PokemonApiSprite[];
}

export interface PokemonApiType {
  pokemon_v2_type: {
    name: string;
  };
}

export interface PokemonApiStat {
  base_stat: number;
  pokemon_v2_stat: {
    name: string;
  };
}

export interface PokemonApiSprite {
  sprites: string;
}

export interface PokemonAbilitiesResponse {
  data: {
    pokemon_v2_pokemonability: PokemonApiAbility[];
  };
}

export interface PokemonApiAbility {
  pokemon_v2_ability: {
    name: string;
    pokemon_v2_abilityeffecttexts: PokemonApiAbilityEffect[];
  };
  is_hidden: boolean;
}

export interface PokemonApiAbilityEffect {
  short_effect: string;
}
