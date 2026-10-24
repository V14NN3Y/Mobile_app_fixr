#!/usr/bin/env node
/**
 * Vérifie le critère d'acceptation du Lot 8 : « deux comptes de test ne voient jamais les
 * données l'un de l'autre. » S'authentifie successivement comme les 2 comptes du seed
 * (supabase/seed.sql : Aurore, Esther — codes OTP fixes via auth.sms.test_otp dans
 * supabase/config.toml, aucun SMS réel envoyé), puis vérifie dans les deux sens sur
 * addresses/bookings/messages (+ une tentative directe par id connu, pas seulement une
 * liste qui pourrait être vide par coïncidence).
 *
 * Lancement :  node scripts/verify-rls.mjs   (stack locale démarrée : supabase start)
 * Nécessite .env.local (EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY) — ou les
 * valeurs par défaut ci-dessous, stables pour tout projet Supabase local non reconfiguré.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (match) env[match[1]] = match[2];
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnvLocal();
const SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:55321';
const ANON_KEY =
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const AURORE = { phone: '+2290197451236', addressId: 'cccccccc-0000-0000-0000-000000000001' };
const ESTHER = { phone: '+2290198765432', addressId: 'cccccccc-0000-0000-0000-000000000004' };
const OTP_CODE = '123456'; // auth.sms.test_otp, supabase/config.toml

async function signInAs({ phone }) {
  const client = createClient(SUPABASE_URL, ANON_KEY);
  const { error: otpError } = await client.auth.signInWithOtp({ phone });
  if (otpError) throw new Error(`signInWithOtp(${phone}) : ${otpError.message}`);
  const { error: verifyError } = await client.auth.verifyOtp({ phone, token: OTP_CODE, type: 'sms' });
  if (verifyError) throw new Error(`verifyOtp(${phone}) : ${verifyError.message}`);
  return client;
}

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    console.error(`  FAIL ${label}`);
    failures += 1;
  }
}

async function main() {
  console.log(`Stack : ${SUPABASE_URL}\n`);

  console.log('Connexion des 2 comptes de test...');
  const aurore = await signInAs(AURORE);
  const esther = await signInAs(ESTHER);
  console.log('  ok   Aurore et Esther authentifiées (OTP de test)\n');

  console.log('addresses');
  const { data: aurAddr } = await aurore.from('addresses').select('id');
  const { data: estAddr } = await esther.from('addresses').select('id');
  check('Aurore voit ses propres adresses (3)', aurAddr?.length === 3);
  check('Esther voit ses propres adresses (1)', estAddr?.length === 1);
  check(
    "Aucune adresse d'Esther dans la liste d'Aurore",
    !aurAddr?.some((a) => a.id === ESTHER.addressId),
  );
  check(
    "Aucune adresse d'Aurore dans la liste d'Esther",
    !estAddr?.some((a) => a.id === AURORE.addressId),
  );
  const { data: estReadsAurAddr } = await esther.from('addresses').select('id').eq('id', AURORE.addressId);
  check("Esther ne peut pas lire l'adresse d'Aurore par id direct", (estReadsAurAddr?.length ?? 0) === 0);
  const { data: aurReadsEstAddr } = await aurore.from('addresses').select('id').eq('id', ESTHER.addressId);
  check("Aurore ne peut pas lire l'adresse d'Esther par id direct", (aurReadsEstAddr?.length ?? 0) === 0);

  console.log('\nbookings');
  const { data: aurBookings } = await aurore.from('bookings').select('id');
  const { data: estBookings } = await esther.from('bookings').select('id');
  check('Aurore voit ses propres réservations (7)', aurBookings?.length === 7);
  check('Esther voit sa propre réservation (1 : FX-25200)', estBookings?.length === 1 && estBookings[0].id === 'FX-25200');
  check(
    "Aucune réservation d'Esther dans la liste d'Aurore",
    !aurBookings?.some((b) => b.id === 'FX-25200'),
  );
  const { data: estReadsAurBooking } = await esther.from('bookings').select('id').eq('id', 'FX-24817');
  check("Esther ne peut pas lire une réservation d'Aurore par id direct", (estReadsAurBooking?.length ?? 0) === 0);

  console.log('\nconversations / messages');
  const { data: aurConvos } = await aurore.from('conversations').select('id');
  const { data: estConvos } = await esther.from('conversations').select('id');
  check("Aurore voit ses propres conversations (6)", aurConvos?.length === 6);
  check("Esther ne voit aucune conversation (n'en a aucune)", (estConvos?.length ?? 0) === 0);
  const { data: estReadsAurMessages } = await esther
    .from('messages')
    .select('id')
    .eq('conversation_id', 'dddddddd-0000-0000-0000-000000000001');
  check("Esther ne peut lire aucun message d'une conversation d'Aurore", (estReadsAurMessages?.length ?? 0) === 0);

  console.log(`\n${failures === 0 ? 'Tout est isolé correctement.' : `${failures} vérification(s) en échec.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nErreur :', err.message);
  process.exit(1);
});
