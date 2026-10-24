-- Lot 8 — buckets Storage (photos de demandes, rapports, avatars) + policies.
-- Convention de chemin :
--   avatars/<uid>/<fichier>            — photo de profil du client
--   request-media/<uid>/<fichier>      — photos/vidéos jointes à une demande (avant création
--                                        de la réservation : le dossier est celui du client,
--                                        pas encore celui d'un booking_id)
--   report-photos/<booking_id>/<fichier> — photos avant/après d'un rapport d'intervention,
--                                        dossier par réservation (pas par utilisateur : les
--                                        2 parties — client et artisan — doivent pouvoir lire)

insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', false),
  ('request-media', 'request-media', false),
  ('report-photos', 'report-photos', false);

-- avatars : chacun ne lit/écrit que son propre dossier.
create policy avatars_select_own on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update_own on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- request-media : chacun ne lit/écrit que son propre dossier (médias de ses propres
-- brouillons de demande, avant que create-booking ne les rattache à une réservation).
create policy request_media_select_own on storage.objects for select to authenticated
  using (bucket_id = 'request-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy request_media_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'request-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy request_media_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'request-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- report-photos : dossier par réservation, lisible par le client et l'artisan de cette
-- réservation (même règle que booking_media/reports en base). Écriture réservée au serveur
-- (l'artisan de ce lot n'a pas d'app ; les photos du seed restent de simples légendes sans
-- fichier réel pour l'instant) — pas de policy insert/update/delete côté authenticated.
create policy report_photos_select_party on storage.objects for select to authenticated
  using (
    bucket_id = 'report-photos'
    and exists (
      select 1 from bookings b
      where b.id = (storage.foldername(name))[1]
        and (b.client_id = auth.uid() or b.artisan_id = auth.uid())
    )
  );
