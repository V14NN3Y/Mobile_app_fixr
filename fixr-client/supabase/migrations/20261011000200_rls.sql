-- Lot 8 — RLS sur toutes les tables, selon les principes de docs/MODELE-DONNEES.md :
--   • un client ne lit/écrit que ses propres addresses/bookings/favorites/notifications/
--     push_tokens/payment_methods ;
--   • il lit messages/artisan_positions uniquement pour les réservations/conversations dont
--     il est partie prenante ;
--   • profils artisans, catégories, compétences, zones, prix, galerie, avis publiés :
--     lecture publique ;
--   • changements de statut de réservation, paiements, rapports : AUCUNE policy d'écriture
--     pour authenticated → uniquement via les Edge Functions (client service_role, qui
--     contourne RLS par conception).
-- Les policies ci-dessous couvrent le rôle `authenticated` ; `anon` n'a accès qu'à ce qui est
-- explicitement listé "public" (catégories, profils/galerie artisans, avis publiés).

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table artisans enable row level security;
alter table artisan_categories enable row level security;
alter table artisan_skills enable row level security;
alter table artisan_zones enable row level security;
alter table artisan_prices enable row level security;
alter table artisan_gallery enable row level security;
alter table bookings enable row level security;
alter table booking_media enable row level security;
alter table booking_events enable row level security;
alter table quotes enable row level security;
alter table artisan_positions enable row level security;
alter table reports enable row level security;
alter table report_materials enable row level security;
alter table report_photos enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table push_tokens enable row level security;
alter table favorites enable row level security;
alter table payments enable row level security;
alter table payment_methods enable row level security;

-- profiles : sa propre fiche + les fiches des artisans (profil public), partout en lecture.
create policy profiles_select_own on profiles for select to authenticated using (id = auth.uid());
create policy profiles_select_public_artisans on profiles for select to anon, authenticated
  using (exists (select 1 from artisans a where a.id = profiles.id));
create policy profiles_insert_own on profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on profiles for update to authenticated using (id = auth.uid());

-- addresses : CRUD complet, mais seulement sur ses propres adresses.
create policy addresses_all_own on addresses for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- categories : catalogue public, lecture seule pour tous (y compris anon).
create policy categories_select_public on categories for select to anon, authenticated using (true);

-- Artisans et leurs tables annexes : profil public (lecture seule), aucune écriture cliente
-- (l'app Artisan, hors de ce dépôt, écrira ces tables — non construite dans ce lot).
create policy artisans_select_public on artisans for select to anon, authenticated using (true);
create policy artisan_categories_select_public on artisan_categories for select to anon, authenticated using (true);
create policy artisan_skills_select_public on artisan_skills for select to anon, authenticated using (true);
create policy artisan_zones_select_public on artisan_zones for select to anon, authenticated using (true);
create policy artisan_prices_select_public on artisan_prices for select to anon, authenticated using (true);
create policy artisan_gallery_select_public on artisan_gallery for select to anon, authenticated using (true);

-- bookings : lecture par le client ou l'artisan concerné ; AUCUNE écriture directe (statut,
-- prix final, etc. ne changent que via les Edge Functions create-booking/accept-quote/
-- cancel-booking/advance-mission-stage, avec la clé service_role).
create policy bookings_select_party on bookings for select to authenticated
  using (client_id = auth.uid() or artisan_id = auth.uid());

create policy booking_media_select_party on booking_media for select to authenticated
  using (exists (select 1 from bookings b where b.id = booking_media.booking_id and (b.client_id = auth.uid() or b.artisan_id = auth.uid())));

create policy booking_events_select_party on booking_events for select to authenticated
  using (exists (select 1 from bookings b where b.id = booking_events.booking_id and (b.client_id = auth.uid() or b.artisan_id = auth.uid())));

-- quotes : le client de la réservation les voit (pour comparer/accepter) ; l'artisan auteur
-- voit les siennes. Écriture (créer un devis, l'accepter) hors de ce lot / via Edge Function.
create policy quotes_select_party on quotes for select to authenticated
  using (
    artisan_id = auth.uid()
    or exists (select 1 from bookings b where b.id = quotes.booking_id and b.client_id = auth.uid())
  );

create policy artisan_positions_select_party on artisan_positions for select to authenticated
  using (exists (select 1 from bookings b where b.id = artisan_positions.booking_id and (b.client_id = auth.uid() or b.artisan_id = auth.uid())));

-- reports : visibles par les mêmes parties que la réservation ; validation (statut) via la
-- Edge Function validate-report uniquement.
create policy reports_select_party on reports for select to authenticated
  using (exists (select 1 from bookings b where b.id = reports.booking_id and (b.client_id = auth.uid() or b.artisan_id = auth.uid())));
create policy report_materials_select_party on report_materials for select to authenticated
  using (exists (select 1 from bookings b where b.id = report_materials.booking_id and (b.client_id = auth.uid() or b.artisan_id = auth.uid())));
create policy report_photos_select_party on report_photos for select to authenticated
  using (exists (select 1 from bookings b where b.id = report_photos.booking_id and (b.client_id = auth.uid() or b.artisan_id = auth.uid())));

-- reviews : publiés = publics ; un avis encore "pending_moderation" reste visible par son
-- auteur (Mes avis). Insertion directe autorisée (pas d'Edge Function dédiée) mais bornée :
-- l'auteur doit être l'appelant, et la réservation doit lui appartenir et être "done".
create policy reviews_select_public_or_own on reviews for select to anon, authenticated
  using (status <> 'pending_moderation' or author_id = auth.uid());
create policy reviews_insert_own_done_booking on reviews for insert to authenticated
  with check (
    author_id = auth.uid()
    and status = 'pending_moderation'
    and exists (select 1 from bookings b where b.id = reviews.booking_id and b.client_id = auth.uid() and b.status = 'done')
  );

-- conversations/messages : visibles et modifiables seulement par les 2 parties.
create policy conversations_select_party on conversations for select to authenticated
  using (client_id = auth.uid() or artisan_id = auth.uid());

create policy messages_select_party on messages for select to authenticated
  using (exists (select 1 from conversations c where c.id = messages.conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid())));
create policy messages_insert_party on messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from conversations c where c.id = messages.conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid()))
  );
-- Marquage délivré/lu : les 2 parties peuvent mettre à jour une ligne de leur conversation
-- (pas de restriction par colonne — RLS ne le permet pas nativement, acceptable ici : seules
-- delivered_at/read_at sont censées changer après l'insertion).
create policy messages_update_party on messages for update to authenticated
  using (exists (select 1 from conversations c where c.id = messages.conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid())))
  with check (exists (select 1 from conversations c where c.id = messages.conversation_id and (c.client_id = auth.uid() or c.artisan_id = auth.uid())));

-- notifications : chacun ne voit/ne marque comme lues que les siennes. Insertion réservée au
-- serveur (Edge Function advance-mission-stage, futurs triggers) — pas de policy insert ici.
create policy notifications_select_own on notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on notifications for update to authenticated using (user_id = auth.uid());

-- push_tokens / favorites / payment_methods : CRUD complet sur ses propres lignes.
create policy push_tokens_all_own on push_tokens for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy favorites_all_own on favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy payment_methods_all_own on payment_methods for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- payments : lecture de ses propres transactions seulement ; écriture différée (Lot 9, cf.
-- le plan du Lot 8) — pas de policy insert/update pour authenticated.
create policy payments_select_own on payments for select to authenticated using (payer_id = auth.uid());
