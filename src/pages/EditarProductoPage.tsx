import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductoForm } from '../components/ProductoForm'
import { editarProducto, obtenerProducto } from '../services/productos'
import type { NuevoProducto, Producto } from '../types/producto'
import { mensajeError } from '../lib/errores'

export function EditarProductoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let vigente = true
    obtenerProducto(id)
      .then((p) => {
        if (!vigente) return
        setProducto(p)
        if (!p) setError('No se encontró el producto.')
      })
      .catch((e) => {
        if (vigente) setError(mensajeError(e))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [id])

  async function guardar(datos: NuevoProducto) {
    if (!id) return
    await editarProducto(id, datos)
    navigate('/productos')
  }

  return (
    <section className="pagina">
      <h2 className="pagina__titulo">Editar producto</h2>

      {cargando && <p className="aviso">Cargando…</p>}
      {error && <p className="alerta alerta--error">{error}</p>}

      {producto && (
        <ProductoForm
          inicial={producto}
          codigoBloqueado
          textoBoton="Guardar cambios"
          onGuardar={guardar}
          onCancelar={() => navigate(-1)}
        />
      )}
    </section>
  )
}
