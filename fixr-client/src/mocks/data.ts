/**
 * Données fictives FIXR — identiques à celles des maquettes (design/*.dc.html).
 * « Aujourd'hui » = lundi 28 septembre 2026, heure de Porto-Novo (UTC+1).
 * Coordonnées GPS approximatives (quartiers), à usage de démonstration uniquement.
 * Les écrans n'importent PAS ce fichier directement : passer par src/mocks/api.ts + hooks.
 */

import type {
  Address, AppNotification, Artisan, Booking, Category, Conversation,
  InterventionReport, Message, PaymentMethod, Quote, Review, User,
} from '../types/domain';

export const NOW = '2026-09-28T14:02:00+01:00';

export const user: User = {
  id: 'u_aurore',
  firstName: 'Aurore',
  lastName: 'Tchibozo',
  phone: '+2290197451236',
  phoneVerified: true,
  email: 'aurore.tchibozo@gmail.com',
  memberSince: '2026-03-02T10:00:00+01:00',
  stats: { missions: 7, favorites: 3, reviews: 4 },
};

export const addresses: Address[] = [
  { id: 'a_maison', label: 'Maison', line: 'Carré 412, Haie Vive, Cotonou', neighborhood: 'Haie Vive', city: 'Cotonou',
    landmark: 'Près de la pharmacie Les Cocotiers', complement: 'Maison à étage, portail bleu',
    accessInstructions: 'Deuxième von après la pharmacie Les Cocotiers. Appelez en arrivant, le gardien s’appelle Paulin.',
    lat: 6.3575, lng: 2.3935, isDefault: true },
  { id: 'a_bureau', label: 'Bureau', line: 'Immeuble Les Palmiers, 2e étage, Ganhi, Cotonou', neighborhood: 'Ganhi', city: 'Cotonou',
    landmark: 'Accueil au rez-de-chaussée', lat: 6.3555, lng: 2.4305, isDefault: false },
  { id: 'a_maman', label: 'Chez maman', line: 'Quartier Zopah, Abomey-Calavi', neighborhood: 'Zopah', city: 'Abomey-Calavi',
    landmark: 'Maison après l’église, portail vert', lat: 6.4480, lng: 2.3520, isDefault: false },
];

export const categories: Category[] = [
  { id: 'plomberie', label: 'Plomberie', artisanCount: 48 },
  { id: 'electricite', label: 'Électricité', artisanCount: 36 },
  { id: 'climatisation', label: 'Climatisation', artisanCount: 22 },
  { id: 'peinture', label: 'Peinture', artisanCount: 29 },
  { id: 'menuiserie', label: 'Menuiserie', artisanCount: 17 },
  { id: 'serrurerie', label: 'Serrurerie', artisanCount: 12 },
  { id: 'nettoyage', label: 'Nettoyage', artisanCount: 41 },
  { id: 'reparation', label: 'Réparation', artisanCount: 25 },
];

const plumbingPrices = [
  { label: 'Déplacement + diagnostic', from: 2000, exact: true },
  { label: 'Recherche de fuite', from: 5000 },
  { label: 'Remplacement de robinet', from: 4000 },
  { label: 'Pose de chauffe-eau', from: 15000 },
];

