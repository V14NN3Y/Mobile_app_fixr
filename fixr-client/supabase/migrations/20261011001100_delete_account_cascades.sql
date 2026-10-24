-- Lot 8 — supprimer un compte (Paramètres → Supprimer mon compte → Edge Function
-- delete-account → supabase.auth.admin.deleteUser) échouait dès que l'utilisateur avait la
-- moindre réservation : bookings.client_id référence profiles SANS on delete cascade,
-- bloquant la suppression de la ligne profiles (et donc de auth.users) avec une violation
-- de contrainte (constaté : "violates foreign key constraint bookings_client_id_fkey").
-- Même lacune sur reviews.author_id, conversations.client_id, messages.sender_id,
-- payments.payer_id.
--
-- cascade pour bookings/conversations (ce sont LEURS données, supprimées avec le compte) ;
-- set null pour reviews/messages/payments (l'historique reste utile à l'autre partie/aux
-- autres clients — un avis publié ou un message dans une conversation ne doit pas
-- disparaître juste parce que son auteur a supprimé son compte, même sans système
-- d'anonymisation complet dans ce lot).

alter table bookings drop constraint bookings_client_id_fkey;
alter table bookings add constraint bookings_client_id_fkey
  foreign key (client_id) references profiles on delete cascade;

alter table conversations drop constraint conversations_client_id_fkey;
alter table conversations add constraint conversations_client_id_fkey
  foreign key (client_id) references profiles on delete cascade;

alter table reviews drop constraint reviews_author_id_fkey;
alter table reviews add constraint reviews_author_id_fkey
  foreign key (author_id) references profiles on delete set null;

alter table messages drop constraint messages_sender_id_fkey;
alter table messages add constraint messages_sender_id_fkey
  foreign key (sender_id) references profiles on delete set null;

alter table payments drop constraint payments_payer_id_fkey;
alter table payments add constraint payments_payer_id_fkey
  foreign key (payer_id) references profiles on delete set null;
