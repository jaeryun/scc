import { useSuspenseQuery } from '@tanstack/react-query';
import { premiumFeaturesOptions, accessStatsOptions } from '../api/queries';

export function usePremiumFeatures() {
  return useSuspenseQuery(premiumFeaturesOptions());
}

export function useAccessStats() {
  return useSuspenseQuery(accessStatsOptions());
}
