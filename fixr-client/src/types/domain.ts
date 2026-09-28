/**
 * Types du domaine FIXR (app Client).
 * Alignés sur docs/MODELE-DONNEES.md pour que le passage mocks → Supabase soit transparent.
 * Montants en FCFA entiers (pas de décimales). Dates en ISO 8601 avec décalage horaire (ex. 2026-09-28T14:00:00+01:00).
 */

import type { CategoryId } from '../theme/tokens';

export type ID = string;

export type VerificationLevel = 'identity' | 'skills' | 'pro';
// 1 · Identité vérifiée · 2 · Compétences vérifiées · 3 · Pro certifié

export type BookingStatus =
  | 'pending' // demande envoyée, en attente d'artisan
  | 'quotes' // devis reçus (recherche ouverte)
  | 'confirmed'
  | 'on_the_way'
  | 'on_site'
  | 'in_progress'
  | 'done'
  | 'cancelled';

export type Urgency = 'now' | 'week' | 'flexible';

export interface User {
  id: ID;
  firstName: string;
  lastName: string;
  phone: string; // E.164 : +2290197451236
  phoneVerified: boolean;
  email?: string;
  avatarUrl?: string;
  memberSince: string;
  stats: { missions: number; favorites: number; reviews: number };
}

export interface Address {
  id: ID;
  label: string; // Maison, Bureau…
  line: string; // Carré 412, Haie Vive, Cotonou
  neighborhood: string;
  city: 'Cotonou' | 'Abomey-Calavi' | 'Porto-Novo' | string;
  landmark?: string; // repère : « Près de la pharmacie Les Cocotiers »
  complement?: string;
  accessInstructions?: string;
  lat: number;
  lng: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  artisanCount: number;
}

export interface PriceItem {
  label: string;
  from: number | null; // null = sur devis
  exact?: boolean; // true = prix fixe (ex. déplacement)
}

export interface Artisan {
  id: ID;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  coverUrl?: string;
  trade: string; // Plombier-sanitaire
  categories: CategoryId[];
  neighborhood: string;
  city: string;
  distanceKm: number;
  rating: number; // 4.9
  reviewCount: number;
  interventions: number;
  yearsExperience: number;
  verification: VerificationLevel;
  online: boolean;
  responseTimeMin?: number;
  availability: { label: string; today: boolean; nextSlot?: string; unavailableUntil?: string };
  priceFrom: number | null; // null = Sur devis
  bio?: string;
  skills: string[];
  zones: { city: string; neighborhoods: string[] }[];
  prices: PriceItem[];
  gallery: { id: ID; caption: string; tag: string; url?: string }[];
  ratingDistribution?: Record<1 | 2 | 3 | 4 | 5, number>; // en %
  lat: number;
  lng: number;
}

export interface Review {
  id: ID;
  artisanId: ID;
  authorName: string; // « Mireille A. »
  rating: number;
  criteria?: { punctuality?: number; quality?: number; communication?: number; value?: number };
  text?: string;
  service: string;
  createdAt: string;
}

export interface Quote {
  id: ID;
  bookingId: ID;
  artisanId: ID;
  amount: number;
  message?: string;
  proposedSlot?: string;
  createdAt: string;
}

export interface BookingEvent {
  type: 'requested' | 'artisan_found' | 'confirmed' | 'on_the_way' | 'in_progress' | 'done' | 'cancelled';
  at: string | null; // null = étape future
}

export interface Booking {
  id: string; // FX-24817
  status: BookingStatus;
  categoryId: CategoryId;
  title: string;
  description?: string;
  media: { id: ID; kind: 'photo' | 'video'; caption?: string; url?: string; durationSec?: number }[];
  urgency: Urgency;
  artisanId?: ID; // absent si recherche ouverte sans choix
  openSearch: boolean;
  addressId: ID;
  slotStart: string;
  slotEnd: string;
  budget?: number;
  priceEstimate?: { min: number; max: number };
  priceFinal?: number;
  quotesCount?: number;
  missionCode?: string; // code à donner à l'artisan
  etaMin?: number;
  events: BookingEvent[];
  cancellableUntil?: string;
  cancelledBy?: 'client' | 'artisan';
  reviewed?: boolean;
  createdAt: string;
}

export interface InterventionReport {
  bookingId: string;
  status: 'awaiting_validation' | 'validated' | 'disputed';
  startedAt: string;
  endedAt: string;
  summary: string;
  tasks: string[];
  materials: { label: string; qty: number; unitPrice: number }[];
  labor: number;
  travel: number;
  photos: { id: ID; phase: 'before' | 'after'; caption: string; url?: string }[];
  warrantyDays: number;
  autoValidateAt: string;
}

export interface Conversation {
  id: ID;
  artisanId?: ID; // absent = Support FIXR
  title: string;
  bookingId?: string;
  missionLabel: string;
  lastMessage: string;
  lastMessageMine: boolean;
  lastAt: string;
  unread: number;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'queued';

export interface Message {
  id: ID;
  conversationId: ID;
  kind: 'text' | 'photo' | 'system';
  fromMe: boolean;
  text?: string;
  photoUrl?: string;
  systemTone?: 'success' | 'accent' | 'neutral';
  status?: MessageStatus;
  at: string;
}

export type NotificationType =
  | 'request_accepted'
  | 'quote_received'
  | 'on_the_way'
  | 'message'
  | 'booking_changed'
  | 'report_ready'
  | 'payment'
  | 'review_request'
  | 'security';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  cta?: string;
  deepLink: string; // fixr://bookings/FX-24817/live
  read: boolean;
  at: string;
}

export interface PaymentMethod {
  id: ID;
  kind: 'mobile_money' | 'cash';
  label: string; // « Mobile Money •• 36 »
  isDefault: boolean;
}
