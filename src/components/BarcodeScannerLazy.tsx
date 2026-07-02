import { lazy, Suspense } from 'react'

/**
 * Carga diferida del escáner. El motor ZBar (WASM) es pesado, así que solo se
 * descarga cuando el usuario realmente abre la cámara, no en la carga inicial.
 */
const BarcodeScannerInterno = lazy(() =>
  import('./BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })),
)

interface Props {
  onDetectado: (codigo: string) => void
}

export function BarcodeScanner(props: Props) {
  return (
    <Suspense fallback={<p className="aviso">Cargando escáner…</p>}>
      <BarcodeScannerInterno {...props} />
    </Suspense>
  )
}
