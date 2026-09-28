import { formatFCFA, formatFCFAFrom, formatFCFARange, NBSP, NNBSP, ON_QUOTE } from '../format';

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
