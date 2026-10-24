-- Lot 8 — 2 ajouts nécessaires pour la feature messages, absents de docs/MODELE-DONNEES.md :
--
-- 1. conversations.client_last_read_at : le mock dénormalise `unread`/`lastMessage`/
--    `lastMessageMine`/`lastAt` directement sur Conversation (touchLastMessage(),
--    markConversationRead() dans l'ancien features/messages/api.ts) ; le schéma partagé n'a
--    ni ces colonnes ni de table de suivi de lecture. lastMessage/lastMessageMine/lastAt se
--    recalculent à la lecture (dernier message de la conversation, via un embed Postgrest
--    trié+limité) ; unread a besoin d'un repère de "jusqu'où j'ai lu", qui lui doit être
--    stocké — cette seule colonne suffit, l'app Artisan (hors de ce dépôt) n'a pas besoin
--    de l'équivalent ici.
alter table conversations add column client_last_read_at timestamptz not null default now();

-- 2. bucket Storage pour les photos envoyées dans le chat (Lot 6 : sendMessage(kind:'photo'),
--    jusqu'ici un simple uri local jamais persisté). Dossier par conversation (les 2 parties
--    doivent pouvoir lire), même motif que report-photos.
insert into storage.buckets (id, name, public) values ('message-photos', 'message-photos', false);

create policy message_photos_select_party on storage.objects for select to authenticated
  using (
    bucket_id = 'message-photos'
    and exists (
      select 1 from conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.client_id = auth.uid() or c.artisan_id = auth.uid())
    )
  );
create policy message_photos_insert_party on storage.objects for insert to authenticated
  with check (
    bucket_id = 'message-photos'
    and exists (
      select 1 from conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.client_id = auth.uid() or c.artisan_id = auth.uid())
    )
  );
