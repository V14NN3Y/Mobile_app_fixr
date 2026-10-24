import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

export type { SendMessageInput } from './api.mock';

const impl = USE_MOCKS ? mock : real;

export const getConversations = impl.getConversations;
export const getConversationById = impl.getConversationById;
export const getMessages = impl.getMessages;
export const sendMessage = impl.sendMessage;
export const markMessageDelivered = impl.markMessageDelivered;
export const markMessageRead = impl.markMessageRead;
export const appendArtisanReply = impl.appendArtisanReply;
export const retryQueuedMessages = impl.retryQueuedMessages;
export const markConversationRead = impl.markConversationRead;
