import { queryOptions } from '@tanstack/react-query';
import { getPremiumFeatures, getAccessStats } from './service';

export const exclusiveKeys = {
  all: ['exclusive'] as const,
  features: () => [...exclusiveKeys.all, 'features'] as const,
  access: () => [...exclusiveKeys.all, 'access'] as const
};

export const premiumFeaturesOptions = () =>
  queryOptions({
    queryKey: exclusiveKeys.features(),
    queryFn: getPremiumFeatures
  });

export const accessStatsOptions = () =>
  queryOptions({
    queryKey: exclusiveKeys.access(),
    queryFn: getAccessStats
  });
