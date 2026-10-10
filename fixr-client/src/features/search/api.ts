import { simulateRequest } from '@/mocks/api';
import { popularSearches } from '@/mocks/data';

export type PopularSearch = { label: string; query: string };

export async function getPopularSearches(): Promise<PopularSearch[]> {
  return simulateRequest(() => popularSearches);
}
