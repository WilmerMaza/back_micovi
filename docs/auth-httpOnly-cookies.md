# Autenticación con Cookies HttpOnly

Guía completa de la arquitectura de autenticación de Micovi: migración desde JWT en `localStorage` hacia **Access Token + Refresh Token en cookies HttpOnly**, con sesiones en base de datos, rotación de refresh tokens, CSRF y soporte para DEV / QA / PROD.

---

## Resumen ejecutivo

| Aspecto | Decisión |
| --- | --- |
| Almacenamiento de tokens | Solo cookies HttpOnly (`micovi_access`, `micovi_refresh`) |
| Estado en el frontend | Signals con datos de usuario (id, email, role, schoolId). **Nunca tokens** |
| Sesiones | Tabla `AuthSession` en PostgreSQL; revocables por logout, admin o cambio de contraseña |
| CSRF | Double-submit cookie (`micovi_csrf` + header `X-CSRF-Token`) |
| Rutas API | Prefijo global `/api` en el backend |
| Consumo Angular | Siempre rutas relativas `/api/...` |
| DEV | Proxy Angular → `localhost:3000` (sin CORS cross-origin) |
| QA / PROD | Reverse proxy (Nginx/Traefik) enruta `/api` al backend |

---

## 1. Cambios en Angular (`micovi-v2`)

### Archivos clave

| Archivo | Responsabilidad |
| --- | --- |
| `proxy.conf.json` | Redirige `/api` → backend local en DEV |
| `src/environments/environment*.ts` | `apiUrl: '/api'` (sin URL absoluta) |
| `src/app/core/services/micovi.api.ts` | `HttpClient` con `withCredentials: true` |
| `src/app/core/services/auth.ts` | `AuthService` con Signals; sin `localStorage` de tokens |
| `src/app/core/interceptors/csrf.interceptor.ts` | Envía `X-CSRF-Token` en mutaciones |
| `src/app/core/interceptors/refresh.interceptor.ts` | Cola anti-duplicados en 401 → `/auth/refresh` |
| `src/app/core/guard/JwtGuard.ts` | Guard basado en sesión (`/auth/me`), no en JWT local |
| `src/app/app.config.ts` | `provideAppInitializer` → `bootstrapSession()` al arrancar |

### AuthService (Signals)

Al iniciar la app:

```
App bootstrap
    ↓
GET /api/auth/me (cookies enviadas automáticamente)
    ↓
Usuario en memoria (Signal) o null
    ↓
Guards e interceptors usan ese estado
```

Solo se persiste en memoria:

- `id`, `email`, `role`, `schoolId`

**Eliminado:** `localStorage`/`sessionStorage` para tokens, interceptor Bearer, `auth.interceptor.ts`, `data-token.ts`.

> **Nota:** "Recordar usuario" en login puede usar `localStorage` solo para el **email** (no para tokens ni contraseñas en texto plano).

### HttpClient

```typescript
// micovi.api.ts
this.http.get<T>(`${this.baseUrl}${path}`, { withCredentials: true })
```

`withCredentials: true` es obligatorio para que el navegador envíe cookies en peticiones cross-origin (QA/PROD) y same-origin (DEV con proxy).

### Interceptor de refresh

Flujo en error 401:

```
Petición falla (401)
    ↓
¿Ya hay refresh en curso? → Esperar cola
    ↓
POST /api/auth/refresh
    ↓
Cookies actualizadas por Set-Cookie
    ↓
Reintentar petición original
    ↓
Si refresh falla → clear() + redirect /login
```

Un `ReplaySubject` evita múltiples `POST /auth/refresh` simultáneos.

### Interceptor CSRF

En `POST`, `PUT`, `PATCH`, `DELETE` (excepto login):

1. Lee `micovi_csrf` del documento (cookie **no** HttpOnly).
2. Envía header `X-CSRF-Token` con el mismo valor.

---

## 2. Cambios en Node/NestJS (`back_micovi`)

### Stack detectado

**NestJS 11** con arquitectura hexagonal + CQRS.

### Endpoints

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Local | Valida credenciales, crea sesión, setea cookies |
| `POST` | `/api/auth/refresh` | Cookie refresh + CSRF | Rota tokens y sesión |
| `POST` | `/api/auth/logout` | JWT cookie + CSRF | Revoca sesión y limpia cookies |
| `GET` | `/api/auth/me` | JWT cookie | Perfil del usuario autenticado |
| `GET` | `/api/auth/session` | JWT cookie | Alias de `/me` para bootstrap |
| `POST` | `/api/auth/sessions/:userId/revoke-all` | Admin + CSRF | Revoca todas las sesiones de un usuario |

### Capas (Clean Architecture)

