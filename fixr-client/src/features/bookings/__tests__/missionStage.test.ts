import type { BookingStatus } from '@/types/domain';

import { missionProgressIndex, nextMissionTransition, stageForStatus } from '../missionStage';

const ALL_STATUSES: BookingStatus[] = [
  'pending', 'quotes', 'confirmed', 'on_the_way', 'on_site', 'in_progress', 'done', 'cancelled',
];

describe('stageForStatus', () => {
  it.each([
    ['on_the_way', 'road'],
    ['on_site', 'here'],
    ['in_progress', 'work'],
    ['done', 'done'],
  ] as const)('%s → %s', (status, stage) => {
    expect(stageForStatus(status)).toBe(stage);
  });

  it.each(['pending', 'quotes', 'confirmed', 'cancelled'] as const)('%s → null (pas une mission en direct)', (status) => {
    expect(stageForStatus(status)).toBeNull();
  });
});

describe('missionProgressIndex', () => {
  it.each([
    ['confirmed', 0],
    ['on_the_way', 1],
    ['on_site', 2],
    ['in_progress', 3],
    ['done', 4],
  ] as const)('%s → index %i', (status, index) => {
    expect(missionProgressIndex(status)).toBe(index);
  });
});

describe('nextMissionTransition', () => {
  it('fait avancer FX-24817 de on_the_way à done en exactement 3 transitions', () => {
    let status: BookingStatus = 'on_the_way';
    const visited: BookingStatus[] = [status];
    for (let i = 0; i < 5; i++) {
      const next = nextMissionTransition(status);
      if (!next) break;
      status = next.status;
      visited.push(status);
    }
    expect(visited).toEqual(['on_the_way', 'on_site', 'in_progress', 'done']);
  });

  it('renvoie null pour "done" et tout statut non couvert par la table', () => {
    for (const status of ALL_STATUSES) {
      if (['on_the_way', 'on_site', 'in_progress'].includes(status)) continue;
      expect(nextMissionTransition(status)).toBeNull();
    }
  });

  it('chaque transition pousse le bon type d’événement', () => {
    expect(nextMissionTransition('on_the_way')).toEqual({ status: 'on_site', eventType: 'on_site' });
    expect(nextMissionTransition('on_site')).toEqual({ status: 'in_progress', eventType: 'in_progress' });
    expect(nextMissionTransition('in_progress')).toEqual({ status: 'done', eventType: 'done' });
  });
});
