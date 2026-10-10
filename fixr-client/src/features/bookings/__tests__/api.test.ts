import { advanceMissionStage, cancelBooking, getBookingById, getBookings, getReportForBooking, restoreBooking } from '../api';
import { tabForBooking } from '../tabs';

describe('cancelBooking (critère 1 : annuler FX-24990 → Annulées)', () => {
  it('passe FX-24990 à "cancelled", ce qui le déplace vers l’onglet Annulées', async () => {
    const booking = await cancelBooking('FX-24990');
    expect(booking.status).toBe('cancelled');
    expect(booking.cancelledBy).toBe('client');
    expect(tabForBooking(booking.status)).toBe('cancelled');

    const all = await getBookings();
    expect(all.find((b) => b.id === 'FX-24990')?.status).toBe('cancelled');
  }, 10000);

  it('restoreBooking annule l’annulation (toast « Annuler »)', async () => {
    // Réservation distincte de celle du test précédent : chaque test doit rester
    // indépendant de l'ordre d'exécution, le tableau mock étant un état partagé mutable.
    const previousStatus = (await getBookingById('FX-24951')).status;
    await cancelBooking('FX-24951');
    const restored = await restoreBooking('FX-24951', previousStatus);
    expect(restored.status).toBe(previousStatus);
    expect(restored.cancelledBy).toBeUndefined();
    expect(restored.events.some((e) => e.type === 'cancelled')).toBe(false);
  }, 15000);
});

describe('advanceMissionStage (critère 2 : FX-24817 jusqu’au rapport)', () => {
  it('fait avancer FX-24817 de on_the_way à done en 3 appels, puis le rapport existe', async () => {
    let booking = await getBookingById('FX-24817');
    expect(booking.status).toBe('on_the_way');

    booking = await advanceMissionStage('FX-24817');
    expect(booking.status).toBe('on_site');
    expect(booking.events.find((e) => e.type === 'on_site')?.at).not.toBeNull();

    booking = await advanceMissionStage('FX-24817');
    expect(booking.status).toBe('in_progress');

    booking = await advanceMissionStage('FX-24817');
    expect(booking.status).toBe('done');

    const report = await getReportForBooking('FX-24817');
    expect(report.bookingId).toBe('FX-24817');
  }, 20000);
});
