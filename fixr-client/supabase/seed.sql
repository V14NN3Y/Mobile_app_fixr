-- Lot 8 — seed de développement local, fidèle à src/mocks/data.ts, + un 2e compte de test
-- (Esther) pour vérifier concrètement le critère d'acceptation « deux comptes ne voient
-- jamais les données l'un de l'autre » (scripts/verify-rls.mjs).
--
-- auth.users/auth.identities sont renseignés directement (recette standard pour un seed
-- Supabase local) avec le téléphone déjà confirmé, pour que chaque compte soit immédiatement
-- utilisable via OTP téléphone sans passer par un vrai envoi SMS (voir
-- supabase/config.toml > [auth.sms.test_otp] pour les codes fixes correspondants).
--
-- UUID : préfixes lisibles par famille — aaaaaaaa- (comptes client), bbbbbbbb- (artisans),
-- cccccccc- (adresses), dddddddd- (conversations). Pas de sens cryptographique, juste pour
-- relire ce fichier facilement.

-- ---------------------------------------------------------------------------------------
-- Comptes auth (2 clients de test + 11 artisans)
-- ---------------------------------------------------------------------------------------

-- auth.users.phone SANS le "+" (GoTrue stocke/retourne les numéros ainsi — vérifié : avec le
-- "+", verifyOtp() ne retrouvait pas ces lignes et créait un utilisateur en double à chaque
-- connexion). profiles.phone, plus bas, garde le "+" (E.164, comme l'exige
-- docs/MODELE-DONNEES.md) : ce n'est pas la même colonne ni la même convention.
insert into auth.users (
  instance_id, id, aud, role, phone, phone_confirmed_at,
  encrypted_password, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000001', 'authenticated', 'authenticated', '2290197451236', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000002', 'authenticated', 'authenticated', '2290198765432', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  -- "Comptes fantômes" pour 2 avis historiques du mock (rv1/rv2 : "Mireille A."/"Olivier K.")
  -- qui n'avaient pas de compte réel dans src/mocks/data.ts. Le schéma partagé
  -- (docs/MODELE-DONNEES.md) n'a pas de colonne libre "author_name" : le nom affiché se
  -- dérive toujours de profiles.first_name/last_name via author_id — ces 2 comptes existent
  -- donc uniquement pour porter ce nom, pas pour se connecter (pas de test_otp pour eux).
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000003', 'authenticated', 'authenticated', '2290190000001', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000004', 'authenticated', 'authenticated', '2290190000002', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000001', 'authenticated', 'authenticated', '2290197001122', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000002', 'authenticated', 'authenticated', '2290197002233', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000003', 'authenticated', 'authenticated', '2290197003344', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000004', 'authenticated', 'authenticated', '2290197004455', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000005', 'authenticated', 'authenticated', '2290197005566', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000006', 'authenticated', 'authenticated', '2290197006677', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000007', 'authenticated', 'authenticated', '2290197007788', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000008', 'authenticated', 'authenticated', '2290197008899', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000009', 'authenticated', 'authenticated', '2290197009900', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000010', 'authenticated', 'authenticated', '2290197010011', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}'),
  -- ar_rachidi ("profil incomplet", design/ArtisanStates.dc.html) : le mock n'a pas de
  -- téléphone pour cette fiche, mais profiles.phone est NOT NULL (modèle partagé avec
  -- l'app Artisan — un compte a toujours un numéro). Téléphone synthétique dédié à ce seed ;
  -- l'incomplétude du profil reste portée par bio/skills/gallery vides et rating=0, comme
  -- dans le mock.
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000011', 'authenticated', 'authenticated', '2290197010022', now(), '', now(), now(), '', '', '', '', false, false, '{"provider":"phone","providers":["phone"]}', '{}');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.phone, jsonb_build_object('sub', u.id::text, 'phone', u.phone), 'phone', now(), now(), now()
from auth.users u
where u.id in (
  'aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000004',
  'bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002',
  'bbbbbbbb-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000004',
  'bbbbbbbb-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000006',
  'bbbbbbbb-0000-0000-0000-000000000007', 'bbbbbbbb-0000-0000-0000-000000000008',
  'bbbbbbbb-0000-0000-0000-000000000009', 'bbbbbbbb-0000-0000-0000-000000000010',
  'bbbbbbbb-0000-0000-0000-000000000011'
);

-- ---------------------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------------------

insert into profiles (id, role, first_name, last_name, phone, email, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'client', 'Aurore', 'Tchibozo', '+2290197451236', 'aurore.tchibozo@gmail.com', '2026-03-02T10:00:00+01:00'),
  -- 2e compte de test, pour la vérification RLS — aucune donnée partagée avec Aurore.
  ('aaaaaaaa-0000-0000-0000-000000000002', 'client', 'Esther', 'Dossou', '+2290198765432', 'esther.dossou@example.com', '2026-05-10T09:00:00+01:00'),
  -- Comptes fantômes pour rv1/rv2 (voir commentaire plus haut) — jamais utilisés pour se
  -- connecter, seulement comme auteurs d'avis.
  ('aaaaaaaa-0000-0000-0000-000000000003', 'client', 'Mireille', 'Ahouansou', '+2290190000001', null, '2026-09-01T00:00:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'client', 'Olivier', 'Koudogbo', '+2290190000002', null, '2026-09-01T00:00:00+01:00'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'artisan', 'Koffi', 'Agbodjan', '+2290197001122', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'artisan', 'Sèdjro', 'Houénou', '+2290197002233', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'artisan', 'Bernard', 'Mensah', '+2290197003344', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'artisan', 'Anicet', 'Lokossou', '+2290197004455', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'artisan', 'Rodrigue', 'Dossou', '+2290197005566', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'artisan', 'Fabrice', 'Ahouandjinou', '+2290197006677', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'artisan', 'Christelle', 'Akpovi', '+2290197007788', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'artisan', 'Hervé', 'Gbaguidi', '+2290197008899', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'artisan', 'Mariam', 'Soulé', '+2290197009900', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'artisan', 'Gildas', 'Kpadonou', '+2290197010011', null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000011', 'artisan', 'Rachidi', 'Bello', '+2290197010022', null, now());

-- ---------------------------------------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------------------------------------

insert into categories (id, label, sort) values
  ('plomberie', 'Plomberie', 1),
  ('electricite', 'Électricité', 2),
  ('climatisation', 'Climatisation', 3),
  ('peinture', 'Peinture', 4),
  ('menuiserie', 'Menuiserie', 5),
  ('serrurerie', 'Serrurerie', 6),
  ('nettoyage', 'Nettoyage', 7),
  ('reparation', 'Réparation', 8);

-- ---------------------------------------------------------------------------------------
-- Artisans + tables annexes
-- ---------------------------------------------------------------------------------------

insert into artisans (id, trade, bio, verification, years_experience, base_location, price_from, rating, review_count, interventions, available, unavailable_until, online_at) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Plombier-sanitaire',
   'Plombier depuis 2017, je travaille surtout à Fidjrossè, Haie Vive et Cadjèhoun. Recherche de fuites, débouchage, pose de chauffe-eau et de surpresseurs. Je donne toujours un devis avant de commencer et je laisse le chantier propre.',
   'pro', 9, extensions.ST_SetSRID(extensions.ST_MakePoint(2.3620, 6.3545), 4326)::geography, 5000, 4.9, 212, 480, true, null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Plombier', null, 'identity', 6, extensions.ST_SetSRID(extensions.ST_MakePoint(2.3850, 6.3610), 4326)::geography, 4000, 4.7, 88, 190, true, null, now()),
  -- Indisponible (design/ArtisanStates.dc.html col. 1).
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Plombier-sanitaire', null, 'pro', 12, extensions.ST_SetSRID(extensions.ST_MakePoint(2.4500, 6.3700), 4326)::geography, null, 4.6, 143, 320, false, '2026-10-12T00:00:00+01:00', null),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Plombier', null, 'identity', 3, extensions.ST_SetSRID(extensions.ST_MakePoint(2.4020, 6.3690), 4326)::geography, 3500, 4.5, 21, 34, true, null, null),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Électricien', null, 'skills', 8, extensions.ST_SetSRID(extensions.ST_MakePoint(2.3880, 6.3620), 4326)::geography, null, 4.8, 164, 350, true, null, null),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'Frigoriste', null, 'pro', 7, extensions.ST_SetSRID(extensions.ST_MakePoint(2.4460, 6.3720), 4326)::geography, 10000, 4.7, 98, 210, true, null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'Peintre', null, 'skills', 6, extensions.ST_SetSRID(extensions.ST_MakePoint(2.3960, 6.3580), 4326)::geography, 20000, 4.8, 73, 140, true, null, null),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'Serrurier', null, 'pro', 10, extensions.ST_SetSRID(extensions.ST_MakePoint(2.4050, 6.3700), 4326)::geography, 8000, 4.7, 120, 260, true, null, now()),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'Nettoyage', null, 'skills', 5, extensions.ST_SetSRID(extensions.ST_MakePoint(2.3350, 6.4050), 4326)::geography, 10000, 4.9, 301, 520, true, null, null),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'Menuisier', null, 'identity', 11, extensions.ST_SetSRID(extensions.ST_MakePoint(2.6200, 6.5000), 4326)::geography, null, 4.6, 57, 95, true, null, null),
  -- Profil incomplet (design/ArtisanStates.dc.html) : rating 0, pas d'historique.
  ('bbbbbbbb-0000-0000-0000-000000000011', 'Électricien', null, 'identity', 0, extensions.ST_SetSRID(extensions.ST_MakePoint(2.6100, 6.4950), 4326)::geography, null, 0, 0, 0, true, null, null);

