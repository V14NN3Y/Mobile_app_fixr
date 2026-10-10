import { NOW, messages } from '@/mocks/data';

import { formatChatDayLabel, groupMessagesByDay } from '../grouping';

const now = new Date(NOW);

describe('formatChatDayLabel', () => {
  it('aujourd’hui (msg7 de c_koffi, même jour que NOW)', () => {
    expect(formatChatDayLabel('2026-09-28T14:02:00+01:00', now)).toBe('Aujourd’hui');
  });

  it('hier (msg_sup1 de c_support)', () => {
    expect(formatChatDayLabel('2026-09-27T09:00:00+01:00', now)).toBe('Hier');
  });

  it('plus ancien → date complète (msg_rod1 de c_rodrigue)', () => {
    expect(formatChatDayLabel('2026-09-12T18:55:00+01:00', now)).toBe('sam. 12 sept.');
  });
});

describe('groupMessagesByDay', () => {
  it('regroupe les 7 messages de c_koffi (tous aujourd’hui) en un seul groupe', () => {
    const koffiMessages = messages.filter((m) => m.conversationId === 'c_koffi');
    const groups = groupMessagesByDay(koffiMessages, now);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe('Aujourd’hui');
    expect(groups[0]?.messages).toHaveLength(7);
  });

  it('regroupe les 2 messages de c_rodrigue (plus ancien) en un seul groupe daté', () => {
    const rodrigueMessages = messages.filter((m) => m.conversationId === 'c_rodrigue');
    const groups = groupMessagesByDay(rodrigueMessages, now);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe('sam. 12 sept.');
    expect(groups[0]?.messages).toHaveLength(2);
  });

  it('sépare en plusieurs groupes quand les jours diffèrent', () => {
    const mixed = [
      ...messages.filter((m) => m.conversationId === 'c_support'), // hier
      ...messages.filter((m) => m.conversationId === 'c_koffi').slice(0, 1), // aujourd’hui
    ];
    const groups = groupMessagesByDay(mixed, now);
    expect(groups.map((g) => g.label)).toEqual(['Hier', 'Aujourd’hui']);
  });

  it('tableau vide → aucun groupe', () => {
    expect(groupMessagesByDay([], now)).toEqual([]);
  });
});
