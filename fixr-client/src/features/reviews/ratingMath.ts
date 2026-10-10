/**
 * Mise à jour de la note d'un artisan après publication d'un avis — critère d'acceptation
 * du Lot 5 (« la note publiée met à jour le profil artisan, en local »). `ratingDistribution`
 * est stockée en pourcentages entiers (voir Artisan.ratingDistribution), pas en comptes :
 * on reconstruit des comptes approximatifs, on incrémente, on reconvertit en pourcentages,
 * puis on corrige l'arrondi sur le plus gros bucket pour revenir exactement à 100.
 */
type Distribution = Record<1 | 2 | 3 | 4 | 5, number>;

export function nextAverageRating(oldRating: number, oldReviewCount: number, newRating: number): number {
  const weighted = (oldRating * oldReviewCount + newRating) / (oldReviewCount + 1);
  return Math.round(weighted * 10) / 10;
}

export function nextRatingDistribution(
  oldDistribution: Distribution | undefined,
  oldReviewCount: number,
  newRating: number,
): Distribution | undefined {
  if (!oldDistribution) return undefined;

  const bucket = Math.min(5, Math.max(1, Math.round(newRating))) as 1 | 2 | 3 | 4 | 5;
  const newReviewCount = oldReviewCount + 1;

  const counts = ([1, 2, 3, 4, 5] as const).map(
    (star) => Math.round((oldDistribution[star] / 100) * oldReviewCount) + (star === bucket ? 1 : 0),
  );

  const percentages = counts.map((count) => Math.round((count / newReviewCount) * 100));
  const drift = 100 - percentages.reduce((sum, p) => sum + p, 0);
  if (drift !== 0) {
    const largestIndex = percentages.indexOf(Math.max(...percentages));
    percentages[largestIndex] = percentages[largestIndex]! + drift;
  }

  return { 5: percentages[4]!, 4: percentages[3]!, 3: percentages[2]!, 2: percentages[1]!, 1: percentages[0]! };
}
