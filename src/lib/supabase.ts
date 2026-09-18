import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gynrdvdfxidhwihmkqdu.supabase.co';
const supabaseAnonKey = 'sb_publishable_bkKSQjuYfJwlAmj7WRfpwQ_EmdS08AQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);