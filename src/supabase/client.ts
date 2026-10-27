import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swxiffcmfmoowokhglyi.supabase.co';
const supabaseKey = 'sb_publishable_lyX4MrLNdYVw38b74f6vCg_av6rwMiH';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
