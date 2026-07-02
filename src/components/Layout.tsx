import { NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="app">
      <header className="app__header">
        <span className="app__titulo">🏪 Precios Almacén</span>
      </header>

      <main className="app__main">
        <Outlet />
      </main>

      <nav className="nav">
        <NavLink to="/" end className="nav__item">
          <span className="nav__icono">📷</span>
          <span>Escanear</span>
        </NavLink>
        <NavLink to="/buscar" className="nav__item">
          <span className="nav__icono">🔎</span>
          <span>Buscar</span>
        </NavLink>
        <NavLink to="/productos" className="nav__item">
          <span className="nav__icono">📦</span>
          <span>Productos</span>
        </NavLink>
      </nav>
    </div>
  )
}
