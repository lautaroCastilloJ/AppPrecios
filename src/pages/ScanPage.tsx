import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { ProductoCard } from '../components/ProductoCard'
import { ProductoForm } from '../components/ProductoForm'
import { buscarPorCodigo, crearProducto } from '../services/productos'
import type { NuevoProducto, Producto } from '../types/producto'
import { mensajeError } from '../lib/errores'

type Estado =
  | { fase: 'inicial' }
  | { fase: 'buscando' }
  | { fase: 'encontrado'; producto: Producto }
  | { fase: 'nuevo'; codigo: string }
  | { fase: 'error'; mensaje: string }

export function ScanPage() {
  const [estado, setEstado] = useState<Estado>({ fase: 'inicial' })
  const [codigoManual, setCodigoManual] = useState('')

  async function procesarCodigo(codigo: string) {
    const limpio = codigo.trim()
    if (!limpio) return
    setEstado({ fase: 'buscando' })
    try {
      const producto = await buscarPorCodigo(limpio)
      setEstado(producto ? { fase: 'encontrado', producto } : { fase: 'nuevo', codigo: limpio })
    } catch (e) {
      setEstado({ fase: 'error', mensaje: mensajeError(e) })
    }
  }

  async function guardarNuevo(datos: NuevoProducto) {
    const creado = await crearProducto(datos)
    setEstado({ fase: 'encontrado', producto: creado })
  }

  function reiniciar() {
    setEstado({ fase: 'inicial' })
    setCodigoManual('')
  }

  function buscarManual(evento: FormEvent) {
    evento.preventDefault()
    procesarCodigo(codigoManual)
  }

  return (
    <section className="pagina">
      <h2 className="pagina__titulo">Escanear producto</h2>

      <BarcodeScanner onDetectado={procesarCodigo} />

      <form className="busqueda-manual" onSubmit={buscarManual}>
        <input
          value={codigoManual}
          onChange={(e) => setCodigoManual(e.target.value)}
          placeholder="…o ingresá el código a mano"
          inputMode="numeric"
        />
        <button type="submit" className="btn">
          Buscar
        </button>
      </form>

      {estado.fase === 'buscando' && <p className="aviso">Buscando…</p>}

      {estado.fase === 'error' && (
        <div className="alerta alerta--error">
          {estado.mensaje}
          <button type="button" className="btn" onClick={reiniciar}>
            Reintentar
          </button>
        </div>
      )}

      {estado.fase === 'encontrado' && (
        <div className="resultado">
          <p className="aviso aviso--ok">Producto encontrado ✅</p>
          <ProductoCard
            producto={estado.producto}
            acciones={
              <Link className="btn btn--chico" to={`/productos/${estado.producto.id}/editar`}>
                Editar
              </Link>
            }
          />
          <button type="button" className="btn btn--primario" onClick={reiniciar}>
            Escanear otro
          </button>
        </div>
      )}

      {estado.fase === 'nuevo' && (
        <div className="resultado">
          <p className="aviso aviso--warn">
            No hay ningún producto con el código <strong>{estado.codigo}</strong>. Cargalo:
          </p>
          <ProductoForm
            inicial={{ codigo_barras: estado.codigo }}
            codigoBloqueado
            textoBoton="Crear producto"
            onGuardar={guardarNuevo}
            onCancelar={reiniciar}
          />
        </div>
      )}
    </section>
  )
}
