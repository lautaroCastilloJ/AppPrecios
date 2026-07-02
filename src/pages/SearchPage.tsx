import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductoCard } from '../components/ProductoCard'
import { buscarProductos, listarCategorias } from '../services/productos'
import type { Producto } from '../types/producto'
import { mensajeError } from '../lib/errores'

export function SearchPage() {
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [categorias, setCategorias] = useState<string[]>([])
  const [resultados, setResultados] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargamos las categorías una vez para el filtro.
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  // Búsqueda en vivo con un pequeño debounce para no pegarle a la base en cada tecla.
  useEffect(() => {
    let vigente = true

    const timer = setTimeout(() => {
      setCargando(true)
      setError(null)
      buscarProductos({ texto, categoria })
        .then((r) => {
          if (vigente) setResultados(r)
        })
        .catch((e) => {
          if (vigente) setError(mensajeError(e))
        })
        .finally(() => {
          if (vigente) setCargando(false)
        })
    }, 250)

    return () => {
      vigente = false
      clearTimeout(timer)
    }
  }, [texto, categoria])

  return (
    <section className="pagina">
      <h2 className="pagina__titulo">Buscar productos</h2>

      <div className="filtros">
        <input
          className="filtros__texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre…"
          autoComplete="off"
        />
        <select
          className="filtros__categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="alerta alerta--error">{error}</p>}
      {cargando && <p className="aviso">Buscando…</p>}
      {!cargando && !error && resultados.length === 0 && (
        <p className="aviso">No se encontraron productos.</p>
      )}

      <div className="lista">
        {resultados.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            acciones={
              <Link className="btn btn--chico" to={`/productos/${producto.id}/editar`}>
                Editar
              </Link>
            }
          />
        ))}
      </div>
    </section>
  )
}
