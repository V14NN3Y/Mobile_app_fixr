import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

const impl = USE_MOCKS ? mock : real;

export const getPrimaryAddress = impl.getPrimaryAddress;
export const getAddresses = impl.getAddresses;
export const addAddress = impl.addAddress;
export const updateAddress = impl.updateAddress;
export const deleteAddress = impl.deleteAddress;
export const setDefaultAddress = impl.setDefaultAddress;