export const artisans: Artisan[] = [
  {
    id: 'ar_koffi', firstName: 'Koffi', lastName: 'Agbodjan', phone: '+2290197001122', trade: 'Plombier-sanitaire', categories: ['plomberie'],
    neighborhood: 'Fidjrossè', city: 'Cotonou', distanceKm: 1.2, rating: 4.9, reviewCount: 212, interventions: 480,
    yearsExperience: 9, verification: 'pro', online: true, responseTimeMin: 10,
    availability: { label: 'Dispo aujourd’hui', today: true, nextSlot: '2026-09-28T16:00:00+01:00' },
    priceFrom: 5000,
    bio: 'Plombier depuis 2017, je travaille surtout à Fidjrossè, Haie Vive et Cadjèhoun. Recherche de fuites, débouchage, pose de chauffe-eau et de surpresseurs. Je donne toujours un devis avant de commencer et je laisse le chantier propre.',
    skills: ['Recherche de fuite', 'Débouchage', 'Chauffe-eau', 'Surpresseur & pompe', 'Tuyauterie PPR / PVC', 'Sanitaires'],
    zones: [{ city: 'Cotonou', neighborhoods: ['Fidjrossè', 'Haie Vive', 'Cadjèhoun', 'Gbégamey', 'Akpakpa'] }, { city: 'Abomey-Calavi', neighborhoods: ['Godomey', 'Zogbadjè'] }],
    prices: plumbingPrices,
    gallery: [
      { id: 'g1', tag: 'Avant / Après', caption: 'Salle de bain · Cadjèhoun' },
      { id: 'g2', tag: 'Chauffe-eau', caption: 'Pose 100 L · Haie Vive' },
      { id: 'g3', tag: 'Surpresseur', caption: 'Villa · Godomey' },
    ],
    ratingDistribution: { 5: 88, 4: 9, 3: 2, 2: 1, 1: 0 },
    lat: 6.3545, lng: 2.3620,
  },
  {
    id: 'ar_sedjro', firstName: 'Sèdjro', lastName: 'Houénou', phone: '+2290197002233', trade: 'Plombier', categories: ['plomberie'],
    neighborhood: 'Cadjèhoun', city: 'Cotonou', distanceKm: 2.8, rating: 4.7, reviewCount: 88, interventions: 190,
    yearsExperience: 6, verification: 'identity', online: true,
    availability: { label: 'Dispo 16h', today: true, nextSlot: '2026-09-28T16:00:00+01:00' },
    priceFrom: 4000, skills: ['Recherche de fuite', 'Débouchage'], zones: [{ city: 'Cotonou', neighborhoods: ['Cadjèhoun', 'Haie Vive'] }],
    prices: plumbingPrices, gallery: [], lat: 6.3610, lng: 2.3850,
  },
  {
    // Indisponible (design/ArtisanStates.dc.html col. 1) — seul artisan du jeu de données
    // à couvrir ce cas, requis par les critères d'acceptation du Lot 3.
    id: 'ar_bernard', firstName: 'Bernard', lastName: 'Mensah', phone: '+2290197003344', trade: 'Plombier-sanitaire', categories: ['plomberie'],
    neighborhood: 'Akpakpa', city: 'Cotonou', distanceKm: 3.4, rating: 4.6, reviewCount: 143, interventions: 320,
    yearsExperience: 12, verification: 'pro', online: false,
    availability: { label: 'Indisponible', today: false, unavailableUntil: '2026-10-12T00:00:00+01:00' },
    priceFrom: null, skills: ['Sanitaires', 'Chauffe-eau'], zones: [{ city: 'Cotonou', neighborhoods: ['Akpakpa', 'Ganhi'] }],
    prices: plumbingPrices, gallery: [], lat: 6.3700, lng: 2.4500,
  },
  {
    id: 'ar_anicet', firstName: 'Anicet', lastName: 'Lokossou', phone: '+2290197004455', trade: 'Plombier', categories: ['plomberie'],
    neighborhood: 'Gbégamey', city: 'Cotonou', distanceKm: 2.1, rating: 4.5, reviewCount: 21, interventions: 34,
    yearsExperience: 3, verification: 'identity', online: false,
    availability: { label: 'Dispo aujourd’hui', today: true }, priceFrom: 3500,
    skills: ['Débouchage'], zones: [{ city: 'Cotonou', neighborhoods: ['Gbégamey'] }], prices: plumbingPrices, gallery: [], lat: 6.3690, lng: 2.4020,
  },
  {
    id: 'ar_rodrigue', firstName: 'Rodrigue', lastName: 'Dossou', phone: '+2290197005566', trade: 'Électricien', categories: ['electricite'],
    neighborhood: 'Cadjèhoun', city: 'Cotonou', distanceKm: 2.5, rating: 4.8, reviewCount: 164, interventions: 350,
    yearsExperience: 8, verification: 'skills', online: false,
    availability: { label: 'Dispo 14h', today: true }, priceFrom: null,
    skills: ['Tableau électrique', 'Prises & éclairage', 'Disjoncteur'], zones: [{ city: 'Cotonou', neighborhoods: ['Cadjèhoun', 'Haie Vive', 'Fidjrossè'] }],
    prices: [{ label: 'Déplacement + diagnostic', from: 2000, exact: true }], gallery: [], lat: 6.3620, lng: 2.3880,
  },
  {
    id: 'ar_fabrice', firstName: 'Fabrice', lastName: 'Ahouandjinou', phone: '+2290197006677', trade: 'Frigoriste', categories: ['climatisation'],
    neighborhood: 'Akpakpa', city: 'Cotonou', distanceKm: 4.1, rating: 4.7, reviewCount: 98, interventions: 210,
    yearsExperience: 7, verification: 'pro', online: true,
    availability: { label: 'Demain', today: false, nextSlot: '2026-09-29T09:00:00+01:00' }, priceFrom: 10000,
    skills: ['Entretien split', 'Recharge gaz', 'Installation'], zones: [{ city: 'Cotonou', neighborhoods: ['Akpakpa', 'Haie Vive'] }],
    prices: [{ label: 'Entretien split', from: 10000 }], gallery: [], lat: 6.3720, lng: 2.4460,
  },
  {
    id: 'ar_christelle', firstName: 'Christelle', lastName: 'Akpovi', phone: '+2290197007788', trade: 'Peintre', categories: ['peinture'],
    neighborhood: 'Haie Vive', city: 'Cotonou', distanceKm: 0.9, rating: 4.8, reviewCount: 73, interventions: 140,
    yearsExperience: 6, verification: 'skills', online: false,
    availability: { label: 'Dispo 15h', today: true }, priceFrom: 20000,
    skills: ['Peinture intérieure', 'Enduit', 'Façade'], zones: [{ city: 'Cotonou', neighborhoods: ['Haie Vive', 'Cadjèhoun'] }],
    prices: [{ label: 'Chambre (murs + plafond)', from: 30000 }], gallery: [], lat: 6.3580, lng: 2.3960,
  },
  {
    id: 'ar_herve', firstName: 'Hervé', lastName: 'Gbaguidi', phone: '+2290197008899', trade: 'Serrurier', categories: ['serrurerie'],
    neighborhood: 'Gbégamey', city: 'Cotonou', distanceKm: 1.8, rating: 4.7, reviewCount: 120, interventions: 260,
    yearsExperience: 10, verification: 'pro', online: true,
    availability: { label: '24h/24', today: true }, priceFrom: 8000,
    skills: ['Ouverture de porte', 'Changement de serrure'], zones: [{ city: 'Cotonou', neighborhoods: ['Gbégamey', 'Ganhi'] }],
    prices: [{ label: 'Ouverture de porte', from: 8000 }], gallery: [], lat: 6.3700, lng: 2.4050,
  },
  {
    id: 'ar_mariam', firstName: 'Mariam', lastName: 'Soulé', phone: '+2290197009900', trade: 'Nettoyage', categories: ['nettoyage'],
    neighborhood: 'Godomey', city: 'Abomey-Calavi', distanceKm: 6.0, rating: 4.9, reviewCount: 301, interventions: 520,
    yearsExperience: 5, verification: 'skills', online: false,
    availability: { label: 'Samedi', today: false }, priceFrom: 10000,
    skills: ['Ménage', 'Après travaux'], zones: [{ city: 'Abomey-Calavi', neighborhoods: ['Godomey', 'Zopah'] }],
    prices: [{ label: 'Ménage 4 h', from: 10000 }], gallery: [], lat: 6.4050, lng: 2.3350,
  },
  {
    id: 'ar_gildas', firstName: 'Gildas', lastName: 'Kpadonou', phone: '+2290197010011', trade: 'Menuisier', categories: ['menuiserie'],
    neighborhood: 'Ouando', city: 'Porto-Novo', distanceKm: 28, rating: 4.6, reviewCount: 57, interventions: 95,
    yearsExperience: 11, verification: 'identity', online: false,
    availability: { label: 'Cette semaine', today: false }, priceFrom: null,
    skills: ['Portes', 'Placards'], zones: [{ city: 'Porto-Novo', neighborhoods: ['Ouando', 'Tokpota'] }],
    prices: [], gallery: [], lat: 6.5000, lng: 2.6200,
  },
  {
    // Profil incomplet (design/ArtisanStates.dc.html)
    id: 'ar_rachidi', firstName: 'Rachidi', lastName: 'Bello', trade: 'Électricien', categories: ['electricite'],
    neighborhood: 'Tokpota', city: 'Porto-Novo', distanceKm: 27, rating: 0, reviewCount: 0, interventions: 0,
    yearsExperience: 0, verification: 'identity', online: false,
    availability: { label: 'Cette semaine', today: false }, priceFrom: null,
    skills: [], zones: [{ city: 'Porto-Novo', neighborhoods: ['Tokpota'] }], prices: [], gallery: [], lat: 6.4950, lng: 2.6100,
  },
];

