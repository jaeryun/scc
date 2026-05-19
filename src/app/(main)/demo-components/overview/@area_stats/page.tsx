import { delay } from '@/constants/mock-api';
import { AreaGraph } from '@/components/charts/area-graph';

export default async function AreaStats() {
  await delay(2000);
  return <AreaGraph />;
}
