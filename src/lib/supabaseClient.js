
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxwbeyfoilrrumvbsblu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4d2JleWZvaWxycnVtdmJzYmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg1ODAsImV4cCI6MjA2MjI0NDU4MH0.ldB2V6RtuHPggL6OHUXj1Ah61yVAJ9zao57p89AoRzk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
