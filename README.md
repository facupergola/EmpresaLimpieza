# MANTEN LIMPIO – Control de ingreso/salida

App Next.js 16 (App Router) + Postgres en Docker. Reemplaza la versión estática con Supabase: el login,
la base de datos, la validación de fichajes y el panel admin ahora viven en esta misma app.

## Requisitos

- **Node 20.11 o superior** (probado con Node 25). Verificá con `node -v`.
- **Docker Desktop** (o cualquier Docker con `docker compose`) **abierto y corriendo** antes de empezar.
  Verificá con `docker info`; si falla, abrilo y esperá a que termine de iniciar.

## Puesta en marcha (primera vez)

Todos los comandos se corren dentro de esta carpeta (`empresa-limpieza/`).

### 1. Variables de entorno

```bash
cp .env.example .env
```

Abrí `.env` y ajustá:

| Variable                                   | Qué es                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credenciales del Postgres que levanta Docker.                        |
| `POSTGRES_PORT`                            | Puerto en tu máquina. Cambialo (p. ej. `5433`) si el 5432 ya está ocupado.      |
| `DATABASE_URL`                             | Tiene que coincidir con las cuatro variables anteriores (usuario, clave, puerto y base). |
| `SESSION_SECRET`                           | Firma de la cookie de sesión. Generá uno con `openssl rand -base64 32`.         |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`           | Primer administrador. Con esto entrás al panel la primera vez.                  |

El `.env` está en `.gitignore`: no lo subas al repo.

### 2. Dependencias

```bash
npm install
```

### 3. Base de datos

```bash
npm run db:setup
```

Este comando hace tres cosas: levanta el contenedor de Postgres y espera a que esté sano,
aplica las migraciones de `drizzle/` y crea el primer admin con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
Es seguro correrlo de nuevo: no duplica nada.

### 4. Servidor de desarrollo

```bash
npm run dev
```

Abrí http://localhost:3000. Te redirige a `/login`; entrá con el email y la contraseña del admin.

### 5. Cargar los datos iniciales

Desde el panel (http://localhost:3000/admin), como admin:

1. **Edificios / Escuelas**: agregá al menos un lugar. Si estás físicamente ahí, usá "📍 Usar mi ubicación actual";
   si no, cargá latitud y longitud a mano (por ejemplo desde Google Maps, botón derecho → copiar coordenadas).
2. **Avisos al jefe**: WhatsApp (con código de país, sin `+` ni espacios) y email que reciben los avisos de ingreso/salida.
3. **Usuarios**: creá una cuenta por empleado (email + contraseña de al menos 8 caracteres). Dejá "Es administrador"
   sin marcar para los empleados.

Los empleados entran en http://localhost:3000 con su cuenta y fichan desde la pantalla principal.

## Uso diario

```bash
docker compose up -d     # si Docker Desktop se reinició y el contenedor no está corriendo
npm run dev
```

El contenedor tiene `restart: unless-stopped`, así que mientras Docker Desktop esté abierto suele estar ya arriba.
Los datos viven en el volumen `pgdata` y sobreviven a reinicios.

## Comandos útiles

| Quiero…                              | Comando                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Parar la base (conservando datos)    | `docker compose down`                                                   |
| Borrar TODO y empezar de cero        | `docker compose down -v && npm run db:setup`                            |
| Ver logs de Postgres                 | `docker compose logs -f db`                                             |
| Entrar a la base con psql            | `docker compose exec db psql -U manten -d manten_limpio` (usá el usuario y la base de tu `.env`) |
| Cambiar el esquema                   | editá `db/schema.ts`, luego `npm run db:generate` y `npm run db:migrate` |
| Correr en modo producción local      | `npm run build && npm start`                                            |
| Correr tests / lint                  | `npm test` · `npm run lint`                                             |

## Problemas frecuentes

- **`Cannot connect to the Docker daemon`**: Docker Desktop no está abierto. Abrilo, esperá a que diga "running" y repetí.
- **`Bind for 0.0.0.0:5432 failed: port is already allocated`**: otro Postgres usa el 5432. En `.env` cambiá
  `POSTGRES_PORT=5433` **y** el puerto dentro de `DATABASE_URL` a `5433`, después `npm run db:setup`.
- **`Definí POSTGRES_USER en .env`** al levantar compose: falta el `.env` o le faltan variables. Volvé al paso 1.
- **`ECONNREFUSED` o timeouts al migrar/seedear**: el contenedor no está arriba o `DATABASE_URL` apunta a otro puerto.
  Revisá `docker compose ps` y que el puerto de `DATABASE_URL` sea el mismo que `POSTGRES_PORT`.
- **Entro a `/login` y vuelve a `/login`**: la cookie se firmó con otro `SESSION_SECRET` (lo cambiaste) o el usuario
  fue borrado. Borrá la cookie `ml_session` del navegador y volvé a entrar.
- **"No se pudo obtener tu ubicación"** en el navegador: el sitio necesita permiso de ubicación y contexto seguro.
  En `localhost` funciona; desde el celular por IP no (ver "Probar desde un celular").
- **Olvidé la contraseña del admin**: cambiar `ADMIN_PASSWORD` en `.env` no alcanza, el seed no pisa cuentas
  existentes. Creá otro admin desde una cuenta admin que sí recuerdes, o reseteá la base con
  `docker compose down -v && npm run db:setup`.

## Scripts

| Script            | Qué hace                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo                                                   |
| `npm run build`   | Build de producción (`npm start` para servirlo)                          |
| `npm run lint`    | ESLint                                                                   |
| `npm test`        | Tests unitarios (vitest) de la lógica pura: geo, reglas de fichaje, validación, sesión |
| `npm run db:setup`| `docker compose up -d --wait` + migraciones + seed                       |
| `npm run db:migrate` | Aplica las migraciones de `drizzle/`                                  |
| `npm run db:generate` | Genera una migración nueva a partir de `db/schema.ts`               |
| `npm run db:seed` | Crea el primer admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`); es idempotente  |