insert into artisan_categories (artisan_id, category_id) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'plomberie'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'plomberie'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'plomberie'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'plomberie'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'electricite'),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'climatisation'),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'peinture'),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'serrurerie'),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'nettoyage'),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'menuiserie'),
  ('bbbbbbbb-0000-0000-0000-000000000011', 'electricite');

insert into artisan_skills (artisan_id, label) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Recherche de fuite'), ('bbbbbbbb-0000-0000-0000-000000000001', 'Débouchage'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Chauffe-eau'), ('bbbbbbbb-0000-0000-0000-000000000001', 'Surpresseur & pompe'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Tuyauterie PPR / PVC'), ('bbbbbbbb-0000-0000-0000-000000000001', 'Sanitaires'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Recherche de fuite'), ('bbbbbbbb-0000-0000-0000-000000000002', 'Débouchage'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Sanitaires'), ('bbbbbbbb-0000-0000-0000-000000000003', 'Chauffe-eau'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Débouchage'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Tableau électrique'), ('bbbbbbbb-0000-0000-0000-000000000005', 'Prises & éclairage'), ('bbbbbbbb-0000-0000-0000-000000000005', 'Disjoncteur'),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'Entretien split'), ('bbbbbbbb-0000-0000-0000-000000000006', 'Recharge gaz'), ('bbbbbbbb-0000-0000-0000-000000000006', 'Installation'),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'Peinture intérieure'), ('bbbbbbbb-0000-0000-0000-000000000007', 'Enduit'), ('bbbbbbbb-0000-0000-0000-000000000007', 'Façade'),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'Ouverture de porte'), ('bbbbbbbb-0000-0000-0000-000000000008', 'Changement de serrure'),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'Ménage'), ('bbbbbbbb-0000-0000-0000-000000000009', 'Après travaux'),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'Portes'), ('bbbbbbbb-0000-0000-0000-000000000010', 'Placards');

insert into artisan_zones (artisan_id, city, neighborhood) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Cotonou', 'Fidjrossè'), ('bbbbbbbb-0000-0000-0000-000000000001', 'Cotonou', 'Haie Vive'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Cotonou', 'Cadjèhoun'), ('bbbbbbbb-0000-0000-0000-000000000001', 'Cotonou', 'Gbégamey'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Cotonou', 'Akpakpa'), ('bbbbbbbb-0000-0000-0000-000000000001', 'Abomey-Calavi', 'Godomey'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Abomey-Calavi', 'Zogbadjè'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Cotonou', 'Cadjèhoun'), ('bbbbbbbb-0000-0000-0000-000000000002', 'Cotonou', 'Haie Vive'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Cotonou', 'Akpakpa'), ('bbbbbbbb-0000-0000-0000-000000000003', 'Cotonou', 'Ganhi'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Cotonou', 'Gbégamey'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Cotonou', 'Cadjèhoun'), ('bbbbbbbb-0000-0000-0000-000000000005', 'Cotonou', 'Haie Vive'), ('bbbbbbbb-0000-0000-0000-000000000005', 'Cotonou', 'Fidjrossè'),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'Cotonou', 'Akpakpa'), ('bbbbbbbb-0000-0000-0000-000000000006', 'Cotonou', 'Haie Vive'),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'Cotonou', 'Haie Vive'), ('bbbbbbbb-0000-0000-0000-000000000007', 'Cotonou', 'Cadjèhoun'),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'Cotonou', 'Gbégamey'), ('bbbbbbbb-0000-0000-0000-000000000008', 'Cotonou', 'Ganhi'),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'Abomey-Calavi', 'Godomey'), ('bbbbbbbb-0000-0000-0000-000000000009', 'Abomey-Calavi', 'Zopah'),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'Porto-Novo', 'Ouando'), ('bbbbbbbb-0000-0000-0000-000000000010', 'Porto-Novo', 'Tokpota'),
  ('bbbbbbbb-0000-0000-0000-000000000011', 'Porto-Novo', 'Tokpota');

