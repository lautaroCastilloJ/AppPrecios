import { useState } from 'react'
import { useZxing } from 'react-zxing'
import { mensajeError } from '../lib/errores'

interface Props {
  /** Se llama con el código de barras leído cuando el escáner detecta uno. */
  onDetectado: (codigo: string) => void
  /** Arranca la cámara apenas se monta (flujo de "un solo tap"; el montaje ya viene de un gesto). */
  autoIniciar?: boolean
}

const MENSAJE_HTTPS =
  'La cámara sólo funciona sobre HTTPS o en localhost. Serví la app con HTTPS para poder escanear desde el celular.'

/** ¿El navegador puede darnos la cámara? (contexto seguro + API disponible) */
function camaraDisponible(): boolean {
  return window.isSecureContext && !!navigator.mediaDevices?.getUserMedia
}

/** Traduce los errores típicos de getUserMedia a mensajes claros en español. */
function describirErrorCamara(err: unknown): string {
  if (err && typeof err === 'object' && 'name' in err) {
    switch ((err as { name: string }).name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Permiso de cámara denegado. Habilitá la cámara para este sitio en los ajustes del navegador y volvé a intentar.'
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'No se encontró una cámara trasera disponible en este dispositivo.'
      case 'NotReadableError':
        return 'No se pudo acceder a la cámara. Puede estar siendo usada por otra app; cerrala y reintentá.'
    }
  }
  return mensajeError(err, 'No se pudo iniciar la cámara.')
}

/**
 * Escáner de códigos de barras EAN/UPC.
 *
 * Pensado para andar en Safari de iOS:
 * - usa react-zxing (ponyfill WASM), NO la API nativa BarcodeDetector;
 * - el <video> tiene playsInline y muted;
 * - la cámara arranca a partir de un gesto del usuario (botón propio o `autoIniciar`);
 * - pide la cámara trasera con facingMode: "environment".
 */
export function BarcodeScanner({ onDetectado, autoIniciar = false }: Props) {
  // Con autoIniciar arrancamos ya prendida (el montaje viene de un gesto del usuario).
  const [activo, setActivo] = useState(() => autoIniciar && camaraDisponible())
  const [error, setError] = useState<string | null>(() =>
    autoIniciar && !camaraDisponible() ? MENSAJE_HTTPS : null,
  )

  const { ref } = useZxing({
    paused: !activo,
    constraints: { audio: false, video: { facingMode: 'environment' } },
    onDecodeResult(result) {
      setActivo(false)
      onDetectado(result.rawValue)
    },
    onError(err) {
      setActivo(false)
      setError(describirErrorCamara(err))
    },
  })

  function iniciar() {
    setError(null)
    if (!camaraDisponible()) {
      setError(MENSAJE_HTTPS)
      return
    }
    setActivo(true)
  }

  return (
    <div className="scanner">
      <div className="scanner__viewport">
        <video ref={ref} className="scanner__video" playsInline muted />
        {!activo && <div className="scanner__apagada">Cámara apagada</div>}
        {activo && <div className="scanner__guia" aria-hidden="true" />}
      </div>

      {/* Botones internos sólo cuando NO es autoIniciar (ahí el padre maneja abrir/cerrar). */}
      {!autoIniciar &&
        (activo ? (
          <button type="button" className="btn" onClick={() => setActivo(false)}>
            Detener
          </button>
        ) : (
          <button type="button" className="btn btn--primario" onClick={iniciar}>
            📷 Escanear
          </button>
        ))}

      {error && <p className="alerta alerta--error">{error}</p>}
    </div>
  )
}
