import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as addressesApi from './api';
import type { Address } from '@/types/domain';

export function usePrimaryAddress() {
  return useQuery({ queryKey: ['addresses', 'primary'], queryFn: addressesApi.getPrimaryAddress });
}

export function useAddresses() {
  return useQuery({ queryKey: ['addresses', 'all'], queryFn: addressesApi.getAddresses });
}

// Chacune invalide seulement ['addresses'] — home/api.ts ne lit jamais addresses[] (Home passe
// par usePrimaryAddress(), déjà sous ce préfixe), contrairement à activeMission/lastBooking
// qui sont dérivés DANS la fonction ['home'] elle-même et nécessitent leur propre invalidation.

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Address, 'id'>) => addressesApi.addAddress(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Address, 'id'>> }) =>
      addressesApi.updateAddress(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.deleteAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefaultAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
