import { delay } from '@/constants/mock-api';
import { BarGraph } from '@/components/charts/bar-graph';

export default async function BarStats() {
  await delay(1000);

  return <BarGraph />;
}
