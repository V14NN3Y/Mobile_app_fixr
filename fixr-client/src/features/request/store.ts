/**
 * Brouillon de demande — design/Request*.dc.html. État de session persisté (MMKV) : un
 * brouillon survit à la fermeture de l'app (critère d'acceptation du Lot 4). Chaque écran
 * d'étape lit/écrit directement ce store, jamais d'état local dupliqué par champ — c'est ce
 * qui garantit que « retour arrière entre étapes conserve les saisies » sans plomberie
 * supplémentaire.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';
import type { CategoryId } from '@/theme/tokens';
import type { Artisan, Urgency } from '@/types/domain';

export type RequestMedia = { id: string; kind: 'photo' | 'video'; uri: string; durationSec?: number };

export type RequestDraft = {
  categoryId?: CategoryId;
  title: string;
  description: string;
  media: RequestMedia[];
  urgency: Urgency;
  budget?: number;
  artisanId?: string;
  openSearch: boolean;
  addressId?: string;
  addressComplement: string;
  addressAccessInstructions: string;
  dayOffset?: number;
  slotIndex?: number;
};

export function createDefaultDraft(): RequestDraft {
  return {
    title: '',
    description: '',
    media: [],
    urgency: 'week',
    openSearch: true,
    addressComplement: '',
    addressAccessInstructions: '',
  };
}

/** Champs comptant pour « y a-t-il une saisie à perdre ? » (bouton Fermer). categoryId/
 * artisanId/openSearch sont exclus : ils sont amorcés par la navigation (profil artisan,
 * tuile catégorie), jamais tapés par l'utilisateur — les compter ferait apparaître la boîte
 * « Abandonner ? » dès le premier appui sur X d'un flux arrivé avec un artisan présélectionné. */
const DIRTY_FIELDS = [
  'title',
  'description',
  'media',
  'budget',
  'addressId',
  'addressComplement',
  'addressAccessInstructions',
  'dayOffset',
  'slotIndex',
] as const satisfies readonly (keyof RequestDraft)[];

type RequestState = {
  draft: RequestDraft;
  setField: <K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) => void;
  addMedia: (item: RequestMedia) => void;
  removeMedia: (id: string) => void;
  selectDay: (dayOffset: number) => void;
  selectSlot: (slotIndex: number) => void;
  seedFromArtisan: (artisan: Artisan) => void;
  seedFromCategory: (categoryId: CategoryId) => void;
  isDirty: () => boolean;
  reset: () => void;
};

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      draft: createDefaultDraft(),

      setField: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),

      addMedia: (item) =>
        set((s) => ({ draft: { ...s.draft, media: [...s.draft.media, item] } })),
      removeMedia: (id) =>
        set((s) => ({ draft: { ...s.draft, media: s.draft.media.filter((m) => m.id !== id) } })),

      selectDay: (dayOffset) =>
        set((s) => ({ draft: { ...s.draft, dayOffset, slotIndex: undefined } })),
      selectSlot: (slotIndex) => set((s) => ({ draft: { ...s.draft, slotIndex } })),

      seedFromArtisan: (artisan) => {
        if (get().draft.categoryId !== undefined) return;
        set((s) => ({
          draft: {
            ...s.draft,
            artisanId: artisan.id,
            openSearch: false,
            categoryId: artisan.categories[0],
          },
        }));
      },
      seedFromCategory: (categoryId) => {
        if (get().draft.categoryId !== undefined) return;
        set((s) => ({ draft: { ...s.draft, categoryId } }));
      },

      isDirty: () => {
        const draft = get().draft;
        const defaults = createDefaultDraft();
        return DIRTY_FIELDS.some((key) => {
          if (key === 'media') return draft.media.length > 0;
          return draft[key] !== defaults[key];
        });
      },

      reset: () => set({ draft: createDefaultDraft() }),
    }),
    {
      name: 'fixr-request-draft',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
