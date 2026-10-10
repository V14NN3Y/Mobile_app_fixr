import { NOW, notifications } from '@/mocks/data';

import { groupNotificationsByDate } from '../grouping';

const now = new Date(NOW);

describe('groupNotificationsByDate', () => {
  it('classe les 8 notifications mock dans 3 groupes (Aujourd’hui/Hier/Cette semaine)', () => {
    const groups = groupNotificationsByDate(notifications, now);
    expect(groups.map((g) => g.label)).toEqual(['Aujourd’hui', 'Hier', 'Cette semaine']);
    expect(groups.map((g) => g.items.length)).toEqual([3, 2, 3]);
  });

  it('trie par `at` décroissant même si le tableau source ne l’est pas (n1 avant n2 dans le mock)', () => {
    const groups = groupNotificationsByDate(notifications, now);
    const todayIds = groups[0]!.items.map((n) => n.id);
    expect(todayIds).toEqual(['n2', 'n1', 'n3']); // 14:02, 13:52, 11:58
  });

  it('omet les seaux vides', () => {
    const onlyToday = notifications.filter((n) => n.id === 'n1');
    const groups = groupNotificationsByDate(onlyToday, now);
    expect(groups).toEqual([{ label: 'Aujourd’hui', items: onlyToday }]);
  });

  it('classe une notification de plus de 7 jours dans « Plus ancien »', () => {
    const old = { ...notifications[0]!, id: 'old', at: '2026-09-01T10:00:00+01:00' };
    const groups = groupNotificationsByDate([old], now);
    expect(groups).toEqual([{ label: 'Plus ancien', items: [old] }]);
  });

  it('tableau vide → aucun groupe', () => {
    expect(groupNotificationsByDate([], now)).toEqual([]);
  });
});
