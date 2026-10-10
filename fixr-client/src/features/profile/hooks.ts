import { useMutation, useQuery } from '@tanstack/react-query';

import * as profileApi from './api';

export function useCurrentUser() {
  return useQuery({ queryKey: ['currentUser'], queryFn: profileApi.getCurrentUser });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: profileApi.deleteAccount });
}