insert into artisan_prices (artisan_id, label, amount_from, exact) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Déplacement + diagnostic', 2000, true), ('bbbbbbbb-0000-0000-0000-000000000001', 'Recherche de fuite', 5000, false),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Remplacement de robinet', 4000, false), ('bbbbbbbb-0000-0000-0000-000000000001', 'Pose de chauffe-eau', 15000, false),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Déplacement + diagnostic', 2000, true), ('bbbbbbbb-0000-0000-0000-000000000002', 'Recherche de fuite', 5000, false),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Remplacement de robinet', 4000, false), ('bbbbbbbb-0000-0000-0000-000000000002', 'Pose de chauffe-eau', 15000, false),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Déplacement + diagnostic', 2000, true), ('bbbbbbbb-0000-0000-0000-000000000003', 'Recherche de fuite', 5000, false),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Remplacement de robinet', 4000, false), ('bbbbbbbb-0000-0000-0000-000000000003', 'Pose de chauffe-eau', 15000, false),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Déplacement + diagnostic', 2000, true), ('bbbbbbbb-0000-0000-0000-000000000004', 'Recherche de fuite', 5000, false),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Remplacement de robinet', 4000, false), ('bbbbbbbb-0000-0000-0000-000000000004', 'Pose de chauffe-eau', 15000, false),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Déplacement + diagnostic', 2000, true),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'Entretien split', 10000, false),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'Chambre (murs + plafond)', 30000, false),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'Ouverture de porte', 8000, false),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'Ménage 4 h', 10000, false);

