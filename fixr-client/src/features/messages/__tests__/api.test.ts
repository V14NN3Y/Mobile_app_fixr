import {
  appendArtisanReply,
  getConversationById,
  getMessages,
  markConversationRead,
  markMessageDelivered,
  markMessageRead,
  retryQueuedMessages,
  sendMessage,
} from '../api';

describe('sendMessage', () => {
  it('connecté → statut "sent" et met à jour la conversation (c_fabrice)', async () => {
    const message = await sendMessage({ conversationId: 'c_fabrice', kind: 'text', text: 'Bonjour !' }, true);
    expect(message.status).toBe('sent');
    expect(message.fromMe).toBe(true);

    const conversation = await getConversationById('c_fabrice');
    expect(conversation.lastMessage).toBe('Bonjour !');
    expect(conversation.lastMessageMine).toBe(true);
    expect(conversation.lastAt).toBe(message.at);
  }, 10000);

  it('hors connexion → statut "queued" (c_christelle)', async () => {
    const message = await sendMessage(
      { conversationId: 'c_christelle', kind: 'text', text: 'Le portail est ouvert.' },
      false,
    );
    expect(message.status).toBe('queued');
  }, 10000);
});

describe('retryQueuedMessages (critère 1 : un message hors connexion part au retour du réseau)', () => {
  it('bascule les messages "queued" du fil en "sent", en conservant leur `at` d’origine', async () => {
    const queued = await sendMessage(
      { conversationId: 'c_mariam', kind: 'text', text: 'Je peux passer plus tôt ?' },
      false,
    );
    expect(queued.status).toBe('queued');

    const retried = await retryQueuedMessages('c_mariam');
    expect(retried).toHaveLength(1);
    expect(retried[0]?.id).toBe(queued.id);
    expect(retried[0]?.status).toBe('sent');
    expect(retried[0]?.at).toBe(queued.at); // ordre chronologique conservé, pas réécrit à "maintenant"

    const all = await getMessages('c_mariam');
    expect(all.find((m) => m.id === queued.id)?.status).toBe('sent');
  }, 15000);

  it('ne touche pas les messages déjà envoyés', async () => {
    const sent = await sendMessage({ conversationId: 'c_rodrigue', kind: 'text', text: 'Merci !' }, true);
    const retried = await retryQueuedMessages('c_rodrigue');
    expect(retried).toHaveLength(0);
    const all = await getMessages('c_rodrigue');
    expect(all.find((m) => m.id === sent.id)?.status).toBe('sent');
  }, 15000);
});

describe('markMessageDelivered / markMessageRead', () => {
  it('fait avancer le statut d’un message envoyé (c_koffi, escalade simulée)', async () => {
    const sent = await sendMessage({ conversationId: 'c_koffi', kind: 'text', text: 'Vous êtes loin ?' }, true);
    const delivered = await markMessageDelivered(sent.id);
    expect(delivered.status).toBe('delivered');
    const read = await markMessageRead(sent.id);
    expect(read.status).toBe('read');
  }, 15000);
});

describe('appendArtisanReply', () => {
  it('ajoute un message entrant et met à jour la conversation sans incrémenter `unread`', async () => {
    const before = await getConversationById('c_fabrice');
    const unreadBefore = before.unread;

    const reply = await appendArtisanReply('c_fabrice', 'Merci, je regarde ça tout de suite.');
    expect(reply.fromMe).toBe(false);

    const after = await getConversationById('c_fabrice');
    expect(after.lastMessage).toBe('Merci, je regarde ça tout de suite.');
    expect(after.lastMessageMine).toBe(false);
    expect(after.unread).toBe(unreadBefore); // fil déjà ouvert : pas de compteur qui bouge
  }, 10000);
});

describe('markConversationRead', () => {
  it('remet `unread` à 0 (c_koffi, unread=2 dans les fixtures)', async () => {
    const before = await getConversationById('c_koffi');
    expect(before.unread).toBeGreaterThan(0);

    const after = await markConversationRead('c_koffi');
    expect(after.unread).toBe(0);
  }, 10000);
});
