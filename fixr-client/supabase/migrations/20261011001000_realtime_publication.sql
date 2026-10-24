-- Lot 8 — la publication supabase_realtime existe mais ne contient aucune table par défaut
-- (vérifié : `select * from pg_publication_tables where pubname='supabase_realtime'` vide) —
-- postgres_changes ne diffuserait donc rien sans cet ajout explicite. Tables écoutées par les
-- hooks de l'app (features/messages/hooks.ts, features/notifications/hooks.ts) + bookings/
-- booking_events pour le suivi de mission en direct (voir le plan du Lot 8, section Realtime).
alter publication supabase_realtime add table messages, conversations, notifications, bookings, booking_events;
