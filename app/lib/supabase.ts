import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wchwvuobgnyonyofbebv.supabase.co'
const supabaseAnonKey = 'sb_publishable_a7kcIbiC8qsrKqiACvdHRQ_1cOO7qHN'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
