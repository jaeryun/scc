export type PremiumFeature = {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  enabled: boolean;
};

export type AccessStats = {
  userRole: string;
  hasProAccess: boolean;
  featuresEnabled: number;
  featuresTotal: number;
};
