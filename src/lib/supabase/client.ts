/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

let getAccessToken: () => Promise<string | null> = async () => null;

export const setSupabaseAccessToken = (getter: () => Promise<string | null>) => {
  getAccessToken = getter;
};

// Clerk is the identity provider: Supabase verifies the Clerk session token sent on each request.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { accessToken: () => getAccessToken() }
);

export const PROGRESS_IMAGES_BUCKET = 'progress-images';