```
interfaces/rest/auth/controllers   → Adaptador HTTP
application/auth/commands|queries  → Casos de uso CQRS
domain/auth                        → Entidades, puertos
infrastructure/auth                → JWT strategy, cookies, sesiones, guards
infrastructure/persistence         → Prisma repositories
```

### Servicios principales

- **`CookieAuthService`**: firma access JWT, setea/limpia cookies.
- **`SessionAuthService`**: crea, rota y revoca sesiones en BD.
- **`JwtStrategy`**: extrae JWT de cookie `micovi_access` (no de header `Authorization`).

### Modelo de sesión (Prisma)

```prisma
model AuthSession {
  id               String    @id @default(uuid())
  userId           String
  familyId         String    // detecta reutilización de refresh
  refreshTokenHash String    @unique
  userAgent        String?
  ipAddress        String?
  expiresAt        DateTime
  revokedAt        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  user             User      @relation(...)
}
```

**Ventajas frente a JWT puro:**

| JWT puro | JWT + sesiones en BD |
| --- | --- |
| No se puede revocar hasta expirar | Logout y admin revocan al instante |
| Refresh robado sigue válido | Rotación + revocación de familia ante reutilización |
| Sin visibilidad de dispositivos activos | `userAgent`, `ipAddress`, auditoría |
| Cambio de contraseña no invalida sesiones | `revokeAllByUserId` al cambiar password |

### Seguridad aplicada

| Medida | Implementación |
| --- | --- |
| Helmet | Headers HTTP seguros en `main.ts` |
| Rate limiting | `@nestjs/throttler` global + `@Throttle` en login/refresh |
| CORS | Orígenes desde `CORS_ORIGINS`, `credentials: true` |
| CSRF | `CsrfGuard` double-submit |
| Validación | `ValidationPipe` global (whitelist) |
| Cookies | HttpOnly, Secure (QA/PROD), SameSite configurable |

---

## 3. Configuración del Proxy Angular (DEV)

### `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

### `angular.json` (serve)

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### Arranque

```bash
# Terminal 1 — Backend
cd back_micovi && npm run start:dev

# Terminal 2 — Frontend
cd micovi-v2 && ng serve
```

Angular corre en `http://localhost:4200`. Las peticiones a `/api/auth/login` las atiende el dev server de Angular, que las reenvía a `http://localhost:3000/api/auth/login`.

### Por qué el proxy elimina CORS en desarrollo

CORS aplica cuando el **origen** del documento (p. ej. `http://localhost:4200`) difiere del origen de la API (`http://localhost:3000`). Son orígenes distintos (puerto distinto = origen distinto).

Con el proxy:

1. El navegador solo habla con `localhost:4200` (mismo origen).
2. El dev server de Angular hace la petición al backend **desde Node**, no desde el navegador.
3. No hay petición cross-origin en el browser → **no se activa CORS**.

En QA/PROD no hay proxy de Angular; el reverse proxy de infraestructura cumple un rol similar unificando el origen público.

---

## 4. Configuración de Cookies

### Cookies definidas

| Cookie | HttpOnly | Path | Contenido |
| --- | --- | --- | --- |
| `micovi_access` | **Sí** | `/api` | Access JWT (10–15 min) |
| `micovi_refresh` | **Sí** | `/api/auth` | Refresh token opaco (7–30 días) |
| `micovi_csrf` | **No** | `/api` | Token CSRF (legible por JS) |

### Justificación de cada atributo

| Atributo | Valor | Por qué |
| --- | --- | --- |
| **HttpOnly** | `true` en access/refresh | Impide que JavaScript lea los tokens (mitiga XSS) |
| **HttpOnly** | `false` en CSRF | El frontend debe leer el valor para enviarlo en el header |
| **Secure** | `false` DEV, `true` QA/PROD | Solo HTTPS en ambientes expuestos; evita envío por HTTP plano |
| **SameSite** | `lax` (default) | Balance: protege CSRF en la mayoría de casos; permite navegación top-level |
| **SameSite** | `none` + Secure | Solo si frontend y API están en dominios totalmente distintos sin reverse proxy unificado |
| **Path** | `/api` y `/api/auth` | Limita el alcance; refresh solo se envía a rutas de auth |
| **MaxAge** | Según TTL env | Control de vida sin depender solo del JWT interno |
| **Expires** | Implícito vía MaxAge | Express `maxAge` establece `Expires` automáticamente |
| **Domain** | Opcional (`COOKIE_DOMAIN`) | Compartir cookies entre subdominios (p. ej. `.midominio.com`) |

### Rotación de Refresh Token

1. Cliente envía `micovi_refresh` a `POST /api/auth/refresh`.
2. Backend busca sesión por hash del token.
3. Si es válida: genera nuevo refresh, actualiza hash en BD, invalida el anterior.
4. Si se reutiliza un refresh ya rotado: **revoca toda la familia** (`familyId`) → posible robo detectado.

