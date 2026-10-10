import { getGreeting } from '../greeting';

describe('getGreeting', () => {
  it('renvoie « Bonjour » de 5h à 17h59', () => {
    expect(getGreeting(new Date(2026, 0, 1, 5, 0))).toBe('Bonjour');
    expect(getGreeting(new Date(2026, 0, 1, 12, 30))).toBe('Bonjour');
    expect(getGreeting(new Date(2026, 0, 1, 17, 59))).toBe('Bonjour');
  });

  it('renvoie « Bonsoir » de 18h à 4h59', () => {
    expect(getGreeting(new Date(2026, 0, 1, 18, 0))).toBe('Bonsoir');
    expect(getGreeting(new Date(2026, 0, 1, 23, 0))).toBe('Bonsoir');
    expect(getGreeting(new Date(2026, 0, 1, 4, 59))).toBe('Bonsoir');
  });
});
