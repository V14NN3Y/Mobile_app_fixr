import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

export type { AuthUser, SignUpInput } from './api.mock';

const impl = USE_MOCKS ? mock : real;

export const requestOtp = impl.requestOtp;
export const verifyOtp = impl.verifyOtp;
export const signUp = impl.signUp;
export const signInWithEmail = impl.signInWithEmail;