export const reviews: Review[] = [
  { id: 'rv1', artisanId: 'ar_koffi', authorName: 'Mireille A.', rating: 5, service: 'Fuite de chasse d’eau',
    text: 'Arrivé à l’heure, il a trouvé la fuite en 15 minutes et m’a montré les pièces changées. Très propre.', createdAt: '2026-09-25T10:00:00+01:00' },
  { id: 'rv2', artisanId: 'ar_koffi', authorName: 'Olivier K.', rating: 4.5, service: 'Pose chauffe-eau',
    text: 'Travail sérieux, devis respecté. Un petit retard à cause des embouteillages mais il a prévenu.', createdAt: '2026-09-14T10:00:00+01:00' },
  // Lot 7 : avis publiés par l'utilisatrice courante (Mes avis) — authorId relie l'avis à
  // user.id. rv3 référence FX-23877 (seule réservation à la fois done et reviewed:true dans
  // les fixtures) ; rv4-rv6 n'ont pas de bookingId, comme rv1/rv2 déjà.
  { id: 'rv3', artisanId: 'ar_herve', bookingId: 'FX-23877', authorId: 'u_aurore', authorName: 'Aurore T.', rating: 5,
    service: 'Ouverture de porte + serrure',
    text: 'Intervention rapide un soir tard, sans dégâts sur la porte. Rassurant.', createdAt: '2026-08-31T08:00:00+01:00' },
  { id: 'rv4', artisanId: 'ar_mariam', authorId: 'u_aurore', authorName: 'Aurore T.', rating: 4.5, service: 'Ménage après travaux',
    text: 'Très minutieuse, elle a même nettoyé les vitres sans qu’on lui demande.', createdAt: '2026-08-20T09:00:00+01:00' },
  { id: 'rv5', artisanId: 'ar_fabrice', authorId: 'u_aurore', authorName: 'Aurore T.', rating: 4, service: 'Entretien climatiseur',
    text: 'Bon diagnostic, un peu cher pour le filtre remplacé mais le résultat est là.', createdAt: '2026-08-05T15:00:00+01:00' },
  { id: 'rv6', artisanId: 'ar_bernard', authorId: 'u_aurore', authorName: 'Aurore T.', rating: 5, service: 'Réparation fuite WC',
    text: 'Ponctuel et explique bien ce qu’il fait. Je le recontacterai.', createdAt: '2026-07-18T11:00:00+01:00' },
];

