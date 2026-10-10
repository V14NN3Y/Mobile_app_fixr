import { simulateRequest } from '@/mocks/api';
import { categories } from '@/mocks/data';
import type { Category } from '@/types/domain';

export async function getCategories(): Promise<Category[]> {
  return simulateRequest(() => categories);
}
