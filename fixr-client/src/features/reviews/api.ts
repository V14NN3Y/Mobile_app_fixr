import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

export type { SubmitReviewInput } from './api.mock';

const impl = USE_MOCKS ? mock : real;

export const submitReview = impl.submitReview;
export const getMyReviews = impl.getMyReviews;
