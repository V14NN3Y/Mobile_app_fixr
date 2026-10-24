-- Lot 8 — la vérification « ce numéro a déjà un compte » (features/auth/api.supabase.ts,
-- signUp) s'exécute AVANT l'OTP, donc en tant qu'anon : RLS bloque toute lecture directe de
-- profiles pour ce rôle (profiles_select_own/profiles_select_public_artisans exigent
-- authenticated). Fonction étroite (un seul booléen, aucune autre colonne exposée) plutôt que
-- d'ouvrir profiles en lecture publique.
create function phone_has_account(check_phone text) returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where phone = check_phone);
$$;

grant execute on function phone_has_account(text) to anon, authenticated;
