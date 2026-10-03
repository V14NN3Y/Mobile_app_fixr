import { emailSchema, otpSchema, phoneSchema } from '../schemas';
import { getPasswordCriteria, getPasswordScore, isPasswordValid } from '../password';

describe('phoneSchema', () => {
  it('accepte un numéro béninois avec espaces et le normalise', () => {
    const result = phoneSchema.safeParse('01 97 45 12 36');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('0197451236');
  });

  it('accepte un numéro sans espaces', () => {
    expect(phoneSchema.safeParse('0197451236').success).toBe(true);
  });

  it('refuse un numéro qui ne commence pas par 01', () => {
    const result = phoneSchema.safeParse('0297451236');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Numéro invalide (10 chiffres, commence par 01).',
      );
    }
  });

  it('refuse un numéro trop court', () => {
    expect(phoneSchema.safeParse('0197451').success).toBe(false);
  });

  it('refuse un numéro trop long', () => {
    expect(phoneSchema.safeParse('019745123699').success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('accepte une adresse valide', () => {
    expect(emailSchema.safeParse('aurore.tchibozo@gmail.com').success).toBe(true);
  });

  it('refuse une adresse vide avec le message de la maquette', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Adresse incomplète — exemple : nom@gmail.com');
    }
  });

  it('refuse une adresse incomplète avec le même message', () => {
    const result = emailSchema.safeParse('aurore.tchibozo@gmail');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Adresse incomplète — exemple : nom@gmail.com');
    }
  });
});

describe('otpSchema', () => {
  it('accepte un code à 6 chiffres', () => {
    expect(otpSchema.safeParse({ code: '482917' }).success).toBe(true);
  });

  it('refuse un code incomplet', () => {
    expect(otpSchema.safeParse({ code: '482' }).success).toBe(false);
  });
});

describe('password : critères, score, validité (design/SignupErrors.dc.html)', () => {
  it('détecte chaque critère indépendamment', () => {
    const criteria = getPasswordCriteria('abc123');
    expect(criteria.find((c) => c.key === 'digit')?.met).toBe(true);
    expect(criteria.find((c) => c.key === 'length')?.met).toBe(false);
    expect(criteria.find((c) => c.key === 'uppercase')?.met).toBe(false);
    expect(criteria.find((c) => c.key === 'symbol')?.met).toBe(false);
  });

  it('valide un mot de passe qui respecte les 4 critères', () => {
    expect(isPasswordValid('Cotonou#2026')).toBe(true);
    expect(getPasswordScore('Cotonou#2026')).toBe(4);
  });

  it("refuse un mot de passe qui n'en respecte que certains", () => {
    expect(isPasswordValid('abc123')).toBe(false);
  });

  it('libellés identiques à la checklist de SignupErrors.dc.html', () => {
    const criteria = getPasswordCriteria('');
    expect(criteria.map((c) => c.label)).toEqual([
      '8 caractères min.',
      'Une majuscule',
      'Un chiffre',
      'Un symbole',
    ]);
  });
});
