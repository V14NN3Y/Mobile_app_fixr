-- Lot 8 — schéma de base, fidèle à docs/MODELE-DONNEES.md (partagé avec les futures apps
-- Artisan / back-office Admin : ne pas renommer/retirer de colonnes sans relire ce doc).
-- RLS, policies, buckets Storage, triggers et fonctions : voir les migrations suivantes.

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- Profils (1-1 avec auth.users). role distingue client / artisan / admin.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('client','artisan','admin')) default 'client',
  first_name text not null, last_name text not null,
  phone text unique not null,             -- E.164 +229…
  email text, avatar_url text,
  created_at timestamptz default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  label text not null, line text not null, neighborhood text, city text not null,
  landmark text, complement text, access_instructions text,
  location geography(point) not null,     -- extension postgis
  is_default boolean not null default false,
  created_at timestamptz default now()
);

create table categories (id text primary key, label text not null, sort int);

create table artisans (
  id uuid primary key references profiles on delete cascade,
  trade text not null, bio text,
  verification text not null check (verification in ('identity','skills','pro')),
  years_experience int default 0,
  base_location geography(point), service_radius_km int default 10,
  price_from int,                         -- FCFA, null = sur devis
  rating numeric(2,1) default 0, review_count int default 0, interventions int default 0,
  available boolean default true, unavailable_until timestamptz,
  online_at timestamptz
);
create table artisan_categories (artisan_id uuid references artisans on delete cascade, category_id text references categories, primary key (artisan_id, category_id));
create table artisan_skills (artisan_id uuid references artisans on delete cascade, label text, primary key (artisan_id, label));
create table artisan_zones (artisan_id uuid references artisans on delete cascade, city text, neighborhood text);
create table artisan_prices (id uuid primary key default gen_random_uuid(), artisan_id uuid references artisans on delete cascade, label text, amount_from int, exact boolean default false);
create table artisan_gallery (id uuid primary key default gen_random_uuid(), artisan_id uuid references artisans on delete cascade, storage_path text, caption text, tag text);

-- Demande + réservation : une seule table, le statut fait avancer la mission.
-- Génération de l'id (FX-xxxxx) : voir next_booking_id() dans la migration functions_triggers,
-- appelée uniquement par la Edge Function create-booking (jamais insérée en dur par le client).
create table bookings (
  id text primary key,                    -- FX-12345 (séquence + préfixe)
  client_id uuid not null references profiles,
  artisan_id uuid references artisans,    -- null tant que la recherche est ouverte
  category_id text not null references categories,
  title text not null, description text,
  urgency text check (urgency in ('now','week','flexible')),
  open_search boolean default false,
  address_id uuid not null references addresses,
  slot_start timestamptz not null, slot_end timestamptz not null,
  budget int, estimate_min int, estimate_max int, price_final int,
  status text not null check (status in ('pending','quotes','confirmed','on_the_way','on_site','in_progress','done','cancelled')),
  mission_code text,                      -- 4 chiffres, donné à l'artisan à l'arrivée
  cancellable_until timestamptz, cancelled_by text check (cancelled_by in ('client','artisan')), cancel_reason text,
  cancellation_fee int,
  created_at timestamptz default now()
);
create table booking_media (id uuid primary key default gen_random_uuid(), booking_id text references bookings on delete cascade, kind text check (kind in ('photo','video')), storage_path text, caption text, duration_sec int);
create table booking_events (id bigserial primary key, booking_id text references bookings on delete cascade, type text not null check (type in ('requested','artisan_found','confirmed','on_the_way','on_site','in_progress','done','cancelled')), at timestamptz default now(), meta jsonb);
create table quotes (id uuid primary key default gen_random_uuid(), booking_id text references bookings on delete cascade, artisan_id uuid references artisans, amount int not null, message text, proposed_slot timestamptz, status text not null default 'pending' check (status in ('pending','accepted','rejected')), created_at timestamptz default now());

-- Suivi en direct : l'app Artisan écrit, l'app Client écoute (Realtime). Ce lot : la
-- Edge Function advance-mission-stage écrit à la place de l'app Artisan (qui n'existe pas
-- encore dans ce dépôt) — voir docs/LOTS.md / le plan du Lot 8.
create table artisan_positions (booking_id text primary key references bookings on delete cascade, artisan_id uuid, location geography(point), eta_min int, updated_at timestamptz default now());

create table reports (
  booking_id text primary key references bookings on delete cascade,
  status text check (status in ('awaiting_validation','validated','disputed')) default 'awaiting_validation',
  started_at timestamptz, ended_at timestamptz, summary text, tasks text[],
  labor int, travel int, warranty_days int default 30, auto_validate_at timestamptz
);
create table report_materials (id uuid primary key default gen_random_uuid(), booking_id text references reports on delete cascade, label text, qty int, unit_price int);
create table report_photos (id uuid primary key default gen_random_uuid(), booking_id text references reports on delete cascade, phase text check (phase in ('before','after')), storage_path text, caption text);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id text unique references bookings, artisan_id uuid references artisans, author_id uuid references profiles,
  rating numeric(2,1) not null check (rating between 1 and 5),
  punctuality int, quality int, communication int, value int,
  text text, photo_path text, status text not null default 'pending_moderation', created_at timestamptz default now()
);

create table conversations (id uuid primary key default gen_random_uuid(), booking_id text references bookings, client_id uuid references profiles, artisan_id uuid references artisans, is_support boolean default false, created_at timestamptz default now());
-- messages.status (sending/queued/failed côté UI) n'existe pas en base : ce sont des états de
-- la file d'attente LOCALE (src/features/messages/outbox.ts), avant même qu'une ligne existe
-- ici. Un message réellement inséré est forcément "sent" (puis delivered_at/read_at) — voir
-- le plan du Lot 8, section Realtime.
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade,
  sender_id uuid references profiles,     -- null = message système
  kind text check (kind in ('text','photo','system')), body text, photo_path text, system_tone text check (system_tone in ('success','accent','neutral')),
  delivered_at timestamptz, read_at timestamptz, created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  type text not null check (type in ('request_accepted','quote_received','on_the_way','message','booking_changed','report_ready','payment','review_request','security')),
  title text not null, body text not null, cta text, deep_link text not null,
  read_at timestamptz, created_at timestamptz default now()
);
create table push_tokens (user_id uuid references profiles on delete cascade, token text primary key, platform text check (platform in ('ios','android','web')), updated_at timestamptz default now());
create table favorites (user_id uuid references profiles on delete cascade, artisan_id uuid references artisans on delete cascade, primary key (user_id, artisan_id));

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id text references bookings, payer_id uuid references profiles,
  amount int not null, method text check (method in ('mobile_money','cash')),
  provider text, provider_ref text,       -- agrégateur Mobile Money choisi
  status text check (status in ('pending','succeeded','failed','expired','refunded')),
  created_at timestamptz default now()
);

-- Moyens de paiement enregistrés (distinct de `payments`, qui sont des transactions) —
-- ajouté pour ce lot : docs/MODELE-DONNEES.md ne la liste pas explicitement, mais
-- src/types/domain.ts (PaymentMethod) et l'écran Profil/Paiements (Lot 7) en ont besoin.
create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  kind text not null check (kind in ('mobile_money','cash')),
  label text not null,
  is_default boolean not null default false,
  created_at timestamptz default now()
);