insert into artisan_gallery (artisan_id, storage_path, caption, tag) values
  ('bbbbbbbb-0000-0000-0000-000000000001', null, 'Salle de bain · Cadjèhoun', 'Avant / Après'),
  ('bbbbbbbb-0000-0000-0000-000000000001', null, 'Pose 100 L · Haie Vive', 'Chauffe-eau'),
  ('bbbbbbbb-0000-0000-0000-000000000001', null, 'Villa · Godomey', 'Surpresseur');

-- ---------------------------------------------------------------------------------------
-- Adresses
-- ---------------------------------------------------------------------------------------

insert into addresses (id, owner_id, label, line, neighborhood, city, landmark, complement, access_instructions, location, is_default) values
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Maison', 'Carré 412, Haie Vive, Cotonou', 'Haie Vive', 'Cotonou',
   'Près de la pharmacie Les Cocotiers', 'Maison à étage, portail bleu',
   'Deuxième von après la pharmacie Les Cocotiers. Appelez en arrivant, le gardien s''appelle Paulin.',
   extensions.ST_SetSRID(extensions.ST_MakePoint(2.3935, 6.3575), 4326)::geography, true),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Bureau', 'Immeuble Les Palmiers, 2e étage, Ganhi, Cotonou', 'Ganhi', 'Cotonou',
   'Accueil au rez-de-chaussée', null, null,
   extensions.ST_SetSRID(extensions.ST_MakePoint(2.4305, 6.3555), 4326)::geography, false),
  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Chez maman', 'Quartier Zopah, Abomey-Calavi', 'Zopah', 'Abomey-Calavi',
   'Maison après l''église, portail vert', null, null,
   extensions.ST_SetSRID(extensions.ST_MakePoint(2.3520, 6.4480), 4326)::geography, false),
  -- Esther (2e compte de test) : une seule adresse, pour vérifier qu'Aurore ne la voit jamais.
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'Maison', 'Rue 212, Dowla, Porto-Novo', 'Dowla', 'Porto-Novo',
   null, null, null,
   extensions.ST_SetSRID(extensions.ST_MakePoint(2.6150, 6.4980), 4326)::geography, true);

