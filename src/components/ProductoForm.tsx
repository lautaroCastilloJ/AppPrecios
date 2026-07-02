import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NuevoProducto, Producto } from '../types/producto'
import { mensajeError } from '../lib/errores'
import { BarcodeScanner } from './BarcodeScanner'

interface Props {
  /** Valores iniciales (para editar, o para precargar el código al escanear). */
  inicial?: Partial<Producto>
  /** Si es true, el código de barras queda de sólo lectura. */
  codigoBloqueado?: boolean
  textoBoton?: string
  onGuardar: (datos: NuevoProducto) => Promise<void>
  onCancelar?: () => void
}

export function ProductoForm({
  inicial,
  codigoBloqueado = false,
  textoBoton = 'Guardar',
  onGuardar,
  onCancelar,
}: Props) {
  const [codigoBarras, setCodigoBarras] = useState(inicial?.codigo_barras ?? '')
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [categoria, setCategoria] = useState(inicial?.categoria ?? '')
  const [precio, setPrecio] = useState(inicial?.precio != null ? String(inicial.precio) : '')
  const [guardando, setGuardando] = useState(false)
  const [escaneando, setEscaneando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function manejarSubmit(evento: FormEvent) {
    evento.preventDefault()
    setError(null)

    if (!codigoBarras.trim()) {
      setError('El código de barras es obligatorio.')
      return
    }
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    const precioNum = Number(precio)
    if (precio.trim() === '' || Number.isNaN(precioNum) || precioNum < 0) {
      setError('Ingresá un precio válido (número mayor o igual a 0).')
      return
    }

    setGuardando(true)
    try {
      await onGuardar({
        codigo_barras: codigoBarras.trim(),
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: precioNum,
      })
    } catch (err) {
      setError(mensajeError(err))
      setGuardando(false)
    }
  }

  return (
    <form className="form" onSubmit={manejarSubmit}>
      <div className="form__campo">
        <span>Código de barras</span>
        {codigoBloqueado ? (
          <input value={codigoBarras} readOnly inputMode="numeric" autoComplete="off" />
        ) : (
          <>
            <div className="form__codigo-row">
              <input
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Escaneá o ingresá el código"
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
                onDetectado={(codigo) => {
                  setCodigoBarras(codigo)
                  setEscaneando(false)
                }}
              />
            )}
          </>
        )}
      </div>

      <label className="form__campo">
        <span>Nombre</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="off" />
      </label>

      <label className="form__campo">
        <span>Categoría</span>
        <input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ej: Bebidas, Limpieza…"
          autoComplete="off"
        />
      </label>

      <label className="form__campo">
        <span>Precio</span>
        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
        />
      </label>

      {error && <p className="alerta alerta--error">{error}</p>}

      <div className="form__acciones">
        <button type="submit" className="btn btn--primario" disabled={guardando}>
          {guardando ? 'Guardando…' : textoBoton}
        </button>
        {onCancelar && (
          <button type="button" className="btn" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
