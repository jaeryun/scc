import { useQuery } from '@tanstack/react-query';
import { plansQueryOptions, subscriptionQueryOptions, invoicesQueryOptions } from '../api/queries';

export function usePlans() {
  return useQuery(plansQueryOptions());
}

export function useSubscription() {
  return useQuery(subscriptionQueryOptions());
}

export function useInvoices() {
  return useQuery(invoicesQueryOptions());
}
