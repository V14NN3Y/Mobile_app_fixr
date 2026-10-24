-- Lot 8 — fonctions et triggers serveur : remplacent la logique applicative que les mocks
-- faisaient côté client (src/features/*/api.ts), avec les garanties d'atomicité qu'une
-- boucle/un scan côté client n'a pas.

-- Génération de l'id de réservation (FX-xxxxx) — appelée uniquement par la Edge Function
-- create-booking, jamais par le client. Démarre après le plus grand id "humain" déjà utilisé
-- par supabase/seed.sql (FX-25103), pour que les nouvelles réservations créées en local
-- restent visuellement cohérentes avec les données de démo.
create sequence booking_seq start 26000;

create function next_booking_id() returns text
language sql
as $$
  select 'FX-' || nextval('booking_seq')::text;
$$;

-- Exclusivité de l'adresse/moyen de paiement par défaut : remplace la boucle applicative de
-- setDefaultAddress()/setDefaultPaymentMethod() (src/features/addresses|payments/api.ts) par
-- une garantie transactionnelle — plus possible d'avoir 2 lignes is_default=true pour un même
-- propriétaire, même avec des écritures concurrentes.
create function enforce_single_default_address() returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update addresses set is_default = false where owner_id = new.owner_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;
create trigger addresses_single_default
  before insert or update on addresses
  for each row when (new.is_default)
  execute function enforce_single_default_address();

create function enforce_single_default_payment_method() returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update payment_methods set is_default = false where owner_id = new.owner_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;
create trigger payment_methods_single_default
  before insert or update on payment_methods
  for each row when (new.is_default)
  execute function enforce_single_default_payment_method();

-- Mise à jour de la note moyenne/du nombre d'avis d'un artisan à chaque nouvel avis — reprend
-- la formule de src/features/reviews/ratingMath.ts (nextAverageRating), mais côté serveur et
-- atomique (2 avis soumis en même temps ne peuvent plus se "perdre" l'un l'autre comme avec un
-- read-then-write côté client). ratingDistribution (pourcentages par note) n'est pas stocké :
-- recalculé à la lecture par api.supabase.ts via une agrégation sur `reviews`, pour ne pas
-- ajouter de colonne hors de docs/MODELE-DONNEES.md sans l'avoir relu avec les autres apps.
create function update_artisan_rating_on_review() returns trigger
language plpgsql
as $$
declare
  current_rating numeric(2,1);
  current_count int;
begin
  select rating, review_count into current_rating, current_count
    from artisans where id = new.artisan_id;

  update artisans
    set rating = round(
          (coalesce(current_rating, 0) * coalesce(current_count, 0) + new.rating)
          / (coalesce(current_count, 0) + 1),
          1
        ),
        review_count = coalesce(current_count, 0) + 1
    where id = new.artisan_id;

  return new;
end;
$$;
create trigger reviews_update_artisan_rating
  after insert on reviews
  for each row
  execute function update_artisan_rating_on_review();
