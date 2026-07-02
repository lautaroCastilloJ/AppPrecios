import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductoCard } from '../components/ProductoCard'
import { eliminarProducto, listarProductos } from '../services/productos'
import type { Producto } from '../types/producto'
import { mensajeError } from '../lib/errores'

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    void (async () => {
      try {
        const datos = await listarProductos()
        if (vigente) setProductos(datos)
      } catch (e) {
        if (vigente) setError(mensajeError(e))
      } finally {
        if (vigente) setCargando(false)
      }
    })()
    return () => {
      vigente = false
    }
  }, [])

  async function borrar(producto: Producto) {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      await eliminarProducto(producto.id)
      setProductos((prev) => prev.filter((p) => p.id !== producto.id))
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  return (
    <section className="pagina">
      <div className="pagina__cabecera">
        <h2 className="pagina__titulo">Productos</h2>
        <Link to="/productos/nuevo" className="btn btn--primario btn--chico">
          + Nuevo
        </Link>
      </div>

      {error && <p className="alerta alerta--error">{error}</p>}
      {cargando && <p className="aviso">Cargando…</p>}
      {!cargando && !error && productos.length === 0 && (
        <p className="aviso">Todavía no hay productos cargados.</p>
      )}

      <div className="lista">
        {productos.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            acciones={
              <>
                <Link className="btn btn--chico" to={`/productos/${producto.id}/editar`}>
                  Editar
                </Link>
                <button
                  type="button"
                  className="btn btn--chico btn--peligro"
                  onClick={() => borrar(producto)}
                >
                  Eliminar
                </button>
              </>
            }
          />
        ))}
      </div>
    </section>
  )
}
