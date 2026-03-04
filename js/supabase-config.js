/* =====================================================
   Supabase Configuration
   =====================================================
   IMPORTANT: Replace these values with your actual
   Supabase project credentials from:
   https://supabase.com/dashboard → Project → Settings → API
   ===================================================== */

var SUPABASE_URL = "__SUPABASE_URL__";
var SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";

// Initialize Supabase client (available after supabase-js CDN loads)
var supabase;
function initSupabase() {
  if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  return false;
}
