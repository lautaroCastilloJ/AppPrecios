import type { ReactNode } from 'react'
import type { Producto } from '../types/producto'
import { formatearPrecio } from '../lib/formato'

interface Props {
  producto: Producto
  /** Botones opcionales (editar, eliminar, etc.). */
  acciones?: ReactNode
}

export function ProductoCard({ producto, acciones }: Props) {
  return (
    <article className="card">
      <div className="card__info">
        <h3 className="card__nombre">{producto.nombre}</h3>
        {producto.categoria && <span className="chip">{producto.categoria}</span>}
        <p className="card__codigo">Código: {producto.codigo_barras}</p>
      </div>
      <div className="card__lateral">
        <span className="card__precio">{formatearPrecio(producto.precio)}</span>
        {acciones && <div className="card__acciones">{acciones}</div>}
      </div>
    </article>
  )
}
