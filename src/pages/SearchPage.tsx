import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { ProductoCard } from '../components/ProductoCard'
import { buscarProductos, listarCategorias } from '../services/productos'
import type { Producto } from '../types/producto'
import { mensajeError } from '../lib/errores'

export function SearchPage() {
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [categorias, setCategorias] = useState<string[]>([])
  const [resultados, setResultados] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(false)
  const [escaneando, setEscaneando] = useState(false)
  const [busquedaHecha, setBusquedaHecha] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargamos las categorías una vez para el filtro.
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  // Lanza la consulta (se llama desde el botón, el scan o el filtro de categoría).
  async function ejecutarBusqueda(textoBusqueda: string, categoriaBusqueda: string) {
    setCargando(true)
    setError(null)
    setBusquedaHecha(true)
    try {
      const encontrados = await buscarProductos({ texto: textoBusqueda, categoria: categoriaBusqueda })
      setResultados(encontrados)
    } catch (e) {
      setError(mensajeError(e))
      setResultados([])
    } finally {
      setCargando(false)
    }
  }

  // "Todas las categorías" no busca nada: solo limpia la pantalla.
  function limpiarPantalla() {
    setResultados([])
    setBusquedaHecha(false)
    setError(null)
  }

  function manejarSubmit(evento: FormEvent) {
    evento.preventDefault()
    void ejecutarBusqueda(texto, categoria)
  }

  function manejarCategoria(nueva: string) {
    setCategoria(nueva)
    if (nueva === '') {
      limpiarPantalla()
    } else {
      void ejecutarBusqueda(texto, nueva)
    }
  }

  return (
    <section className="pagina">
      <h2 className="pagina__titulo">Buscar productos</h2>

      <div className="filtros">
        <form className="filtros__form" onSubmit={manejarSubmit}>
          <div className="filtros__busqueda">
            <input
              className="filtros__texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por nombre o código…"
              inputMode="search"
              autoComplete="off"
            />
            <button
              type="button"
              className="btn btn--chico"
              onClick={() => setEscaneando((v) => !v)}
            >
              {escaneando ? 'Cerrar' : '📷 Escanear'}
            </button>
          </div>

          {escaneando && (
            <BarcodeScanner
              autoIniciar
              onDetectado={(codigo) => {
                setTexto(codigo)
                setEscaneando(false)
                void ejecutarBusqueda(codigo, categoria)
              }}
            />
          )}

          <button type="submit" className="btn btn--primario">
            Buscar
          </button>
        </form>

        <select
          className="filtros__categoria"
          value={categoria}
          onChange={(e) => manejarCategoria(e.target.value)}
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
      {!cargando && !error && !busquedaHecha && (
        <p className="aviso">
          Escribí un nombre o código y tocá <strong>Buscar</strong>, o elegí una categoría.
        </p>
      )}
      {!cargando && !error && busquedaHecha && resultados.length === 0 && (
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
