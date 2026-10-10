import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as paymentsApi from './api';
import type { PaymentMethod } from '@/types/domain';

export function usePaymentMethods() {
  return useQuery({ queryKey: ['paymentMethods'], queryFn: paymentsApi.getPaymentMethods });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PaymentMethod, 'id' | 'isDefault'>) => paymentsApi.addPaymentMethod(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.removePaymentMethod(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.setDefaultPaymentMethod(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}
