import { useEffect, useRef, useState } from 'react'
import { BarcodeScanner as ZbarScanner } from 'modern-barcode-scanner'
import type { BarcodeScannerRef, ScanResult } from 'modern-barcode-scanner'
import 'modern-barcode-scanner/styles.css'
import { mensajeError } from '../lib/errores'

interface Props {
  /** Se llama con el código de barras leído cuando el escáner detecta uno. */
  onDetectado: (codigo: string) => void
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
 * Usa `modern-barcode-scanner` (motor ZBar vía WASM, worker y wasm embebidos):
 * lee mejor los códigos 1D del mundo real y no depende de la API nativa
 * BarcodeDetector, así que anda en Safari de iOS.
 *
 * Se monta sólo cuando el usuario toca "Escanear" (gesto requerido por iOS),
 * y arranca la cámara al montarse con `start()` sobre el ref.
 */
export function BarcodeScanner({ onDetectado }: Props) {
  const scannerRef = useRef<BarcodeScannerRef>(null)
  const [error, setError] = useState<string | null>(() =>
    camaraDisponible() ? null : MENSAJE_HTTPS,
  )

  useEffect(() => {
    if (!camaraDisponible()) return
    const scanner = scannerRef.current
    scanner?.start()?.catch((e: unknown) => setError(describirErrorCamara(e)))
    return () => scanner?.stop()
  }, [])

  return (
    <div className="scanner">
      <div className="scanner__viewport">
        <ZbarScanner
          ref={scannerRef}
          onScan={(result: ScanResult) => onDetectado(result.scanData)}
          onError={(e) => setError(describirErrorCamara(e))}
          initialFacingMode="environment"
          themeColor="#2563eb"
        />
      </div>

      {error && <p className="alerta alerta--error">{error}</p>}
    </div>
  )
}
