-- Lot 9 — déclenche send-push après chaque insertion dans `notifications`, quelle que soit
-- son origine (aujourd'hui advance-mission-stage uniquement, d'autres sources plus tard) :
-- un seul point de couture, jamais oublié contrairement à un appel ajouté à chaque endroit
-- qui insère une notification.
--
-- Clé service_role stockée dans Vault plutôt qu'en dur dans la fonction trigger (motif
-- documenté par Supabase pour ce pattern pg_net) : la valeur ci-dessous est la clé de
-- développement local PAR DÉFAUT du CLI Supabase (fixe, imprimée par `supabase start`,
-- identique sur n'importe quel projet local tant que [auth] jwt_secret n'est pas changé
-- dans config.toml — ce n'est pas un secret propre à ce dépôt). En production, cette
-- entrée Vault doit être créée via le dashboard/l'API, jamais par une migration committée.
select vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  'service_role_key',
  'Clé service_role locale (CLI Supabase, valeur par défaut) — utilisée uniquement par le trigger send-push.'
)
where not exists (select 1 from vault.secrets where name = 'service_role_key');

-- Adresse interne confirmée par un test direct depuis le conteneur db (ce lot) :
-- http://edge_runtime:8081/<nom-fonction> — le nom DNS court du conteneur edge-runtime sur
-- le réseau Docker partagé, sans passer par Kong (inutile pour un appel interne conteneur à
-- conteneur). edge-runtime exige tout de même un JWT valide (vérifié avant même d'atteindre
-- le code de la fonction) : la clé service_role ci-dessus satisfait cette vérification.
create or replace function notify_send_push() returns trigger
language plpgsql security definer as $$
declare
  service_key text;
begin
  select decrypted_secret into service_key from vault.decrypted_secrets where name = 'service_role_key';

  perform net.http_post(
    url := 'http://edge_runtime:8081/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
    body := jsonb_build_object('notification_id', new.id)
  );
  return new;
end;
$$;

create trigger trg_notifications_send_push
  after insert on notifications
  for each row execute function notify_send_push();
