import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing! ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel Dashboard.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const auth = {
  signUp: (email: string, password: string, data: any) =>
    supabase.auth.signUp({ email, password, options: { data } }),
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  getSession: () => supabase.auth.getSession(),
  verifyOtp: (email: string, token: string, type: 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email') =>
    supabase.auth.verifyOtp({ email, token, type }),
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    }),
  onAuthStateChange: (callback: any) => supabase.auth.onAuthStateChange(callback),
};
