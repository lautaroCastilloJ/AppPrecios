import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Copiá el archivo .env.example a .env y cargá tus credenciales de Supabase.',
  )
}

/** Cliente único y reutilizable de Supabase para toda la app. */
export const supabase = createClient<Database>(url, anonKey)
