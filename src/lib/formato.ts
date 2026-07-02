const formateadorPrecio = new Intl.NumberFormat('es', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formatea un precio numérico como texto con separador de miles y 2 decimales. */
export function formatearPrecio(precio: number): string {
  return `$ ${formateadorPrecio.format(precio)}`
}
