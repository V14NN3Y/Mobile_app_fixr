import { addAddress, deleteAddress, getAddresses, getPrimaryAddress, setDefaultAddress, updateAddress } from '../api';

describe('getPrimaryAddress', () => {
  it('renvoie l’adresse marquée isDefault (a_maison dans les fixtures)', async () => {
    const primary = await getPrimaryAddress();
    expect(primary.id).toBe('a_maison');
    expect(primary.isDefault).toBe(true);
  }, 10000);
});

describe('addAddress', () => {
  it('ajoute une adresse et la rend disponible dans la liste', async () => {
    // getAddresses() renvoie la référence vive du tableau mock (pas une copie) : capturer la
    // longueur AVANT comme un nombre, pas garder la référence (sinon `before` se mettrait à
    // jour en même temps que `after` une fois addAddress() exécuté).
    const beforeCount = (await getAddresses()).length;
    const added = await addAddress({
      label: 'Atelier',
      line: 'Rue des Artisans, Cotonou',
      neighborhood: 'Fidjrossè',
      city: 'Cotonou',
      lat: 6.36,
      lng: 2.39,
      isDefault: false,
    });
    expect(added.label).toBe('Atelier');
    expect(added.id).toBeTruthy();

    const after = await getAddresses();
    expect(after).toHaveLength(beforeCount + 1);
    expect(after.find((a) => a.id === added.id)?.label).toBe('Atelier');
  }, 15000);
});

describe('updateAddress', () => {
  it('modifie les champs d’une adresse existante (a_bureau)', async () => {
    const updated = await updateAddress('a_bureau', { complement: 'Porte verte, 3ᵉ sonnette' });
    expect(updated.complement).toBe('Porte verte, 3ᵉ sonnette');
    expect(updated.id).toBe('a_bureau');
  }, 10000);
});

describe('setDefaultAddress', () => {
  it('bascule isDefault sur une seule adresse à la fois', async () => {
    const all = await setDefaultAddress('a_maman');
    const defaults = all.filter((a) => a.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe('a_maman');
  }, 10000);
});

describe('deleteAddress', () => {
  it('retire une adresse de la liste', async () => {
    const added = await addAddress({
      label: 'À supprimer',
      line: 'Test',
      neighborhood: 'Test',
      city: 'Cotonou',
      lat: 6.36,
      lng: 2.39,
      isDefault: false,
    });
    await deleteAddress(added.id);
    const after = await getAddresses();
    expect(after.find((a) => a.id === added.id)).toBeUndefined();
  }, 15000);
});
