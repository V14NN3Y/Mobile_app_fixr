import { buildSuggestionPool, searchSuggestions } from '../suggestions';

const categories = [{ id: 'plomberie' as const, label: 'Plomberie', artisanCount: 48 }];
const artisans = [
  {
    id: 'ar_koffi',
    firstName: 'Koffi',
    lastName: 'Agbodjan',
    trade: 'Plombier-sanitaire',
    categories: ['plomberie' as const],
    neighborhood: 'Fidjrossè',
    city: 'Cotonou',
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 212,
    interventions: 480,
    yearsExperience: 9,
    verification: 'pro' as const,
    online: true,
    availability: { label: 'Dispo aujourd’hui', today: true },
    priceFrom: 5000,
    skills: [],
    zones: [],
    prices: [],
    gallery: [],
    lat: 0,
    lng: 0,
  },
];

describe('searchSuggestions', () => {
  it('ignore les accents et la casse', () => {
    const pool = buildSuggestionPool(categories, artisans);
    // « Fidjrossè » (lieu statique, avec accent) retrouvé sans l'accent et en majuscules.
    expect(searchSuggestions(pool, 'FIDJROSSE', 'tout').some((s) => s.label.includes('Fidjrossè'))).toBe(
      true,
    );
    expect(searchSuggestions(pool, 'plomberie', 'tout').some((s) => s.label === 'Plomberie')).toBe(
      true,
    );
  });

  it('filtre par mode', () => {
    const pool = buildSuggestionPool(categories, artisans);
    const artisanOnly = searchSuggestions(pool, 'koffi', 'artisan');
    expect(artisanOnly.every((s) => s.kind === 'artisan')).toBe(true);
    expect(searchSuggestions(pool, 'koffi', 'lieu')).toHaveLength(0);
  });

  it('renvoie un tableau vide pour une requête vide', () => {
    const pool = buildSuggestionPool(categories, artisans);
    expect(searchSuggestions(pool, '', 'tout')).toHaveLength(0);
    expect(searchSuggestions(pool, '   ', 'tout')).toHaveLength(0);
  });
});
