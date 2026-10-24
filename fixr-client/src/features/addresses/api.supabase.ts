import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import type { Address } from '@/types/domain';

type AddressRow = {
  id: string;
  label: string;
  line: string;
  neighborhood: string | null;
  city: string;
  landmark: string | null;
  complement: string | null;
  access_instructions: string | null;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  is_default: boolean;
};

function toAddress(row: AddressRow): Address {
  const [lng, lat] = row.location?.coordinates ?? [0, 0];
  return {
    id: row.id,
    label: row.label,
    line: row.line,
    neighborhood: row.neighborhood ?? '',
    city: row.city,
    landmark: row.landmark ?? undefined,
    complement: row.complement ?? undefined,
    accessInstructions: row.access_instructions ?? undefined,
    lat,
    lng,
    isDefault: row.is_default,
  };
}

const SELECT = 'id, label, line, neighborhood, city, landmark, complement, access_instructions, location, is_default';

export async function getPrimaryAddress(): Promise<Address> {
  const addresses = await getAddresses();
  return addresses.find((a) => a.isDefault) ?? addresses[0]!;
}

export async function getAddresses(): Promise<Address[]> {
  const { data, error } = await supabase.from('addresses').select(SELECT);
  if (error) throw new ApiError(error.message);
  return (data as AddressRow[]).map(toAddress);
}

export async function addAddress(input: Omit<Address, 'id'>): Promise<Address> {
  const ownerId = await requireUserId();
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      owner_id: ownerId,
      label: input.label,
      line: input.line,
      neighborhood: input.neighborhood,
      city: input.city,
      landmark: input.landmark ?? null,
      complement: input.complement ?? null,
      access_instructions: input.accessInstructions ?? null,
      location: { type: 'Point', coordinates: [input.lng, input.lat] },
      is_default: input.isDefault,
    })
    .select(SELECT)
    .single();
  if (error) throw new ApiError(error.message);
  return toAddress(data as AddressRow);
}

export async function updateAddress(id: string, patch: Partial<Omit<Address, 'id'>>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      ...(patch.label !== undefined ? { label: patch.label } : {}),
      ...(patch.line !== undefined ? { line: patch.line } : {}),
      ...(patch.neighborhood !== undefined ? { neighborhood: patch.neighborhood } : {}),
      ...(patch.city !== undefined ? { city: patch.city } : {}),
      ...(patch.landmark !== undefined ? { landmark: patch.landmark } : {}),
      ...(patch.complement !== undefined ? { complement: patch.complement } : {}),
      ...(patch.accessInstructions !== undefined ? { access_instructions: patch.accessInstructions } : {}),
      ...(patch.lat !== undefined && patch.lng !== undefined
        ? { location: { type: 'Point', coordinates: [patch.lng, patch.lat] } }
        : {}),
      ...(patch.isDefault !== undefined ? { is_default: patch.isDefault } : {}),
    })
    .eq('id', id)
    .select(SELECT)
    .maybeSingle();
  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError('Adresse introuvable', 404);
  return toAddress(data as AddressRow);
}

export async function deleteAddress(id: string): Promise<void> {
  const { error, count } = await supabase.from('addresses').delete({ count: 'exact' }).eq('id', id);
  if (error) throw new ApiError(error.message);
  if (!count) throw new ApiError('Adresse introuvable', 404);
}

/** Bascule is_default sur une seule adresse — le trigger addresses_single_default
 * (migration functions_triggers) démote les autres atomiquement. */
export async function setDefaultAddress(id: string): Promise<Address[]> {
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
  if (error) throw new ApiError(error.message);
  return getAddresses();
}
