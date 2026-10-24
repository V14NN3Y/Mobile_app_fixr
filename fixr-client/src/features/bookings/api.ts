import { USE_MOCKS } from '@/lib/env';

import * as mock from './api.mock';
import * as real from './api.supabase';

const impl = USE_MOCKS ? mock : real;

export const getActiveBookingForArtisan = impl.getActiveBookingForArtisan;
export const getBookings = impl.getBookings;
export const getBookingById = impl.getBookingById;
export const cancelBooking = impl.cancelBooking;
export const restoreBooking = impl.restoreBooking;
export const advanceMissionStage = impl.advanceMissionStage;
export const getReportForBooking = impl.getReportForBooking;
export const getQuotesForBooking = impl.getQuotesForBooking;
export const getBookingIdsWithReport = impl.getBookingIdsWithReport;
export const acceptQuote = impl.acceptQuote;
export const validateReport = impl.validateReport;
