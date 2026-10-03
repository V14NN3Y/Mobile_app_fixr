/**
 * Mutations React Query autour de src/features/auth/api.ts — état de soumission
 * (isPending) et erreur réseau (error) gérés de façon identique sur les 3 formulaires
 * (Login, Otp, Signup).
 */
import { useMutation } from '@tanstack/react-query';

import * as authApi from './api';

export function useRequestOtp() {
  return useMutation({ mutationFn: authApi.requestOtp });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authApi.verifyOtp(phone, code),
  });
}

export function useSignUp() {
  return useMutation({ mutationFn: authApi.signUp });
}

export function useSignInWithEmail() {
  return useMutation({ mutationFn: authApi.signInWithEmail });
}
