import { quickReplies } from '@/mocks/data';

import { pickCannedReply } from '../replies';

describe('pickCannedReply', () => {
  it.each(quickReplies)('renvoie une réponse spécifique pour « %s »', (reply) => {
    expect(pickCannedReply(reply)).not.toBe('Bien reçu, merci !');
    expect(typeof pickCannedReply(reply)).toBe('string');
  });

  it('renvoie le repli générique pour un texte libre', () => {
    expect(pickCannedReply('Bonjour, êtes-vous disponible demain ?')).toBe('Bien reçu, merci !');
  });
});
