import { notifications } from '@/mocks/data';

import { resolveDeepLink } from '../deepLink';

describe('resolveDeepLink', () => {
  it('résout bookings/{id} (détail)', () => {
    expect(resolveDeepLink('fixr://bookings/FX-24990')).toBe('/bookings/FX-24990');
  });

  it('résout bookings/{id}/live (mission en direct)', () => {
    expect(resolveDeepLink('fixr://bookings/FX-24817/live')).toBe('/bookings/FX-24817/live');
  });

  it('résout bookings/{id}/report (rapport)', () => {
    expect(resolveDeepLink('fixr://bookings/FX-24402/report')).toBe('/bookings/FX-24402/report');
  });

  it('résout bookings/{id}/review (évaluation)', () => {
    expect(resolveDeepLink('fixr://bookings/FX-24402/review')).toBe('/bookings/FX-24402/review');
  });

  it('résout messages/{threadId} (chat)', () => {
    expect(resolveDeepLink('fixr://messages/c_koffi')).toBe('/messages/c_koffi');
  });

  it('résout profile/settings', () => {
    expect(resolveDeepLink('fixr://profile/settings')).toBe('/profile/settings');
  });

  it('renvoie null pour un lien non reconnu', () => {
    expect(resolveDeepLink('fixr://unknown/path')).toBeNull();
    expect(resolveDeepLink('fixr://bookings')).toBeNull();
  });

  it('résout les 8 deepLink réels de mocks/data.ts sans retourner null', () => {
    for (const n of notifications) {
      expect(resolveDeepLink(n.deepLink)).not.toBeNull();
    }
  });
});
