/** Extrae un mensaje legible de cualquier error (Error, string, o error de Supabase). */
export function mensajeError(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return fallback
}
