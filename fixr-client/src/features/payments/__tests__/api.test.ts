import { addPaymentMethod, getPaymentMethods, removePaymentMethod, setDefaultPaymentMethod } from '../api';

describe('getPaymentMethods', () => {
  it('renvoie les moyens de paiement mock (mobile_money par défaut, cash)', async () => {
    const methods = await getPaymentMethods();
    expect(methods.find((m) => m.kind === 'mobile_money')?.isDefault).toBe(true);
    expect(methods.some((m) => m.kind === 'cash')).toBe(true);
  }, 10000);
});

describe('addPaymentMethod', () => {
  it('ajoute un moyen de paiement, jamais par défaut à la création', async () => {
    const added = await addPaymentMethod({ kind: 'mobile_money', label: 'Mobile Money •• 90' });
    expect(added.isDefault).toBe(false);
    const all = await getPaymentMethods();
    expect(all.find((m) => m.id === added.id)?.label).toBe('Mobile Money •• 90');
  }, 15000);
});

describe('setDefaultPaymentMethod', () => {
  it('bascule isDefault sur un seul moyen à la fois', async () => {
    const added = await addPaymentMethod({ kind: 'mobile_money', label: 'Mobile Money •• 11' });
    const all = await setDefaultPaymentMethod(added.id);
    const defaults = all.filter((m) => m.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe(added.id);
  }, 15000);
});

describe('removePaymentMethod', () => {
  it('retire un moyen de paiement de la liste', async () => {
    const added = await addPaymentMethod({ kind: 'mobile_money', label: 'Mobile Money •• 22' });
    await removePaymentMethod(added.id);
    const all = await getPaymentMethods();
    expect(all.find((m) => m.id === added.id)).toBeUndefined();
  }, 15000);
});
