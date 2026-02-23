# ABASTOS | Challenge Tecnico

Aplicacion web Kanban (estilo Trello) para gestionar tareas por usuario con autenticacion y persistencia SQL.

## URLs de despliegue

- Frontend: `https://abastos-kanban-frontend.onrender.com`
- Backend API: `https://abastos-kanban.onrender.com`

## Estado funcional

Implementado:

- Login con `identifier` (`email` o `username`) + `password` usando Laravel Sanctum.
- Rutas protegidas para tablero.
- Tablero Kanban con 3 columnas: `todo`, `doing`, `done`.
- CRUD de tareas desde UI:
  - crear
  - editar (modal con icono lapiz)
  - mover entre columnas (botones y drag & drop)
  - eliminar (modal de confirmacion)
- Filtro por texto (titulo/descripcion).
- Fecha de creacion visible en cada tarjeta.
- Cada usuario solo ve sus propias tareas.
- Persistencia en PostgreSQL.
- Seed con usuarios y tareas iniciales.
- Diseño responsive (desktop y mobile).

## Stack tecnico

Frontend:

- React 19
- React Router
- Vite
- CSS

Backend:

- Laravel 12
- Laravel Sanctum (token bearer)
- API REST en `/api`

Base de datos:

- PostgreSQL

Infra:

- Docker + Docker Compose para entorno local (backend + postgres + pgAdmin)
- Render para despliegue (backend y frontend)

## Estructura del repositorio

```text
abastos-kanban/
  backend/            # API Laravel + migraciones + seeders
  frontend/           # SPA React
  docker-compose.yml  # App (Laravel), DB (Postgres), pgAdmin
  sanctum-check.sh    # Script de verificacion de flujo Sanctum
```

## Requisitos previos

- Docker y Docker Compose
- Node.js 20+ y npm
- (Opcional) PHP 8.2+ para comandos artisan fuera de Docker

## Ejecucion en local

### 1) Backend + DB (Docker)

Desde la raiz del proyecto:

```bash
docker compose up -d db app pgadmin
docker compose exec app composer install
docker compose exec app cp .env.example .env
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed --no-interaction
```

URLs utiles:

- API: `http://localhost:8000`
- pgAdmin: `http://localhost:5050`
  - user: `admin@abastos.com`
  - password: `admin123`

### 2) Frontend (Vite)

Desde `frontend/`:

```bash
npm install
npm run dev
```

Frontend local:

- `http://localhost:5173`

Variable opcional:

- `VITE_API_URL` (por defecto `http://localhost:8000`)

## Credenciales de prueba (seed)

Todas usan password `secret123`.

- `admin@abastos.com` (username: `admin`)
- `david@abastos.com` (username: `david`)
- `carlos@abastos.com` (username: `carlos`)

## Como probar funcionalidades (flujo E2E)

1. Abrir frontend (`/login`).
2. Iniciar sesion con `email` o `username` + `password`.
3. Verificar redireccion a `/board`.
4. Crear tarea.
5. Editar tarea desde el icono lapiz.
6. Mover tarea entre columnas (botones o drag & drop).
7. Eliminar tarea con confirmacion.
8. Recargar pagina y comprobar persistencia.
9. Cerrar sesion.
10. Intentar entrar a `/board` sin token y validar redireccion a `/login`.

## API implementada

Publica:

- `POST /api/login`

Protegidas con `auth:sanctum`:

- `GET /api/me`
- `POST /api/logout`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

Ejemplo login:

```bash
curl -X POST https://abastos-kanban.onrender.com/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@abastos.com","password":"secret123"}'
```

## Script de verificacion de auth

En la raiz del repo:

```bash
BASE_URL=https://abastos-kanban.onrender.com \
IDENTIFIER=admin@abastos.com \
PASSWORD=secret123 \
./sanctum-check.sh
```

## Configuracion de despliegue usada

Backend (Render Web Service):

- Root directory: `backend`
- Runtime: Docker (`backend/Dockerfile`)
- Variables: `APP_*`, `DB_URL`, `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database`

Frontend (Render Static Site):

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Variable: `VITE_API_URL=https://abastos-kanban.onrender.com`
- Regla SPA: rewrite `/*` -> `/index.html`

## Limitaciones conocidas

- No hay test automatizado de negocio/e2e (solo tests base de Laravel).
- El `docker-compose.yml` local no levanta el frontend (se ejecuta con `npm run dev`).
- En plan free de Render puede haber cold starts y tiempo inicial de respuesta mayor.

## Herramientas AI utilizadas

- ChatGPT/Codex para:
  - debugging de errores puntuales
  - refactor de componentes (reduccion de duplicacion en board)
  - soporte de integracion API y despliegue
