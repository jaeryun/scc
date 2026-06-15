import { faker } from '@faker-js/faker';

export function makeSite(overrides: Partial<{ name: string }> = {}) {
  return { name: overrides.name ?? faker.company.name() };
}

export function makeSubnet(overrides: Partial<{ networkCidr: string; siteId: number }> = {}) {
  return {
    networkCidr: overrides.networkCidr ?? faker.internet.ipv4() + '/24',
    siteId: overrides.siteId ?? 1
  };
}