---

## 5. Configuración CORS

### Backend (`main.ts`)

```typescript
app.enableCors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie'],
});
```

### Reglas

- `credentials: true` en backend **y** `withCredentials: true` en Angular son obligatorios juntos.
- `CORS_ORIGINS` debe listar exactamente los orígenes del frontend (protocolo + host + puerto).
- En DEV con proxy, CORS casi no interviene; sigue siendo necesario para pruebas directas contra `:3000` o Swagger.

---

## 6. Configuración DEV

| Componente | Valor |
| --- | --- |
| Frontend | `http://localhost:4200` |
| Backend | `http://localhost:3000` |
| Angular `apiUrl` | `/api` |
| Proxy | `/api` → `localhost:3000` |
| `COOKIE_SECURE` | `false` |
| `CORS_ORIGINS` | `["http://localhost:4200","http://127.0.0.1:4200"]` |

### `.env` (backend, DEV)

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/micovi_db
JWT_SECRET=<mínimo 32 caracteres aleatorios>
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=14
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CSRF_ENABLED=true
CORS_ORIGINS=["http://localhost:4200","http://127.0.0.1:4200"]
```

---

## 7. Configuración QA

| Componente | Valor |
| --- | --- |
| Frontend | `https://qa.midominio.com` |
| Backend (interno) | `https://api.qa.midominio.com` o servicio interno |
| Angular `apiUrl` | `/api` (igual que PROD) |
| `COOKIE_SECURE` | `true` |
| `COOKIE_DOMAIN` | `.midominio.com` (si aplica) |
| `CORS_ORIGINS` | `["https://qa.midominio.com"]` |

### Reverse proxy (ejemplo Nginx)

```nginx
server {
  listen 443 ssl;
  server_name qa.midominio.com;

  location / {
    root /var/www/micovi-qa;
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://micovi-api-qa:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

El navegador ve un solo origen (`qa.midominio.com`); `/api` lo enruta el proxy al backend.

---

## 8. Configuración PROD

Idéntica a QA salvo dominios y secretos:

| Variable | PROD |
| --- | --- |
| Frontend | `https://app.midominio.com` |
| `CORS_ORIGINS` | `["https://app.midominio.com"]` |
| `COOKIE_SECURE` | `true` |
| `JWT_SECRET` | Secreto único de producción (rotación planificada) |
| `NODE_ENV` | `production` |

**No se modifica código** entre QA y PROD; solo variables de entorno e infraestructura.

---

## 9. Variables de entorno

### Backend

| Variable | Requerida | Default | Descripción |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Puerto HTTP |
| `DATABASE_URL` | Sí | — | PostgreSQL |
| `JWT_SECRET` | Sí | — | Mín. 32 caracteres |
| `ACCESS_TOKEN_TTL_MINUTES` | No | `15` | Vida del access token |
| `REFRESH_TOKEN_TTL_DAYS` | No | `14` | Vida del refresh / sesión |
| `COOKIE_SECURE` | No | `false` | `true` en QA/PROD |
| `COOKIE_SAME_SITE` | No | `lax` | `strict` \| `lax` \| `none` |
| `COOKIE_DOMAIN` | No | — | Ej. `.midominio.com` |
| `CSRF_ENABLED` | No | `true` | `false` solo para debug controlado |
| `CORS_ORIGINS` | No | localhost | JSON array de orígenes |
| `NODE_ENV` | No | `development` | Activa `Secure` automático si `production` |

### Frontend

| Archivo | `production` | `apiUrl` |
| --- | --- | --- |
| `environment.ts` | `true` | `/api` |
| `environment.development.ts` | `false` | `/api` |

**Nunca** configurar `http://localhost:3000` ni `https://api.midominio.com` en Angular.

---

## 10. Flujo de Login

```mermaid
sequenceDiagram
  participant U as Usuario
  participant A as Angular
  participant P as Proxy/Reverse Proxy
  participant B as NestJS
  participant DB as PostgreSQL

  U->>A: email + password
  A->>P: POST /api/auth/login
  P->>B: POST /api/auth/login
  B->>DB: Validar usuario
  B->>DB: Crear AuthSession
  B-->>A: Set-Cookie (access, refresh, csrf) + JSON usuario
  A->>A: AuthService.setUser()
  A->>U: Redirect dashboard
```

1. `LocalAuthGuard` valida credenciales vía `LoginHandler`.
2. `SessionAuthService.createSession()` genera refresh opaco y persiste hash.
3. `CookieAuthService.setAuthCookies()` emite las tres cookies.
4. Respuesta JSON: `{ id, email, role, schoolId }` — **sin tokens**.

---

## 11. Flujo de Refresh

