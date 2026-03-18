import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust helper to avoid throwing "supabaseUrl is required" or causing null crashes
const createSafeClient = () => {
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
        console.warn('Supabase keys missing. Using mock client for prototype.');
        return {
            from: () => ({
                insert: async () => ({ error: null, data: null }),
                select: async () => ({ error: null, data: [] }),
                update: async () => ({ error: null, data: null }),
                upsert: async () => ({ error: null, data: null }),
            })
        } as any;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSafeClient();