-- ---------------------------------------------------------------------------------------
-- Réservations (Aurore)
-- ---------------------------------------------------------------------------------------

insert into bookings (id, client_id, artisan_id, category_id, title, description, urgency, open_search, address_id, slot_start, slot_end, budget, estimate_min, estimate_max, price_final, status, mission_code, cancellable_until, cancelled_by, cancel_reason, created_at) values
  ('FX-24817', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'plomberie', 'Fuite sous l''évier',
   'Ça coule sous l''évier de la cuisine, surtout quand on ouvre le robinet.', 'now', false, 'cccccccc-0000-0000-0000-000000000001',
   '2026-09-28T14:00:00+01:00', '2026-09-28T16:00:00+01:00', null, 15000, 25000, null, 'on_the_way', '4721', null, null, null, '2026-09-28T12:40:00+01:00'),
  ('FX-25103', 'aaaaaaaa-0000-0000-0000-000000000001', null, 'climatisation', 'Entretien climatiseur',
   'Split de la chambre (1,5 CV), il souffle mais l''air reste tiède depuis 3 jours. Dernier entretien il y a environ un an.', 'week', true, 'cccccccc-0000-0000-0000-000000000001',
   '2026-09-29T09:00:00+01:00', '2026-09-29T11:00:00+01:00', 25000, 18000, 24000, null, 'quotes', null, null, null, null, '2026-09-28T11:20:00+01:00'),
  ('FX-24990', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000007', 'peinture', 'Peinture chambre (12 m²)',
   'Repeindre la chambre des enfants (murs + plafond), couleur beige clair. Deux petites fissures à reboucher près de la fenêtre.', 'week', true, 'cccccccc-0000-0000-0000-000000000001',
   '2026-10-01T08:00:00+01:00', '2026-10-01T12:00:00+01:00', null, 45000, 45000, null, 'confirmed', null, '2026-10-01T06:00:00+01:00', null, null, '2026-09-25T18:02:00+01:00'),
  ('FX-24951', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000009', 'nettoyage', 'Nettoyage après travaux',
   null, 'flexible', false, 'cccccccc-0000-0000-0000-000000000003',
   '2026-10-03T09:00:00+01:00', '2026-10-03T13:00:00+01:00', null, 15000, 15000, null, 'confirmed', null, '2026-10-03T07:00:00+01:00', null, null, '2026-09-24T09:00:00+01:00'),
  ('FX-24402', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 'electricite', 'Remplacement disjoncteur',
   null, 'now', false, 'cccccccc-0000-0000-0000-000000000001',
   '2026-09-12T10:00:00+01:00', '2026-09-12T12:00:00+01:00', null, null, null, 18000, 'done', null, null, null, null, '2026-09-12T08:10:00+01:00'),
  ('FX-23877', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000008', 'serrurerie', 'Ouverture de porte + serrure',
   null, 'now', false, 'cccccccc-0000-0000-0000-000000000002',
   '2026-08-30T21:40:00+01:00', '2026-08-30T22:30:00+01:00', null, null, null, 12000, 'done', null, null, null, null, '2026-08-30T21:00:00+01:00'),
  ('FX-23790', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000010', 'menuiserie', 'Réparation porte de placard',
   null, 'flexible', false, 'cccccccc-0000-0000-0000-000000000001',
   '2026-08-20T15:00:00+01:00', '2026-08-20T17:00:00+01:00', null, null, null, null, 'cancelled', null, null, 'client', null, '2026-08-18T10:00:00+01:00'),
  -- Esther (2e compte de test) : une réservation simple, propre à elle.
  ('FX-25200', 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'plomberie', 'Chasse d''eau qui fuit',
   null, 'week', false, 'cccccccc-0000-0000-0000-000000000004',
   '2026-10-05T09:00:00+01:00', '2026-10-05T11:00:00+01:00', null, 8000, 12000, null, 'confirmed', null, '2026-10-05T07:00:00+01:00', null, null, '2026-10-02T10:00:00+01:00');

insert into booking_media (booking_id, kind, storage_path, caption, duration_sec) values
  ('FX-24817', 'photo', null, 'Dessous de l''évier', null),
  ('FX-25103', 'photo', null, 'Unité intérieure', null),
  ('FX-25103', 'video', null, 'Bruit du compresseur', 14),
  ('FX-24990', 'photo', null, 'Mur 1', null),
  ('FX-24990', 'photo', null, 'Fissure', null);