```mermaid
sequenceDiagram
  participant A as Angular
  participant B as NestJS
  participant DB as PostgreSQL

  A->>B: GET /api/recurso (cookie access expirada)
  B-->>A: 401
  A->>B: POST /api/auth/refresh + CSRF header + cookie refresh
  B->>DB: Validar sesión, rotar hash
  B-->>A: Set-Cookie nuevas + JSON usuario
  A->>B: Reintento GET /api/recurso
  B-->>A: 200
```

Si el refresh es inválido o reutilizado → `401` → logout en cliente.

---

## 12. Flujo de Logout

```
POST /api/auth/logout
  + cookie access (JWT válido)
  + cookie refresh
  + X-CSRF-Token
    ↓
Revocar sesión en BD
    ↓
clearCookie(access, refresh, csrf)
    ↓
Angular: clear() + navigate /login
```

---

## 13. Flujo de recuperación de sesión (bootstrap)

Al cargar o refrescar la página:

```
provideAppInitializer
    ↓
AuthService.bootstrapSession()
    ↓
GET /api/auth/me (cookies automáticas)
    ↓
200 → setUser() | 401 → clear()
    ↓
Guards permiten o redirigen a /login
```

No hay tokens en memoria persistente del navegador; la sesión depende de las cookies HttpOnly.

---

## 14. Decisiones arquitectónicas

### ¿Por qué cookies HttpOnly y no localStorage?

- **XSS**: script malicioso no puede leer HttpOnly cookies.
- **OWASP**: almacenar tokens en `localStorage` es anti-patrón para SPAs sensibles.

### ¿Por qué access JWT + refresh opaco?

- Access JWT: stateless, rápido para autorización en cada request.
- Refresh opaco: revocable, rotable, almacenado hasheado en BD.

### ¿Por qué CSRF con cookies?

Las cookies se envían automáticamente. Un sitio malicioso podría disparar mutaciones. El patrón double-submit exige que el atacante también lea `micovi_csrf` (mitigado por SameSite + origen).

### ¿Por qué prefijo `/api` global?

- Unifica contrato con reverse proxy.
- Angular siempre usa la misma ruta relativa en todos los ambientes.
- Swagger queda en `/document` (excluido del prefijo).

### ¿Por qué path `/api/auth` para refresh?

Reduce superficie: el refresh solo se envía a endpoints bajo `/api/auth/*`.

### Cambio de contraseña (pendiente de endpoint)

Cuando exista `PATCH /users/me/password`, debe llamar:

```typescript
await this.sessionAuthService.revokeAllUserSessions(userId);
```

---

## 15. Riesgos, ventajas y mejores prácticas

### Ventajas

- Tokens inaccesibles desde JavaScript.
- Revocación inmediata de sesiones.
- Detección de robo de refresh por reutilización.
- Misma base de código en QA y PROD.
- DEV sin fricción CORS gracias al proxy.

### Riesgos residuales

| Riesgo | Mitigación |
| --- | --- |
| XSS en el frontend | HttpOnly + CSP (Helmet) + sanitización Angular |
| CSRF | SameSite + double-submit + validación Origin |
| Robo de refresh | Rotación, revocación de familia, TTL corto de access |
| Session fixation | Nuevo `familyId` en cada login |
| Brute force login | Rate limiting (`@Throttle`) |

### Mejores prácticas operativas

1. Rotar `JWT_SECRET` con plan de invalidación de sesiones.
2. Monitorear intentos de refresh fallidos (posible ataque).
3. Listar sesiones activas por usuario (extensión futura sobre `AuthSession`).
4. Usar HTTPS obligatorio en QA/PROD (`COOKIE_SECURE=true`).
5. No desactivar `CSRF_ENABLED` fuera de tests automatizados.
6. Aplicar migración: `npx prisma migrate deploy`.

### Comandos útiles

```bash
# Backend
cd back_micovi
npm install
npx prisma migrate deploy
npm run start:dev

# Frontend
cd micovi-v2
ng serve

# Probar login (curl, sin proxy)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"escuela@test.com","password":"Test12345"}'

curl -b cookies.txt http://localhost:3000/api/auth/me
```

---

## Archivos eliminados (código legacy)

### Backend
- `src/infrastructure/auth/services/auth.service.ts` (JWT en body)
- `src/interfaces/rest/auth/dtos/login-response.dto.ts`

### Frontend
- `src/app/core/interceptors/auth.interceptor.ts` (Bearer)
- `src/app/view/pages/auth/models/data-token.ts`

---

## Referencias en el repositorio

- Configuración cookies: `src/infrastructure/config/cookie.config.ts`
- Controlador auth: `src/interfaces/rest/auth/controllers/auth.controller.ts`
- Migración sesiones: `prisma/migrations/20260701120000_add_auth_sessions/`
- Proxy Angular: `micovi-v2/proxy.conf.json`
