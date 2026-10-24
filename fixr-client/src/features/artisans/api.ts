import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

export type { ArtisansPage, SearchArtisansInput } from './api.mock';

const impl = USE_MOCKS ? mock : real;

export const searchArtisans = impl.searchArtisans;
export const getArtisan = impl.getArtisan;
export const getArtisanAlternatives = impl.getArtisanAlternatives;
