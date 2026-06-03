import { queryOptions } from '@tanstack/react-query';
import { fetchPokemon } from './service';

export const pokemonKeys = {
  all: ['pokemon'] as const,
  detail: (id: number) => [...pokemonKeys.all, id] as const
};

export const pokemonOptions = (id: number = 25) =>
  queryOptions({
    queryKey: pokemonKeys.detail(id),
    queryFn: () => fetchPokemon(id)
  });