## Estructura

```
app/                 páginas (/, /admin, /login) y endpoints REST en app/api/**
components/          vistas cliente (empleado, admin, login) y helpers de UI
lib/                 lógica compartida: auth/sesión, geo, reglas de fichaje, validación, formato, textos legales
db/                  esquema Drizzle, cliente de DB y seed
drizzle/             migraciones SQL generadas (commiteadas)
proxy.ts             redirige a /login si no hay sesión válida
docker-compose.yml   Postgres 17
```

## Endpoints

Todos devuelven JSON; en error, `{ "error": "mensaje" }` con 400/401/403/404/409.

| Método y ruta                          | Quién     | Qué hace                                              |
| -------------------------------------- | --------- | ----------------------------------------------------- |
| `POST /api/auth/login`                 | todos     | `{email,password}` → setea cookie de sesión           |
| `POST /api/auth/logout`                | todos     | borra la cookie                                       |
| `GET /api/auth/me`                     | logueado  | usuario actual                                        |
| `GET /api/sites`                       | logueado  | lugares                                               |
| `POST /api/sites`                      | admin     | `{name,lat,lng,radius}`                               |
| `DELETE /api/sites/:id`                | admin     | borra el lugar (los fichajes conservan `siteName`)    |
| `GET /api/config` · `PUT /api/config`  | logueado · admin | WhatsApp/email de avisos                       |
| `GET /api/shifts?scope=mine`           | logueado  | mi turno activo + mis últimos 5                       |
| `GET /api/shifts?scope=admin&todayStart=<ms>` | admin | activos, últimos 30 cerrados, ingresos de hoy   |
| `POST /api/shifts`                     | logueado  | check-in `{name,dni,siteId,lat,lng,acc}`; el servidor valida precisión y distancia y fija la hora; 409 si ya hay uno activo |
| `POST /api/shifts/:id/checkout`        | dueño     | `{lat?,lng?}` cierra el turno activo propio           |
| `GET/POST /api/admin/users`            | admin     | lista / crea cuentas `{email,password,name,isAdmin}`  |

## Seguridad

- Sesión: JWT HS256 (`jose`) en cookie `ml_session` httpOnly/SameSite=Lax, 7 días. `proxy.ts` solo verifica la firma;
  cada endpoint relee el usuario de la base, así un cambio de rol o un borrado aplica al instante.
- Contraseñas con bcrypt. Las cuentas se crean desde el panel admin (tarjeta "Usuarios").
- La validación de fichajes que antes hacían los triggers de Supabase está en `lib/shift-rules.ts` y en los endpoints.
- Headers de seguridad en `next.config.ts` (HSTS, nosniff, Permissions-Policy, X-Frame-Options). La CSP se aplica
  solo en producción.

## Probar desde un celular

`navigator.geolocation` exige contexto seguro: `localhost` sirve, pero por IP (`http://192.168.x.x:3000`) el navegador
bloquea la ubicación. Usá `next dev --experimental-https` o un túnel (ngrok, cloudflared).

## Legal: lo que falta completar (en `lib/legal.ts`)

- Razón social, CUIT, domicilio, email de contacto, N° de inscripción RNBD, proveedor/país de hosting, plazo de conservación.
- Inscribir la base en el RNBD de la AAIP antes de producción; notificar por escrito a cada empleado (art. 71 LCT).
- Definir el plazo de conservación y programar el borrado de fichajes viejos (p. ej. un cron que ejecute
  `delete from shifts where in_at < extract(epoch from now() - interval '2 years') * 1000`).
- Revisar todo con un abogado laboralista / de datos personales.

## Límites conocidos

- El GPS del celular puede falsearse; el servidor valida precisión, lugar y distancia pero no puede garantizar que
  las coordenadas sean reales.
- El panel se actualiza por polling cada 5 segundos (antes era realtime).
- Cualquier admin ve DNI y ubicación de todos: limitá cuántos admins hay.
