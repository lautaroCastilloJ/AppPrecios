import { supabase } from '../lib/supabase'
import type { CambiosProducto, NuevoProducto, Producto } from '../types/producto'

/**
 * Módulo de servicios: TODAS las operaciones contra la base pasan por acá.
 * Los componentes nunca hablan con Supabase directamente.
 */

const TABLA = 'productos'

/** Busca un producto por su código de barras exacto. Devuelve null si no existe. */
export async function buscarPorCodigo(codigo: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('codigo_barras', codigo.trim())
    .maybeSingle()

  if (error) throw error
  return data
}

export interface FiltroBusqueda {
  /** Texto parcial a buscar en el nombre (case-insensitive). */
  texto?: string
  /** Categoría exacta para filtrar. */
  categoria?: string
}

/** Busca productos por nombre parcial (case-insensitive) y/o categoría. */
export async function buscarProductos(filtro: FiltroBusqueda = {}): Promise<Producto[]> {
  let query = supabase.from(TABLA).select('*').order('nombre', { ascending: true })

  const texto = filtro.texto?.trim()
  if (texto) {
    // ilike = case-insensitive; los % hacen la coincidencia parcial.
    query = query.ilike('nombre', `%${texto}%`)
  }
  if (filtro.categoria) {
    query = query.eq('categoria', filtro.categoria)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Lista todos los productos, del más recientemente actualizado al más viejo. */
export async function listarProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .order('actualizado_en', { ascending: false })

  if (error) throw error
  return data ?? []
}

/** Devuelve un producto por su id, o null si no existe. */
export async function obtenerProducto(id: string): Promise<Producto | null> {
  const { data, error } = await supabase.from(TABLA).select('*').eq('id', id).maybeSingle()

  if (error) throw error
  return data
}

/** Lista las categorías distintas que existen (para armar el filtro). */
export async function listarCategorias(): Promise<string[]> {
  const { data, error } = await supabase.from(TABLA).select('categoria')

  if (error) throw error
  const categorias = new Set((data ?? []).map((fila) => fila.categoria).filter(Boolean))
  return [...categorias].sort((a, b) => a.localeCompare(b, 'es'))
}

/** Crea un producto nuevo y devuelve la fila insertada. */
export async function crearProducto(datos: NuevoProducto): Promise<Producto> {
  const { data, error } = await supabase
    .from(TABLA)
    .insert({
      ...datos,
      codigo_barras: datos.codigo_barras.trim(),
      nombre: datos.nombre.trim(),
      categoria: datos.categoria.trim(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Edita un producto existente y devuelve la fila actualizada. */
export async function editarProducto(id: string, cambios: CambiosProducto): Promise<Producto> {
  const { data, error } = await supabase
    .from(TABLA)
    .update({ ...cambios, actualizado_en: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/** Elimina un producto por id. */
export async function eliminarProducto(id: string): Promise<void> {
  const { error } = await supabase.from(TABLA).delete().eq('id', id)
  if (error) throw error
}
