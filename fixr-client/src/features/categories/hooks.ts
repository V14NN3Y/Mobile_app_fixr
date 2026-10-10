import { useQuery } from '@tanstack/react-query';

import * as categoriesApi from './api';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getCategories });
}