export const bookings: Booking[] = [
  {
    id: 'FX-24817', status: 'on_the_way', categoryId: 'plomberie', title: 'Fuite sous l’évier',
    description: 'Ça coule sous l’évier de la cuisine, surtout quand on ouvre le robinet.',
    media: [{ id: 'm1', kind: 'photo', caption: 'Dessous de l’évier' }], urgency: 'now',
    artisanId: 'ar_koffi', openSearch: false, addressId: 'a_maison',
    slotStart: '2026-09-28T14:00:00+01:00', slotEnd: '2026-09-28T16:00:00+01:00',
    priceEstimate: { min: 15000, max: 25000 }, missionCode: '4721', etaMin: 12,
    events: [
      { type: 'requested', at: '2026-09-28T12:40:00+01:00' }, { type: 'artisan_found', at: '2026-09-28T12:52:00+01:00' },
      { type: 'confirmed', at: '2026-09-28T13:10:00+01:00' }, { type: 'on_the_way', at: '2026-09-28T13:52:00+01:00' },
      { type: 'in_progress', at: null }, { type: 'done', at: null },
    ],
    createdAt: '2026-09-28T12:40:00+01:00',
  },
  {
    id: 'FX-25103', status: 'quotes', categoryId: 'climatisation', title: 'Entretien climatiseur',
    description: 'Split de la chambre (1,5 CV), il souffle mais l’air reste tiède depuis 3 jours. Dernier entretien il y a environ un an.',
    media: [{ id: 'm2', kind: 'photo', caption: 'Unité intérieure' }, { id: 'm3', kind: 'video', caption: 'Bruit du compresseur', durationSec: 14 }],
    urgency: 'week', openSearch: true, addressId: 'a_maison', budget: 25000,
    slotStart: '2026-09-29T09:00:00+01:00', slotEnd: '2026-09-29T11:00:00+01:00',
    priceEstimate: { min: 18000, max: 24000 }, quotesCount: 2,
    events: [{ type: 'requested', at: '2026-09-28T11:20:00+01:00' }, { type: 'artisan_found', at: null }, { type: 'confirmed', at: null }, { type: 'on_the_way', at: null }, { type: 'in_progress', at: null }, { type: 'done', at: null }],
    createdAt: '2026-09-28T11:20:00+01:00',
  },
  {
    id: 'FX-24990', status: 'confirmed', categoryId: 'peinture', title: 'Peinture chambre (12 m²)',
    description: 'Repeindre la chambre des enfants (murs + plafond), couleur beige clair. Deux petites fissures à reboucher près de la fenêtre.',
    media: [{ id: 'm4', kind: 'photo', caption: 'Mur 1' }, { id: 'm5', kind: 'photo', caption: 'Fissure' }], urgency: 'week',
    artisanId: 'ar_christelle', openSearch: true, addressId: 'a_maison',
    slotStart: '2026-10-01T08:00:00+01:00', slotEnd: '2026-10-01T12:00:00+01:00',
    priceEstimate: { min: 45000, max: 45000 },
    events: [
      { type: 'requested', at: '2026-09-25T18:02:00+01:00' }, { type: 'artisan_found', at: '2026-09-25T18:40:00+01:00' },
      { type: 'confirmed', at: '2026-09-26T09:15:00+01:00' }, { type: 'on_the_way', at: null }, { type: 'in_progress', at: null }, { type: 'done', at: null },
    ],
    cancellableUntil: '2026-10-01T06:00:00+01:00', createdAt: '2026-09-25T18:02:00+01:00',
  },
  {
    id: 'FX-24951', status: 'confirmed', categoryId: 'nettoyage', title: 'Nettoyage après travaux', media: [], urgency: 'flexible',
    artisanId: 'ar_mariam', openSearch: false, addressId: 'a_maman',
    slotStart: '2026-10-03T09:00:00+01:00', slotEnd: '2026-10-03T13:00:00+01:00', priceEstimate: { min: 15000, max: 15000 },
    events: [{ type: 'requested', at: '2026-09-24T09:00:00+01:00' }, { type: 'artisan_found', at: '2026-09-24T10:00:00+01:00' }, { type: 'confirmed', at: '2026-09-26T08:00:00+01:00' }, { type: 'on_the_way', at: null }, { type: 'in_progress', at: null }, { type: 'done', at: null }],
    cancellableUntil: '2026-10-03T07:00:00+01:00', createdAt: '2026-09-24T09:00:00+01:00',
  },
  {
    id: 'FX-24402', status: 'done', categoryId: 'electricite', title: 'Remplacement disjoncteur', media: [], urgency: 'now',
    artisanId: 'ar_rodrigue', openSearch: false, addressId: 'a_maison',
    slotStart: '2026-09-12T10:00:00+01:00', slotEnd: '2026-09-12T12:00:00+01:00', priceFinal: 18000, reviewed: false,
    events: [{ type: 'requested', at: '2026-09-12T08:10:00+01:00' }, { type: 'artisan_found', at: '2026-09-12T08:20:00+01:00' }, { type: 'confirmed', at: '2026-09-12T08:30:00+01:00' }, { type: 'on_the_way', at: '2026-09-12T09:40:00+01:00' }, { type: 'in_progress', at: '2026-09-12T10:05:00+01:00' }, { type: 'done', at: '2026-09-12T11:10:00+01:00' }],
    createdAt: '2026-09-12T08:10:00+01:00',
  },
  {
    id: 'FX-23877', status: 'done', categoryId: 'serrurerie', title: 'Ouverture de porte + serrure', media: [], urgency: 'now',
    artisanId: 'ar_herve', openSearch: false, addressId: 'a_bureau',
    slotStart: '2026-08-30T21:40:00+01:00', slotEnd: '2026-08-30T22:30:00+01:00', priceFinal: 12000, reviewed: true,
    events: [{ type: 'requested', at: '2026-08-30T21:00:00+01:00' }, { type: 'artisan_found', at: '2026-08-30T21:05:00+01:00' }, { type: 'confirmed', at: '2026-08-30T21:06:00+01:00' }, { type: 'on_the_way', at: '2026-08-30T21:10:00+01:00' }, { type: 'in_progress', at: '2026-08-30T21:40:00+01:00' }, { type: 'done', at: '2026-08-30T22:20:00+01:00' }],
    createdAt: '2026-08-30T21:00:00+01:00',
  },
  {
    id: 'FX-23790', status: 'cancelled', categoryId: 'menuiserie', title: 'Réparation porte de placard', media: [], urgency: 'flexible',
    artisanId: 'ar_gildas', openSearch: false, addressId: 'a_maison', cancelledBy: 'client',
    slotStart: '2026-08-20T15:00:00+01:00', slotEnd: '2026-08-20T17:00:00+01:00',
    events: [{ type: 'requested', at: '2026-08-18T10:00:00+01:00' }, { type: 'cancelled', at: '2026-08-19T09:00:00+01:00' }],
    createdAt: '2026-08-18T10:00:00+01:00',
  },
];