insert into booking_events (booking_id, type, at) values
  ('FX-24817', 'requested', '2026-09-28T12:40:00+01:00'), ('FX-24817', 'artisan_found', '2026-09-28T12:52:00+01:00'),
  ('FX-24817', 'confirmed', '2026-09-28T13:10:00+01:00'), ('FX-24817', 'on_the_way', '2026-09-28T13:52:00+01:00'),
  ('FX-25103', 'requested', '2026-09-28T11:20:00+01:00'),
  ('FX-24990', 'requested', '2026-09-25T18:02:00+01:00'), ('FX-24990', 'artisan_found', '2026-09-25T18:40:00+01:00'), ('FX-24990', 'confirmed', '2026-09-26T09:15:00+01:00'),
  ('FX-24951', 'requested', '2026-09-24T09:00:00+01:00'), ('FX-24951', 'artisan_found', '2026-09-24T10:00:00+01:00'), ('FX-24951', 'confirmed', '2026-09-26T08:00:00+01:00'),
  ('FX-24402', 'requested', '2026-09-12T08:10:00+01:00'), ('FX-24402', 'artisan_found', '2026-09-12T08:20:00+01:00'), ('FX-24402', 'confirmed', '2026-09-12T08:30:00+01:00'),
  ('FX-24402', 'on_the_way', '2026-09-12T09:40:00+01:00'), ('FX-24402', 'in_progress', '2026-09-12T10:05:00+01:00'), ('FX-24402', 'done', '2026-09-12T11:10:00+01:00'),
  ('FX-23877', 'requested', '2026-08-30T21:00:00+01:00'), ('FX-23877', 'artisan_found', '2026-08-30T21:05:00+01:00'), ('FX-23877', 'confirmed', '2026-08-30T21:06:00+01:00'),
  ('FX-23877', 'on_the_way', '2026-08-30T21:10:00+01:00'), ('FX-23877', 'in_progress', '2026-08-30T21:40:00+01:00'), ('FX-23877', 'done', '2026-08-30T22:20:00+01:00'),
  ('FX-23790', 'requested', '2026-08-18T10:00:00+01:00'), ('FX-23790', 'cancelled', '2026-08-19T09:00:00+01:00'),
  ('FX-25200', 'requested', '2026-10-02T10:00:00+01:00'), ('FX-25200', 'artisan_found', '2026-10-02T10:30:00+01:00'), ('FX-25200', 'confirmed', '2026-10-02T11:00:00+01:00');

insert into quotes (booking_id, artisan_id, amount, message, proposed_slot, status, created_at) values
  ('FX-25103', 'bbbbbbbb-0000-0000-0000-000000000006', 18000, 'Je peux passer demain à 9h pour le diagnostic.', '2026-09-29T09:00:00+01:00', 'pending', '2026-09-28T11:58:00+01:00'),
  ('FX-25103', 'bbbbbbbb-0000-0000-0000-000000000005', 24000, 'Entretien complet + recharge si nécessaire.', null, 'pending', '2026-09-28T12:30:00+01:00');

-- ---------------------------------------------------------------------------------------
-- Rapport d'intervention (FX-24817)
-- ---------------------------------------------------------------------------------------

insert into reports (booking_id, status, started_at, ended_at, summary, tasks, labor, travel, warranty_days, auto_validate_at) values
  ('FX-24817', 'awaiting_validation', '2026-09-28T14:15:00+01:00', '2026-09-28T15:40:00+01:00',
   'Fuite au niveau du siphon et du flexible d''alimentation. Les deux pièces étaient usées. Remplacement, joints refaits, test d''étanchéité de 10 minutes : aucune fuite.',
   array['Diagnostic et recherche de fuite', 'Remplacement du siphon et du flexible', 'Test d''étanchéité et nettoyage du poste'],
   12000, 2000, 30, '2026-09-30T15:40:00+01:00');

insert into report_materials (booking_id, label, qty, unit_price) values
  ('FX-24817', 'Siphon PVC 40 mm', 1, 3500),
  ('FX-24817', 'Flexible inox 50 cm', 1, 4000),
  ('FX-24817', 'Joints fibre', 4, 250);

