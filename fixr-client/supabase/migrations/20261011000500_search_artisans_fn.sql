-- Lot 8 — fonction de distance pour la Edge Function search-artisans. Isole le calcul
-- PostGIS (non exposable proprement via le query builder Postgrest seul) ; les jointures
-- relationnelles (catégories, compétences, zones, prix, galerie) restent faites côté
-- Edge Function via le select imbriqué habituel de supabase-js.
create function artisans_within(lat double precision, lng double precision, max_distance_km double precision default null)
returns table (artisan_id uuid, distance_km double precision)
language sql
stable
as $$
  select
    a.id as artisan_id,
    extensions.ST_Distance(a.base_location, extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326)::geography) / 1000 as distance_km
  from artisans a
  where a.base_location is not null
    and (max_distance_km is null or extensions.ST_DWithin(
      a.base_location,
      extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326)::geography,
      max_distance_km * 1000
    ));
$$;