export const quotes: Quote[] = [
  { id: 'q1', bookingId: 'FX-25103', artisanId: 'ar_fabrice', amount: 18000, message: 'Je peux passer demain à 9h pour le diagnostic.', proposedSlot: '2026-09-29T09:00:00+01:00', createdAt: '2026-09-28T11:58:00+01:00' },
  { id: 'q2', bookingId: 'FX-25103', artisanId: 'ar_rodrigue', amount: 24000, message: 'Entretien complet + recharge si nécessaire.', createdAt: '2026-09-28T12:30:00+01:00' },
];

export const reports: InterventionReport[] = [
  {
    bookingId: 'FX-24817', status: 'awaiting_validation',
    startedAt: '2026-09-28T14:15:00+01:00', endedAt: '2026-09-28T15:40:00+01:00',
    summary: 'Fuite au niveau du siphon et du flexible d’alimentation. Les deux pièces étaient usées. Remplacement, joints refaits, test d’étanchéité de 10 minutes : aucune fuite.',
    tasks: ['Diagnostic et recherche de fuite', 'Remplacement du siphon et du flexible', 'Test d’étanchéité et nettoyage du poste'],
    materials: [
      { label: 'Siphon PVC 40 mm', qty: 1, unitPrice: 3500 },
      { label: 'Flexible inox 50 cm', qty: 1, unitPrice: 4000 },
      { label: 'Joints fibre', qty: 4, unitPrice: 250 },
    ],
    labor: 12000, travel: 2000, // total = 12 000 + 2 000 + 8 500 = 22 500 FCFA
    photos: [
      { id: 'p1', phase: 'before', caption: 'Siphon fissuré' }, { id: 'p2', phase: 'before', caption: 'Flexible usé' },
      { id: 'p3', phase: 'after', caption: 'Siphon neuf' }, { id: 'p4', phase: 'after', caption: 'Test OK' },
    ],
    warrantyDays: 30, autoValidateAt: '2026-09-30T15:40:00+01:00',
  },
];

