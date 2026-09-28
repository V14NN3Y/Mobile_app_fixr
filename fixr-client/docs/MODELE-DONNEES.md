# Modèle de données (Lot 8 — Supabase)

Point de départ pour le backend. À relire avec la personne qui construira l'app Artisan et
le back-office : ces tables sont partagées par les trois produits. Les types TypeScript
correspondants sont dans `src/types/domain.ts`.

## Tables

```sql
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
  cancellable_until timestamptz, cancelled_by text, cancel_reason text,
  created_at timestamptz default now()
);
create table booking_media (id uuid primary key default gen_random_uuid(), booking_id text references bookings on delete cascade, kind text, storage_path text, caption text, duration_sec int);
create table booking_events (id bigserial primary key, booking_id text references bookings on delete cascade, type text not null, at timestamptz default now(), meta jsonb);
create table quotes (id uuid primary key default gen_random_uuid(), booking_id text references bookings on delete cascade, artisan_id uuid references artisans, amount int not null, message text, proposed_slot timestamptz, status text default 'pending', created_at timestamptz default now());

-- Suivi en direct : l'app Artisan écrit, l'app Client écoute (Realtime).
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
  text text, photo_path text, status text default 'pending_moderation', created_at timestamptz default now()
);

create table conversations (id uuid primary key default gen_random_uuid(), booking_id text references bookings, client_id uuid references profiles, artisan_id uuid references artisans, is_support boolean default false, created_at timestamptz default now());
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade,
  sender_id uuid references profiles,     -- null = message système
  kind text check (kind in ('text','photo','system')), body text, photo_path text, system_tone text,
  delivered_at timestamptz, read_at timestamptz, created_at timestamptz default now()
);

create table notifications (id uuid primary key default gen_random_uuid(), user_id uuid references profiles on delete cascade, type text, title text, body text, cta text, deep_link text, read_at timestamptz, created_at timestamptz default now());
create table push_tokens (user_id uuid references profiles on delete cascade, token text primary key, platform text, updated_at timestamptz default now());
create table favorites (user_id uuid references profiles on delete cascade, artisan_id uuid references artisans on delete cascade, primary key (user_id, artisan_id));

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id text references bookings, payer_id uuid references profiles,
  amount int not null, method text check (method in ('mobile_money','cash')),
  provider text, provider_ref text,       -- agrégateur Mobile Money choisi
  status text check (status in ('pending','succeeded','failed','expired','refunded')),
  created_at timestamptz default now()
);
```

## Règles de sécurité (RLS) — principes

- Activer RLS sur **toutes** les tables.
- Un client ne lit/écrit que ses `addresses`, `bookings`, `favorites`, `notifications`, `push_tokens`.
- Il lit les `messages` et `artisan_positions` uniquement des réservations / conversations
  dont il est partie prenante.
- Profils artisans, catégories, compétences, zones, prix, galerie, avis publiés : lecture publique.
- Changements de statut de réservation, paiements, rapports : **uniquement via Edge Functions**
  (jamais d'`update` direct depuis le client), pour contrôler les transitions
  (`confirmed → on_the_way → on_site → in_progress → done`).
- L'adresse exacte n'est visible par un artisan qu'une fois la réservation confirmée.

## Temps réel

- `messages` (par `conversation_id`) → chat.
- `artisan_positions` et `booking_events` (par `booking_id`) → écran Mission en cours.
- `notifications` (par `user_id`) → badge et centre de notifications.

## Edge Functions à prévoir

`create-booking` (génère l'ID FX-, notifie les artisans), `accept-quote`, `cancel-booking`
(frais selon `cancellable_until`), `validate-report`, `start-payment` et webhook de
l'agrégateur Mobile Money, `send-push` (Expo Push API), `search-artisans` (distance PostGIS,
filtres, tri).
