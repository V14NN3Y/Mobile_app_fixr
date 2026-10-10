import { useQuery } from '@tanstack/react-query';

import * as homeApi from './api';

export function useHomeData() {
  return useQuery({ queryKey: ['home'], queryFn: homeApi.getHomeData });
}
