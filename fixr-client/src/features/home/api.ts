import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

export type { ActiveMission, HomeData, LastBooking } from './api.mock';

const impl = USE_MOCKS ? mock : real;

export const getHomeData = impl.getHomeData;
