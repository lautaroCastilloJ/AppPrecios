import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ScanPage } from './pages/ScanPage'
import { SearchPage } from './pages/SearchPage'
import { ProductosPage } from './pages/ProductosPage'
import { NuevoProductoPage } from './pages/NuevoProductoPage'
import { EditarProductoPage } from './pages/EditarProductoPage'

function NoEncontrado() {
  return (
    <section className="pagina">
      <h2 className="pagina__titulo">Página no encontrada</h2>
      <Link to="/" className="btn btn--primario">
        Volver al inicio
      </Link>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ScanPage />} />
        <Route path="buscar" element={<SearchPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="productos/nuevo" element={<NuevoProductoPage />} />
        <Route path="productos/:id/editar" element={<EditarProductoPage />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}

export default App
