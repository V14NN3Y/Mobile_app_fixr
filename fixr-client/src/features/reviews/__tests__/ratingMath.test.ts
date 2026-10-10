import { artisans } from '@/mocks/data';

import { nextAverageRating, nextRatingDistribution } from '../ratingMath';

const koffi = artisans.find((a) => a.id === 'ar_koffi')!; // rating 4.9, reviewCount 212, distribution {5:88,4:9,3:2,2:1,1:0}

describe('nextAverageRating', () => {
  it('bouge à peine avec un gros reviewCount existant (1 nouvel avis 5★ sur 212)', () => {
    const next = nextAverageRating(koffi.rating, koffi.reviewCount, 5);
    expect(next).toBeCloseTo(4.9, 1);
  });

  it('calcule la moyenne pondérée exacte sur un petit échantillon', () => {
    // 2 avis existants à 4.0, +1 nouvel avis à 5.0 → (4*2 + 5) / 3 = 4.333... → arrondi 4.3
    expect(nextAverageRating(4.0, 2, 5)).toBe(4.3);
  });

  it('arrondit à 1 décimale (format d’affichage de l’app)', () => {
    const result = nextAverageRating(4.86, 7, 5);
    expect(Number.isInteger(result * 10)).toBe(true);
  });
});

describe('nextRatingDistribution', () => {
  it('renvoie undefined si l’artisan n’a pas de distribution existante', () => {
    expect(nextRatingDistribution(undefined, 10, 5)).toBeUndefined();
  });

  it('incrémente le bucket de la nouvelle note et les pourcentages somment toujours 100', () => {
    const next = nextRatingDistribution(koffi.ratingDistribution, koffi.reviewCount, 5);
    expect(next).toBeDefined();
    const sum = next![5] + next![4] + next![3] + next![2] + next![1];
    expect(sum).toBe(100);
  });

  it('sur un petit échantillon, un nouvel avis 1★ fait apparaître une part non nulle au bucket 1★', () => {
    // Avec 212 avis existants chez Koffi, 1 nouvel avis (≈0,47 %) arrondit à 0 % — comportement
    // mathématiquement correct (pourcentages entiers), pas testable à cette échelle. Sur un
    // échantillon plus petit, le même avis doit rester visible après arrondi.
    const next = nextRatingDistribution({ 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 }, 9, 1);
    expect(next![1]).toBeGreaterThan(0);
  });

  it('arrondit la nouvelle note au bucket le plus proche (4.6 → 5★)', () => {
    const next = nextRatingDistribution({ 5: 50, 4: 50, 3: 0, 2: 0, 1: 0 }, 2, 4.6);
    // 2 avis existants (1×5★, 1×4★) + 1 nouvel avis arrondi à 5★ → 2×5★, 1×4★
    const sum = next![5] + next![4] + next![3] + next![2] + next![1];
    expect(sum).toBe(100);
    expect(next![5]).toBeGreaterThan(next![4]);
  });
});
