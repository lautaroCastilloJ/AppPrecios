/**
 * Modelo de un producto tal como vive en la tabla `productos` de Supabase.
 *
 * Se define con `type` (no `interface`) a propósito: el tipado del cliente de
 * Supabase exige que la fila sea asignable a `Record<string, unknown>`, y sólo
 * los object types (no las interfaces) obtienen esa index signature implícita.
 */
export type Producto = {
  id: string
  codigo_barras: string
  nombre: string
  categoria: string
  precio: number
  /** Timestamp ISO (columna `actualizado_en`, tipo timestamptz). */
  actualizado_en: string
}

/**
 * Datos que se cargan al crear o editar. El `id` y `actualizado_en` los maneja
 * la base (default + valor que seteamos al actualizar), así que no van acá.
 */
export type NuevoProducto = Omit<Producto, 'id' | 'actualizado_en'>

/** Cambios parciales permitidos al editar un producto existente. */
export type CambiosProducto = Partial<NuevoProducto>
