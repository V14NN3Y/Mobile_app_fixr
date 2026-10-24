-- Lot 8 — privilèges de base sur le schéma public. RLS (migration 0002) restreint QUELLES
-- lignes un rôle voit/modifie, mais Postgres exige d'abord le GRANT de table lui-même — sans
-- lui, la requête échoue avant même d'atteindre les policies ("permission denied for table",
-- constaté en testant le critère RLS de ce lot via curl). Les CLI/versions récentes de
-- Supabase n'exposent plus les nouvelles tables par défaut (voir le commentaire
-- auto_expose_new_tables dans supabase/config.toml) : il faut l'accorder explicitement.
-- service_role aussi : il contourne RLS (bypassrls), mais pas les GRANT de table — constaté
-- en testant les Edge Functions (client service_role), même erreur "permission denied".
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public grant select on tables to anon;
