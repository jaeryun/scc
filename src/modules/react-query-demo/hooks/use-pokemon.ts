import { useSuspenseQuery } from '@tanstack/react-query';
import { pokemonOptions } from '../api/queries';

export function usePokemon(id: number) {
  return useSuspenseQuery(pokemonOptions(id));
}
