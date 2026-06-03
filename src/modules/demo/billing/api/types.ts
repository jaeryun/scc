export type Plan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
};

export type Subscription = {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd: string;
};

export type Invoice = {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
};
