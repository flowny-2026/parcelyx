// =====================================================
// CONFIGURAÇÃO DO SUPABASE
// =====================================================

const SUPABASE_URL = 'https://rflwwbzqfpivezcnhbum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbHd3YnpxZnBpdmV6Y25oYnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Mjg0MzAsImV4cCI6MjA5NzMwNDQzMH0.NZyqEyACBGlB7Ckywa0Cci4d4AFq2eQdDycx1OfRoo0';

// Cria o cliente Supabase apenas uma vez
var supabase = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabase;
