# Precios Almacén

App mobile-first para consultar y administrar precios de un almacén. Escaneás el
código de barras de un producto con la cámara del celular y ves su nombre,
categoría y precio. Si el producto no existe, lo cargás en el momento.

Hecha con **React + TypeScript + Vite**, base de datos en **Supabase** y escaneo
de códigos con **react-zxing** (anda en Safari de iOS).

## Funcionalidades

- **Escanear**: abre la cámara trasera, lee códigos EAN/UPC y busca el producto.
  Si existe muestra sus datos; si no, aparece un formulario para cargarlo.
- **Buscar**: por nombre (parcial, sin distinguir mayúsculas) y filtrando por
  categoría.
- **Productos**: alta, edición, borrado y listado (CRUD completo).
- Ruteo entre pantallas con `react-router-dom`.

## Requisitos

- Node.js 20+ y npm.
- Una cuenta gratuita de [Supabase](https://supabase.com).

## Puesta en marcha (resumen)

```bash
npm install
cp .env.example .env   # y completá tus credenciales de Supabase
npm run dev
```

Después abrí la URL que muestra la consola (por defecto http://localhost:5173).

> Los pasos manuales (crear la tabla en Supabase y cargar el `.env`) están
> detallados abajo, en **Pasos manuales**.

## Pasos manuales

### 1. Crear la tabla en Supabase

Entrá a tu proyecto de Supabase → **SQL Editor** → **New query**, pegá esto y
dale **Run**:

```sql
-- Tabla de productos
create table if not exists public.productos (
  id             uuid primary key default gen_random_uuid(),
  codigo_barras  text        not null unique,
  nombre         text        not null,
  categoria      text        not null default '',
  precio         numeric(10, 2) not null default 0,
  actualizado_en timestamptz not null default now()
);

-- Índice para acelerar la búsqueda por código de barras
create index if not exists productos_codigo_barras_idx
  on public.productos (codigo_barras);

-- Row Level Security: la app usa la anon key, así que habilitamos acceso.
-- OJO: esta policy es permisiva (cualquiera con la anon key puede leer/escribir).
-- Alcanza para un uso personal; si la app va a ser pública, restringí con Auth.
alter table public.productos enable row level security;

create policy "acceso publico al almacen"
  on public.productos
  for all
  to anon
  using (true)
  with check (true);
```

### 2. Cargar las variables de entorno

1. En Supabase, andá a **Project Settings → API** (o **Data API / API Keys**).
2. Copiá:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. Copiá `.env.example` a `.env` y pegá esos valores:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-public-key
   ```

El `.env` está en el `.gitignore`, así que tus credenciales no se suben al repo.
Si cambiás el `.env`, reiniciá `npm run dev` para que Vite lo tome.

## La cámara necesita HTTPS

`getUserMedia` (la API de la cámara) **sólo funciona sobre HTTPS o en
`localhost`**. Por eso:

- En tu compu, `http://localhost:5173` funciona sin problema.
- Para probar desde el **celular**, `http://<ip-de-tu-pc>:5173` **no** va a
  dejar prender la cámara (es HTTP plano). Tenés que servir la app por HTTPS.
  Opciones rápidas:
  - Deployá a un hosting con HTTPS (Vercel, Netlify, Cloudflare Pages, etc.).
  - O usá un túnel tipo `ngrok http 5173` / `cloudflared tunnel` y abrí la URL
    `https://…` que te da.

Además, en iOS la cámara sólo arranca a partir de un gesto del usuario: por eso
hay un botón **"Escanear"** y no se enciende sola.

> El escáner descarga un pequeño módulo WASM (de `barcode-detector`) la primera
> vez que lo usás, así que necesitás conexión a internet al abrir la cámara.

## Scripts

| Comando           | Qué hace                                    |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con HMR              |
| `npm run build`   | Chequeo de tipos + build de producción      |
| `npm run preview` | Sirve el build de producción localmente     |
| `npm run lint`    | Corre ESLint                                |

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── BarcodeScanner.tsx   # Escáner (react-zxing, apto iOS Safari)
│   ├── Layout.tsx           # Cabecera + navegación inferior
│   ├── ProductoCard.tsx     # Tarjeta de producto
│   └── ProductoForm.tsx     # Formulario de alta/edición
├── pages/               # Una por pantalla / ruta
│   ├── ScanPage.tsx
│   ├── SearchPage.tsx
│   ├── ProductosPage.tsx
│   ├── NuevoProductoPage.tsx
│   └── EditarProductoPage.tsx
├── services/            # TODAS las operaciones de base pasan por acá
│   └── productos.ts         # consultar por código, buscar, crear, editar, borrar
├── lib/
│   ├── supabase.ts          # Cliente único de Supabase
│   ├── errores.ts           # Helper de mensajes de error
│   └── formato.ts           # Formato de precios
├── types/
│   ├── producto.ts          # Tipo Producto y derivados
│   └── database.ts          # Tipado del esquema para Supabase
├── App.tsx              # Rutas (react-router-dom)
└── main.tsx             # Punto de entrada (BrowserRouter)
```

Los componentes **nunca** hablan con Supabase directamente: todo pasa por
`src/services/productos.ts`.
