import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as requestApi from './api';
import type { RequestDraft } from './store';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: RequestDraft) => requestApi.createBooking(draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
