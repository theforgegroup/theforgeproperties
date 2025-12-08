import { supabase } from '../lib/supabaseClient';

/**
 * Syncs a subscriber to MailerLite using Supabase Edge Functions.
 * This prevents CORS errors and keeps the API Key secure on the server side.
 */
export const syncSubscriberToMailerLite = async (email: string) => {
  try {
    // We invoke the 'newsletter-subscribe' function deployed on Supabase
    const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
      body: { email }
    });

    if (error) {
      console.error('Supabase Edge Function Error:', error);
      return;
    }

    console.log('Successfully synced to MailerLite:', data);
  } catch (error) {
    console.error('Failed to invoke newsletter-subscribe function:', error);
  }
};