export const conversations: Conversation[] = [
  { id: 'c_koffi', artisanId: 'ar_koffi', title: 'Koffi Agbodjan', bookingId: 'FX-24817', missionLabel: 'Plomberie · FX-24817', lastMessage: 'Je passe Cadjèhoun, j’arrive dans 10 min.', lastMessageMine: false, lastAt: '2026-09-28T14:02:00+01:00', unread: 2 },
  { id: 'c_fabrice', artisanId: 'ar_fabrice', title: 'Fabrice Ahouandjinou', bookingId: 'FX-25103', missionLabel: 'Devis · FX-25103', lastMessage: 'Je peux passer demain à 9h pour le diagnostic.', lastMessageMine: false, lastAt: '2026-09-28T11:58:00+01:00', unread: 0 },
  { id: 'c_christelle', artisanId: 'ar_christelle', title: 'Christelle Akpovi', bookingId: 'FX-24990', missionLabel: 'Peinture · FX-24990', lastMessage: 'Beige clair, comme sur la photo.', lastMessageMine: true, lastAt: '2026-09-28T11:40:00+01:00', unread: 0 },
  { id: 'c_support', title: 'Support FIXR', missionLabel: 'Assistance', lastMessage: 'Votre numéro a bien été vérifié. Bienvenue !', lastMessageMine: false, lastAt: '2026-09-27T09:00:00+01:00', unread: 0 },
  { id: 'c_mariam', artisanId: 'ar_mariam', title: 'Mariam Soulé', bookingId: 'FX-24951', missionLabel: 'Nettoyage · FX-24951', lastMessage: 'D’accord pour samedi 9h.', lastMessageMine: true, lastAt: '2026-09-26T08:10:00+01:00', unread: 0 },
  { id: 'c_rodrigue', artisanId: 'ar_rodrigue', title: 'Rodrigue Dossou', bookingId: 'FX-24402', missionLabel: 'Électricité · FX-24402', lastMessage: 'Merci pour votre confiance, bonne soirée.', lastMessageMine: false, lastAt: '2026-09-12T19:00:00+01:00', unread: 0 },
];

