import { mmkvStorage } from '@/lib/storage';

import { useRequestStore } from '../store';

describe('useRequestStore', () => {
  beforeEach(() => {
    useRequestStore.getState().reset();
  });

  it('écrit chaque champ dans le brouillon persisté (survit à la fermeture de l’app)', async () => {
    useRequestStore.getState().setField('title', 'Fuite sous l’évier');
    useRequestStore.getState().setField('categoryId', 'plomberie');

    const raw = await mmkvStorage.getItem('fixr-request-draft');
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!);
    expect(persisted.state.draft.title).toBe('Fuite sous l’évier');
    expect(persisted.state.draft.categoryId).toBe('plomberie');
  });

  it('selectDay remet slotIndex à undefined (changer de jour force un nouveau choix)', () => {
    useRequestStore.getState().selectSlot(3);
    expect(useRequestStore.getState().draft.slotIndex).toBe(3);
    useRequestStore.getState().selectDay(2);
    expect(useRequestStore.getState().draft.slotIndex).toBeUndefined();
    expect(useRequestStore.getState().draft.dayOffset).toBe(2);
  });

  it('isDirty ignore categoryId/artisanId/openSearch mais détecte une vraie saisie', () => {
    expect(useRequestStore.getState().isDirty()).toBe(false);
    useRequestStore.getState().setField('categoryId', 'plomberie');
    expect(useRequestStore.getState().isDirty()).toBe(false);
    useRequestStore.getState().setField('title', 'Fuite');
    expect(useRequestStore.getState().isDirty()).toBe(true);
  });

  it('reset revient au brouillon par défaut', () => {
    useRequestStore.getState().setField('title', 'Fuite');
    useRequestStore.getState().reset();
    expect(useRequestStore.getState().draft.title).toBe('');
    expect(useRequestStore.getState().isDirty()).toBe(false);
  });

  it('seedFromCategory n’écrase pas un categoryId déjà présent', () => {
    useRequestStore.getState().setField('categoryId', 'electricite');
    useRequestStore.getState().seedFromCategory('plomberie');
    expect(useRequestStore.getState().draft.categoryId).toBe('electricite');
  });
});
