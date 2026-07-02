import { useNavigate } from 'react-router-dom'
import { ProductoForm } from '../components/ProductoForm'
import { crearProducto } from '../services/productos'
import type { NuevoProducto } from '../types/producto'

export function NuevoProductoPage() {
  const navigate = useNavigate()

  async function guardar(datos: NuevoProducto) {
    await crearProducto(datos)
    navigate('/productos')
  }

  return (
    <section className="pagina">
      <h2 className="pagina__titulo">Nuevo producto</h2>
      <ProductoForm textoBoton="Crear" onGuardar={guardar} onCancelar={() => navigate(-1)} />
    </section>
  )
}