export const messages: Message[] = [
  { id: 'msg1', conversationId: 'c_koffi', kind: 'system', fromMe: false, systemTone: 'success', text: 'Mission confirmée par Koffi', at: '2026-09-28T13:10:00+01:00' },
  { id: 'msg2', conversationId: 'c_koffi', kind: 'text', fromMe: false, text: 'Bonjour Madame, je confirme pour 14h. Pouvez-vous m’envoyer une photo sous l’évier ?', at: '2026-09-28T13:12:00+01:00' },
  { id: 'msg3', conversationId: 'c_koffi', kind: 'photo', fromMe: true, status: 'read', at: '2026-09-28T13:15:00+01:00' },
  { id: 'msg4', conversationId: 'c_koffi', kind: 'text', fromMe: true, status: 'read', text: 'Voilà, ça coule surtout quand on ouvre le robinet.', at: '2026-09-28T13:15:00+01:00' },
  { id: 'msg5', conversationId: 'c_koffi', kind: 'text', fromMe: false, text: 'D’accord, c’est sûrement le siphon. J’amène les pièces.', at: '2026-09-28T13:18:00+01:00' },
  { id: 'msg6', conversationId: 'c_koffi', kind: 'system', fromMe: false, systemTone: 'accent', text: 'Koffi est en route', at: '2026-09-28T13:52:00+01:00' },
  { id: 'msg7', conversationId: 'c_koffi', kind: 'text', fromMe: false, text: 'Je passe Cadjèhoun, j’arrive dans 10 min.', at: '2026-09-28T14:02:00+01:00' },

  { id: 'msg_fab1', conversationId: 'c_fabrice', kind: 'text', fromMe: true, status: 'read', text: 'Bonjour, mon climatiseur ne refroidit plus du tout.', at: '2026-09-28T11:50:00+01:00' },
  { id: 'msg_fab2', conversationId: 'c_fabrice', kind: 'text', fromMe: false, text: 'Je peux passer demain à 9h pour le diagnostic.', at: '2026-09-28T11:58:00+01:00' },

  { id: 'msg_chr1', conversationId: 'c_christelle', kind: 'text', fromMe: false, text: 'Quelle couleur souhaitez-vous pour la chambre des enfants ?', at: '2026-09-28T11:35:00+01:00' },
  { id: 'msg_chr2', conversationId: 'c_christelle', kind: 'text', fromMe: true, status: 'delivered', text: 'Beige clair, comme sur la photo.', at: '2026-09-28T11:40:00+01:00' },

  { id: 'msg_sup1', conversationId: 'c_support', kind: 'text', fromMe: false, text: 'Votre numéro a bien été vérifié. Bienvenue !', at: '2026-09-27T09:00:00+01:00' },

  { id: 'msg_mar1', conversationId: 'c_mariam', kind: 'text', fromMe: false, text: 'Je peux passer samedi matin si ça vous arrange ?', at: '2026-09-26T08:05:00+01:00' },
  { id: 'msg_mar2', conversationId: 'c_mariam', kind: 'text', fromMe: true, status: 'delivered', text: 'D’accord pour samedi 9h.', at: '2026-09-26T08:10:00+01:00' },

  { id: 'msg_rod1', conversationId: 'c_rodrigue', kind: 'system', fromMe: false, systemTone: 'success', text: 'Mission terminée', at: '2026-09-12T18:55:00+01:00' },
  { id: 'msg_rod2', conversationId: 'c_rodrigue', kind: 'text', fromMe: false, text: 'Merci pour votre confiance, bonne soirée.', at: '2026-09-12T19:00:00+01:00' },
];

