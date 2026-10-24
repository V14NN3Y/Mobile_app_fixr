import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import type { PaymentMethod } from '@/types/domain';

const SELECT = 'id, kind, label, is_default';

type Row = { id: string; kind: PaymentMethod['kind']; label: string; is_default: boolean };

function toPaymentMethod(row: Row): PaymentMethod {
  return { id: row.id, kind: row.kind, label: row.label, isDefault: row.is_default };
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase.from('payment_methods').select(SELECT);
  if (error) throw new ApiError(error.message);
  return (data as Row[]).map(toPaymentMethod);
}

export async function addPaymentMethod(input: Omit<PaymentMethod, 'id' | 'isDefault'>): Promise<PaymentMethod> {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({ owner_id: ownerId, kind: input.kind, label: input.label, is_default: false })
    .select(SELECT)
    .single();
  if (error) throw new ApiError(error.message);
  return toPaymentMethod(data as Row);
}

export async function removePaymentMethod(id: string): Promise<void> {
  const { error, count } = await supabase.from('payment_methods').delete({ count: 'exact' }).eq('id', id);
  if (error) throw new ApiError(error.message);
  if (!count) throw new ApiError('Moyen de paiement introuvable', 404);
}

/** Le trigger payment_methods_single_default (migration functions_triggers) démote les
 * autres atomiquement. */
export async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod[]> {
  const { error } = await supabase.from('payment_methods').update({ is_default: true }).eq('id', id);
  if (error) throw new ApiError(error.message);
  return getPaymentMethods();
}
