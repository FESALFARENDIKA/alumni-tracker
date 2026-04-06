import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oxivhrinkufeqbeawfjh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_u6IpPt8TPnz7aQD534LNzA_lNTfc0tQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
