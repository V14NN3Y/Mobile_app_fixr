import { ApiError, simulateRequest } from '@/mocks/api';
import { addresses } from '@/mocks/data';
import type { Address } from '@/types/domain';

function findAddressOrThrow(id: string): Address {
  const address = addresses.find((a) => a.id === id);
  if (!address) throw new ApiError('Adresse introuvable', 404);
  return address;
}

/** Adresse par défaut — utilisée comme zone d'intervention par défaut (Accueil, Recherche).
 * Lot 7 : dérivée du vrai champ isDefault, plus de la position dans le tableau. */
export async function getPrimaryAddress(): Promise<Address> {
  return simulateRequest(() => addresses.find((a) => a.isDefault) ?? addresses[0]!);
}

/** Toutes les adresses enregistrées — étape Adresse de la demande, Mes adresses. */
export async function getAddresses(): Promise<Address[]> {
  return simulateRequest(() => addresses);
}

export async function addAddress(input: Omit<Address, 'id'>): Promise<Address> {
  return simulateRequest(() => {
    const address: Address = { ...input, id: `a_${Date.now()}` };
    addresses.push(address);
    return address;
  });
}

export async function updateAddress(id: string, patch: Partial<Omit<Address, 'id'>>): Promise<Address> {
  return simulateRequest(() => {
    const address = findAddressOrThrow(id);
    Object.assign(address, patch);
    return address;
  });
}

export async function deleteAddress(id: string): Promise<void> {
  return simulateRequest(() => {
    findAddressOrThrow(id);
    const index = addresses.findIndex((a) => a.id === id);
    addresses.splice(index, 1);
  });
}

/** Bascule isDefault sur tout le tableau — une seule adresse par défaut à la fois. */
export async function setDefaultAddress(id: string): Promise<Address[]> {
  return simulateRequest(() => {
    findAddressOrThrow(id);
    for (const address of addresses) address.isDefault = address.id === id;
    return addresses;
  });
}
