import {
  formatConversationTime,
  formatDistanceKm,
  formatFCFA,
  formatFCFAFrom,
  formatFCFARange,
  formatPhone,
  formatPhoneMasked,
  formatWeekdayDate,
  getInitials,
  NBSP,
  NNBSP,
  ON_QUOTE,
} from '../format';

describe('formatFCFA', () => {
  it('groupe les milliers avec une espace fine insécable (22500 → 22 500 FCFA)', () => {
    expect(formatFCFA(22500)).toBe(`22${NNBSP}500${NBSP}FCFA`);
    expect(formatFCFA(22500)).toBe('22 500 FCFA');
  });

  it('ne met pas de séparateur sous 1000', () => {
    expect(formatFCFA(500)).toBe(`500${NBSP}FCFA`);
    expect(formatFCFA(0)).toBe(`0${NBSP}FCFA`);
  });

  it('groupe plusieurs milliers (1000000 → 1 000 000 FCFA)', () => {
    expect(formatFCFA(1000000)).toBe(`1${NNBSP}000${NNBSP}000${NBSP}FCFA`);
  });

  it('arrondit les décimales', () => {
    expect(formatFCFA(1999.6)).toBe(`2${NNBSP}000${NBSP}FCFA`);
  });

  it('renvoie « Sur devis » quand le montant est inconnu', () => {
    expect(formatFCFA(null)).toBe(ON_QUOTE);
    expect(formatFCFA(undefined)).toBe(ON_QUOTE);
  });
});

describe('formatFCFARange', () => {
  it('formate une fourchette (15000, 25000 → 15 000 – 25 000 FCFA)', () => {
    expect(formatFCFARange(15000, 25000)).toBe(
      `15${NNBSP}000${NNBSP}–${NNBSP}25${NNBSP}000${NBSP}FCFA`,
    );
  });

  it('revient à un montant simple quand les bornes sont égales', () => {
    expect(formatFCFARange(5000, 5000)).toBe(formatFCFA(5000));
  });
});

describe('formatFCFAFrom', () => {
  it('préfixe « Dès »', () => {
    expect(formatFCFAFrom(5000)).toBe(`Dès ${formatFCFA(5000)}`);
  });

  it('renvoie « Sur devis » sans montant', () => {
    expect(formatFCFAFrom(null)).toBe(ON_QUOTE);
  });
});

describe('getInitials', () => {
  it('prend la première lettre du prénom et du nom, en majuscules', () => {
    expect(getInitials('Koffi', 'Agbodjan')).toBe('KA');
  });
});

describe('formatDistanceKm', () => {
  it('garde une décimale avec virgule (1.2 → "1,2 km")', () => {
    expect(formatDistanceKm(1.2)).toBe('1,2 km');
  });

  it('omet la décimale pour un nombre entier (28 → "28 km")', () => {
    expect(formatDistanceKm(28)).toBe('28 km');
  });
});

describe('formatWeekdayDate', () => {
  it('préfixe le jour de semaine abrégé (2026-09-29 → mardi → "mar. 29 sept.")', () => {
    expect(formatWeekdayDate('2026-09-29T09:00:00+01:00')).toBe('mar. 29 sept.');
  });

  it('gère dimanche (2026-10-04 → "dim. 4 oct.")', () => {
    expect(formatWeekdayDate('2026-10-04T09:00:00+01:00')).toBe('dim. 4 oct.');
  });
});

describe('formatPhone', () => {
  it('groupe par paires après le préfixe pays (+2290197451236 → +229 01 97 45 12 36)', () => {
    expect(formatPhone('+2290197451236')).toBe('+229 01 97 45 12 36');
  });
});

describe('formatPhoneMasked', () => {
  it('masque le 4ᵉ groupe (+2290197451236 → +229 01 97 45 •• 36)', () => {
    expect(formatPhoneMasked('+2290197451236')).toBe('+229 01 97 45 •• 36');
  });
});

describe('formatConversationTime', () => {
  // NOW des mocks = 2026-09-28T14:02 (lastAt de c_koffi) : aujourd'hui.
  const now = new Date('2026-09-28T14:02:00+01:00');

  it('aujourd’hui → heure (c_fabrice, lastAt 11:58)', () => {
    expect(formatConversationTime('2026-09-28T11:58:00+01:00', now)).toBe('11:58');
  });

  it('hier → « Hier » (c_support, lastAt 09:00 la veille)', () => {
    expect(formatConversationTime('2026-09-27T09:00:00+01:00', now)).toBe('Hier');
  });

  it('plus ancien → date courte (c_mariam, lastAt 26 sept.)', () => {
    expect(formatConversationTime('2026-09-26T08:10:00+01:00', now)).toBe('26 sept.');
  });

  it('bien plus ancien → date courte (c_rodrigue, lastAt 12 sept.)', () => {
    expect(formatConversationTime('2026-09-12T19:00:00+01:00', now)).toBe('12 sept.');
  });
});
