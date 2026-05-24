'use client';

import { useQuery } from '@tanstack/react-query';
import { subnetsQueryOptions } from '../api/queries';

export function useSubnets() {
  return useQuery(subnetsQueryOptions());
}
