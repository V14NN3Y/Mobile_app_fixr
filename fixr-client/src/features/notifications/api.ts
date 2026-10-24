import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

const impl = USE_MOCKS ? mock : real;

export const getNotifications = impl.getNotifications;
export const markNotificationRead = impl.markNotificationRead;
export const markAllNotificationsRead = impl.markAllNotificationsRead;
export const registerPushToken = impl.registerPushToken;