insert into report_photos (booking_id, phase, storage_path, caption) values
  ('FX-24817', 'before', null, 'Siphon fissuré'), ('FX-24817', 'before', null, 'Flexible usé'),
  ('FX-24817', 'after', null, 'Siphon neuf'), ('FX-24817', 'after', null, 'Test OK');

-- ---------------------------------------------------------------------------------------
-- Avis (tous d'Aurore — authorId du mock)
-- ---------------------------------------------------------------------------------------

insert into reviews (booking_id, artisan_id, author_id, rating, text, service, status, created_at) values
  (null, 'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 5, 'Arrivé à l''heure, il a trouvé la fuite en 15 minutes et m''a montré les pièces changées. Très propre.', 'Fuite de chasse d''eau', 'published', '2026-09-25T10:00:00+01:00'),
  (null, 'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000004', 4.5, 'Travail sérieux, devis respecté. Un petit retard à cause des embouteillages mais il a prévenu.', 'Pose chauffe-eau', 'published', '2026-09-14T10:00:00+01:00'),
  ('FX-23877', 'bbbbbbbb-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000001', 5, 'Intervention rapide un soir tard, sans dégâts sur la porte. Rassurant.', 'Ouverture de porte + serrure', 'published', '2026-08-31T08:00:00+01:00'),
  (null, 'bbbbbbbb-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001', 4.5, 'Très minutieuse, elle a même nettoyé les vitres sans qu''on lui demande.', 'Ménage après travaux', 'published', '2026-08-20T09:00:00+01:00'),
  (null, 'bbbbbbbb-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 4, 'Bon diagnostic, un peu cher pour le filtre remplacé mais le résultat est là.', 'Entretien climatiseur', 'published', '2026-08-05T15:00:00+01:00'),
  (null, 'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 5, 'Ponctuel et explique bien ce qu''il fait. Je le recontacterai.', 'Réparation fuite WC', 'published', '2026-07-18T11:00:00+01:00');

-- rv1/rv2 ("Mireille A."/"Olivier K.") : author_id pointe maintenant vers les comptes
-- fantômes créés plus haut, pour que le nom affiché se dérive normalement par jointure sur
-- profiles — aucune colonne author_name libre dans le schéma partagé (docs/MODELE-DONNEES.md).

-- ---------------------------------------------------------------------------------------
-- Conversations + messages (Aurore)
-- ---------------------------------------------------------------------------------------

insert into conversations (id, booking_id, client_id, artisan_id, is_support, created_at) values
  ('dddddddd-0000-0000-0000-000000000001', 'FX-24817', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', false, '2026-09-28T12:40:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000002', 'FX-25103', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000006', false, '2026-09-28T11:20:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000003', 'FX-24990', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000007', false, '2026-09-25T18:02:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000004', null, 'aaaaaaaa-0000-0000-0000-000000000001', null, true, '2026-09-27T09:00:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000005', 'FX-24951', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000009', false, '2026-09-24T09:00:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000006', 'FX-24402', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', false, '2026-09-12T08:10:00+01:00');

insert into messages (conversation_id, sender_id, kind, body, system_tone, delivered_at, read_at, created_at) values
  ('dddddddd-0000-0000-0000-000000000001', null, 'system', 'Mission confirmée par Koffi', 'success', '2026-09-28T13:10:00+01:00', '2026-09-28T13:10:00+01:00', '2026-09-28T13:10:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'text', 'Bonjour Madame, je confirme pour 14h. Pouvez-vous m''envoyer une photo sous l''évier ?', null, '2026-09-28T13:12:00+01:00', '2026-09-28T13:12:00+01:00', '2026-09-28T13:12:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'photo', null, null, '2026-09-28T13:15:00+01:00', '2026-09-28T13:15:00+01:00', '2026-09-28T13:15:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'text', 'Voilà, ça coule surtout quand on ouvre le robinet.', null, '2026-09-28T13:15:00+01:00', '2026-09-28T13:15:00+01:00', '2026-09-28T13:15:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'text', 'D''accord, c''est sûrement le siphon. J''amène les pièces.', null, '2026-09-28T13:18:00+01:00', '2026-09-28T13:18:00+01:00', '2026-09-28T13:18:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000001', null, 'system', 'Koffi est en route', 'accent', '2026-09-28T13:52:00+01:00', null, '2026-09-28T13:52:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'text', 'Je passe Cadjèhoun, j''arrive dans 10 min.', null, '2026-09-28T14:02:00+01:00', null, '2026-09-28T14:02:00+01:00'),

  ('dddddddd-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'text', 'Bonjour, mon climatiseur ne refroidit plus du tout.', null, '2026-09-28T11:50:00+01:00', '2026-09-28T11:50:00+01:00', '2026-09-28T11:50:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000006', 'text', 'Je peux passer demain à 9h pour le diagnostic.', null, '2026-09-28T11:58:00+01:00', null, '2026-09-28T11:58:00+01:00'),

  ('dddddddd-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000007', 'text', 'Quelle couleur souhaitez-vous pour la chambre des enfants ?', null, '2026-09-28T11:35:00+01:00', null, '2026-09-28T11:35:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'text', 'Beige clair, comme sur la photo.', null, '2026-09-28T11:40:00+01:00', null, '2026-09-28T11:40:00+01:00'),

  ('dddddddd-0000-0000-0000-000000000004', null, 'text', 'Votre numéro a bien été vérifié. Bienvenue !', null, '2026-09-27T09:00:00+01:00', null, '2026-09-27T09:00:00+01:00'),

  ('dddddddd-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000009', 'text', 'Je peux passer samedi matin si ça vous arrange ?', null, '2026-09-26T08:05:00+01:00', null, '2026-09-26T08:05:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'text', 'D''accord pour samedi 9h.', null, '2026-09-26T08:10:00+01:00', null, '2026-09-26T08:10:00+01:00'),

  ('dddddddd-0000-0000-0000-000000000006', null, 'system', 'Mission terminée', 'success', '2026-09-12T18:55:00+01:00', null, '2026-09-12T18:55:00+01:00'),
  ('dddddddd-0000-0000-0000-000000000006', 'bbbbbbbb-0000-0000-0000-000000000005', 'text', 'Merci pour votre confiance, bonne soirée.', null, '2026-09-12T19:00:00+01:00', null, '2026-09-12T19:00:00+01:00');

-- ---------------------------------------------------------------------------------------
-- Notifications (Aurore)
-- ---------------------------------------------------------------------------------------

insert into notifications (user_id, type, title, body, cta, deep_link, read_at, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'on_the_way', 'L''artisan est en route', 'Koffi arrive dans 12 min pour « Fuite sous l''évier ».', 'Suivre l''arrivée', 'fixr://bookings/FX-24817/live', null, '2026-09-28T13:52:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'message', 'Nouveau message de Koffi', '« Je passe Cadjèhoun, j''arrive dans 10 min. »', 'Répondre', 'fixr://messages/dddddddd-0000-0000-0000-000000000001', null, '2026-09-28T14:02:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'quote_received', 'Nouveau devis reçu', 'Fabrice propose 18 000 FCFA pour l''entretien de votre climatiseur.', 'Comparer les devis', 'fixr://bookings/FX-25103', null, '2026-09-28T11:58:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'booking_changed', 'Mission modifiée', 'Christelle a avancé l''heure : jeu. 1 oct. à 08:00 au lieu de 09:00.', 'Voir la réservation', 'fixr://bookings/FX-24990', now(), '2026-09-27T18:20:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'security', 'Nouvelle connexion', 'Connexion depuis un téléphone Android à Cotonou. Ce n''était pas vous ?', 'Sécuriser mon compte', 'fixr://profile/settings', now(), '2026-09-27T09:05:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'report_ready', 'Le rapport d''intervention est disponible', 'Remplacement disjoncteur · Rodrigue Dossou', 'Consulter', 'fixr://bookings/FX-24402/report', now(), '2026-09-26T12:00:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'payment', 'Paiement confirmé', '18 000 FCFA payés à Rodrigue par Mobile Money.', null, 'fixr://bookings/FX-24402/report', now(), '2026-09-26T12:05:00+01:00'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'review_request', 'Rodrigue attend votre avis', 'Votre retour aide les autres clients à choisir.', 'Noter', 'fixr://bookings/FX-24402/review', now(), '2026-09-26T12:10:00+01:00');

-- ---------------------------------------------------------------------------------------
-- Moyens de paiement + favoris (Aurore)
-- ---------------------------------------------------------------------------------------

insert into payment_methods (owner_id, kind, label, is_default) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'mobile_money', 'Mobile Money •• 36', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cash', 'Espèces à l''artisan', false);

insert into favorites (user_id, artisan_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000007'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000008');
