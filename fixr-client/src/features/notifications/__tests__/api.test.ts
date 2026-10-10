import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api';

describe('markNotificationRead', () => {
  it('marque une notification comme lue (n3, non lue dans les fixtures)', async () => {
    const before = await getNotifications();
    expect(before.find((n) => n.id === 'n3')?.read).toBe(false);

    const notification = await markNotificationRead('n3');
    expect(notification.read).toBe(true);

    const after = await getNotifications();
    expect(after.find((n) => n.id === 'n3')?.read).toBe(true);
  }, 10000);
});

describe('markAllNotificationsRead', () => {
  it('marque toutes les notifications comme lues', async () => {
    const all = await markAllNotificationsRead();
    expect(all.every((n) => n.read)).toBe(true);
  }, 10000);
});