export const quickReplies = [
  'Où êtes-vous ?',
  'Pouvez-vous confirmer l’heure ?',
  'Je vous envoie une photo du problème.',
];

export const notifications: AppNotification[] = [
  { id: 'n1', type: 'on_the_way', title: 'L’artisan est en route', body: 'Koffi arrive dans 12 min pour « Fuite sous l’évier ».', cta: 'Suivre l’arrivée', deepLink: 'fixr://bookings/FX-24817/live', read: false, at: '2026-09-28T13:52:00+01:00' },
  { id: 'n2', type: 'message', title: 'Nouveau message de Koffi', body: '« Je passe Cadjèhoun, j’arrive dans 10 min. »', cta: 'Répondre', deepLink: 'fixr://messages/c_koffi', read: false, at: '2026-09-28T14:02:00+01:00' },
  { id: 'n3', type: 'quote_received', title: 'Nouveau devis reçu', body: 'Fabrice propose 18 000 FCFA pour l’entretien de votre climatiseur.', cta: 'Comparer les devis', deepLink: 'fixr://bookings/FX-25103', read: false, at: '2026-09-28T11:58:00+01:00' },
  { id: 'n4', type: 'booking_changed', title: 'Mission modifiée', body: 'Christelle a avancé l’heure : jeu. 1 oct. à 08:00 au lieu de 09:00.', cta: 'Voir la réservation', deepLink: 'fixr://bookings/FX-24990', read: true, at: '2026-09-27T18:20:00+01:00' },
  { id: 'n5', type: 'security', title: 'Nouvelle connexion', body: 'Connexion depuis un téléphone Android à Cotonou. Ce n’était pas vous ?', cta: 'Sécuriser mon compte', deepLink: 'fixr://profile/settings', read: true, at: '2026-09-27T09:05:00+01:00' },
  { id: 'n6', type: 'report_ready', title: 'Le rapport d’intervention est disponible', body: 'Remplacement disjoncteur · Rodrigue Dossou', cta: 'Consulter', deepLink: 'fixr://bookings/FX-24402/report', read: true, at: '2026-09-26T12:00:00+01:00' },
  { id: 'n7', type: 'payment', title: 'Paiement confirmé', body: '18 000 FCFA payés à Rodrigue par Mobile Money.', deepLink: 'fixr://bookings/FX-24402/report', read: true, at: '2026-09-26T12:05:00+01:00' },
  { id: 'n8', type: 'review_request', title: 'Rodrigue attend votre avis', body: 'Votre retour aide les autres clients à choisir.', cta: 'Noter', deepLink: 'fixr://bookings/FX-24402/review', read: true, at: '2026-09-26T12:10:00+01:00' },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm1', kind: 'mobile_money', label: 'Mobile Money •• 36', isDefault: true },
  { id: 'pm2', kind: 'cash', label: 'Espèces à l’artisan', isDefault: false },
];

export const favoriteArtisanIds = ['ar_koffi', 'ar_christelle', 'ar_herve'];

export const recentSearches = [
  { label: 'Plombier', where: 'Haie Vive, Cotonou' },
  { label: 'Entretien climatiseur', where: 'Fidjrossè, Cotonou' },
  { label: 'Serrurier urgence', where: 'Godomey, Abomey-Calavi' },
];

export const popularSearches = [
  { label: 'Fuite d’eau', query: 'fuite' },
  { label: 'Entretien clim', query: 'clim' },
  { label: 'Installer une prise', query: 'prise' },
  { label: 'Porte bloquée', query: 'porte' },
  { label: 'Peindre une chambre', query: 'peinture' },
  { label: 'Ménage après travaux', query: 'nettoyage' },
];

/** Créneaux proposés dans l'étape Date (design/RequestDate.dc.html). */
export const timeSlots = [
  { start: '07:00', end: '09:00' }, { start: '09:00', end: '11:00' }, { start: '11:00', end: '13:00' },
  { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }, { start: '18:00', end: '20:00' },
];
