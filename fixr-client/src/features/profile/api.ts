import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

const impl = USE_MOCKS ? mock : real;

export const getCurrentUser = impl.getCurrentUser;
export const deleteAccount = impl.deleteAccount;
