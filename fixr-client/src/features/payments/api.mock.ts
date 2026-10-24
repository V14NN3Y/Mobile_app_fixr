import { ApiError, simulateRequest } from '@/mocks/api';
import { paymentMethods } from '@/mocks/data';
import type { PaymentMethod } from '@/types/domain';

function findPaymentMethodOrThrow(id: string): PaymentMethod {
  const method = paymentMethods.find((p) => p.id === id);
  if (!method) throw new ApiError('Moyen de paiement introuvable', 404);
  return method;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return simulateRequest(() => paymentMethods);
}

export async function addPaymentMethod(input: Omit<PaymentMethod, 'id' | 'isDefault'>): Promise<PaymentMethod> {
  return simulateRequest(() => {
    const method: PaymentMethod = { ...input, id: `pm${Date.now()}`, isDefault: false };
    paymentMethods.push(method);
    return method;
  });
}

export async function removePaymentMethod(id: string): Promise<void> {
  return simulateRequest(() => {
    findPaymentMethodOrThrow(id);
    const index = paymentMethods.findIndex((p) => p.id === id);
    paymentMethods.splice(index, 1);
  });
}

/** Bascule isDefault sur tout le tableau — un seul moyen de paiement par défaut à la fois. */
export async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod[]> {
  return simulateRequest(() => {
    findPaymentMethodOrThrow(id);
    for (const method of paymentMethods) method.isDefault = method.id === id;
    return paymentMethods;
  });
}
