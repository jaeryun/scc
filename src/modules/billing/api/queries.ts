import { queryOptions } from '@tanstack/react-query';
import { getPlans, getSubscription, getInvoices } from './service';

export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const
};

export const plansQueryOptions = () =>
  queryOptions({
    queryKey: billingKeys.plans(),
    queryFn: getPlans
  });

export const subscriptionQueryOptions = () =>
  queryOptions({
    queryKey: billingKeys.subscription(),
    queryFn: getSubscription
  });

export const invoicesQueryOptions = () =>
  queryOptions({
    queryKey: billingKeys.invoices(),
    queryFn: getInvoices
  });
