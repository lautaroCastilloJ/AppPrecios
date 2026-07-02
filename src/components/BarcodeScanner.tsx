import { useState } from 'react'
import { useZxing } from 'react-zxing'
import { mensajeError } from '../lib/errores'

interface Props {
  /** Se llama con el código de barras leído cuando el escáner detecta uno. */
  onDetectado: (codigo: string) => void
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
 * - la cámara arranca recién con el botón "Escanear" (iOS exige gesto del usuario);
 * - pide la cámara trasera con facingMode: "environment".
 */
export function BarcodeScanner({ onDetectado }: Props) {
  const [activo, setActivo] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    // La cámara sólo funciona sobre HTTPS o localhost.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(
        'La cámara sólo funciona sobre HTTPS o en localhost. Serví la app con HTTPS para poder escanear desde el celular.',
      )
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

      {activo ? (
        <button type="button" className="btn" onClick={() => setActivo(false)}>
          Detener
        </button>
      ) : (
        <button type="button" className="btn btn--primario" onClick={iniciar}>
          📷 Escanear
        </button>
      )}

      {error && <p className="alerta alerta--error">{error}</p>}
    </div>
  )
}
