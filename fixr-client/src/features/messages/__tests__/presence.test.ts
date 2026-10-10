import { artisans, conversations, messages } from '@/mocks/data';

import { presenceLabel } from '../presence';

const koffi = artisans.find((a) => a.id === 'ar_koffi')!; // online: true
const rodrigue = artisans.find((a) => a.id === 'ar_rodrigue')!; // online: false
const cKoffi = conversations.find((c) => c.id === 'c_koffi')!;
const cRodrigue = conversations.find((c) => c.id === 'c_rodrigue')!;
const koffiMessages = messages.filter((m) => m.conversationId === 'c_koffi');
const rodrigueMessages = messages.filter((m) => m.conversationId === 'c_rodrigue');

describe('presenceLabel', () => {
  it('pas d’artisan (Support FIXR) → null', () => {
    expect(presenceLabel(undefined, true, [], cKoffi)).toBeNull();
  });

  it('connecté et artisan en ligne → « En ligne »', () => {
    expect(presenceLabel(koffi, true, koffiMessages, cKoffi)).toBe('En ligne');
  });

  it('hors connexion → « Vu à… » (dernier message entrant de c_koffi, 14:02)', () => {
    expect(presenceLabel(koffi, false, koffiMessages, cKoffi)).toBe('Vu à 14:02');
  });

  it('connecté mais artisan hors ligne → « Vu à… » (dernier entrant de c_rodrigue, 19:00)', () => {
    expect(presenceLabel(rodrigue, true, rodrigueMessages, cRodrigue)).toBe('Vu à 19:00');
  });

  it('aucun message entrant → repli sur conversation.lastAt', () => {
    expect(presenceLabel(koffi, false, [], cKoffi)).toBe('Vu à 14:02');
  });
});
