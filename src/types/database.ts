import type { CambiosProducto, NuevoProducto, Producto } from './producto'

/**
 * Tipado mínimo del esquema para que el cliente de Supabase infiera bien las
 * respuestas de `from('productos')`. Si en el futuro agregás tablas, sumalas acá.
 */
export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto
        Insert: NuevoProducto & { id?: string; actualizado_en?: string }
        Update: CambiosProducto & { actualizado_en?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
