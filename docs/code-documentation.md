# Convenciones de documentación en código

Esta guía define cómo documentar el proyecto para que cualquier desarrollador entienda **qué hace un archivo** y **por qué existe**, sin abrir toda la arquitectura.

## Principio

> Documenta el **propósito** y las **decisiones no obvias**. No repitas lo que el código ya dice.

## Qué documentar en cada capa

### Archivo (bloque al inicio)

Usa un comentario JSDoc o bloque `/** ... */` con:

1. **Qué es** — una línea (servicio, guard, repositorio, interceptor…)
2. **Por qué existe** — problema que resuelve o decisión de diseño
3. **Relaciones** — qué otros módulos usa o quién lo consume (opcional)
4. **Enlace** — a doc externa si aplica (`docs/auth-httpOnly-cookies.md`)

Ejemplo (backend):

```typescript
/**
 * Gestión de sesiones de autenticación (capa infraestructura).
 *
 * ¿Por qué sesiones en BD además del JWT?
 * Un JWT solo no se puede revocar hasta que expire...
 */
```

### Funciones y métodos

Documenta cuando:

- La lógica de negocio no es evidente (`revokeFamily`, `rotateRefreshToken`)
- Hay efectos secundarios (escribe cookies, revoca sesiones)
- Hay restricciones de seguridad (CSRF, rate limit)

No documentes getters triviales o mapeos obvios.

### Dominio (`src/domain`)

- Entidades: qué representan en el negocio
- Puertos (repositories): contrato sin mencionar Prisma/SQL
- Excepciones: cuándo se lanzan y qué significan para el usuario

### Aplicación (`src/application`)

- Handlers CQRS: caso de uso que implementan y pasos principales
- Commands/Queries: intención en una línea

### Infraestructura (`src/infrastructure`)

- Adaptadores: qué puerto implementan y tecnología (Prisma, Passport…)
- Guards/Strategies: qué protegen y por qué ese mecanismo
- Config: variables de entorno que leen y valores por defecto

### Interfaces (`src/interfaces`)

- Controllers: endpoints expuestos y contrato con el cliente
- DTOs: qué datos entran/salen y qué **no** incluyen (ej. sin tokens)

### Frontend (Angular)

- Services: estado que mantienen y qué **no** persisten
- Interceptors: qué header/cookie manipulan y cuándo actúan
- Guards: condición de acceso y redirección

## Idioma

- Comentarios en **español** (equipo y negocio local)
- Nombres de código en **inglés** (convención del stack)

## SQL y migraciones

Comentarios `--` al inicio explicando el propósito de la tabla y columnas críticas.

## Checklist al crear un archivo nuevo

- [ ] Bloque de propósito al inicio del archivo
- [ ] Métodos públicos con lógica de negocio documentados
- [ ] Enlace a doc de arquitectura si el módulo es complejo (auth, billing…)
- [ ] Sin comentarios obsoletos ni código comentado

## Módulos ya documentados (auth)

| Archivo | Rol |
| --- | --- |
| `infrastructure/config/cookie.config.ts` | Atributos de cookies centralizados |
| `infrastructure/auth/services/cookie-auth.service.ts` | Firmar JWT y escribir cookies |
| `infrastructure/auth/services/session-auth.service.ts` | Ciclo de vida de sesiones |
| `infrastructure/auth/persistence/.../auth-session.repository.impl.ts` | Persistencia Prisma |
| `infrastructure/auth/http/guard/csrf.guard.ts` | Protección CSRF |
| `infrastructure/auth/http/strategies/jwt.strategy.ts` | JWT desde cookie |
| `interfaces/rest/auth/controllers/auth.controller.ts` | Endpoints REST |
| `domain/auth/entities/auth-session.entity.ts` | Entidad de sesión |
| `domain/auth/repositories/auth-session.repository.ts` | Puerto de sesiones |
| `application/auth/queries/handlers/get-me.handler.ts` | Caso de uso GET /me |

Frontend (`micovi-v2`):

| Archivo | Rol |
| --- | --- |
| `core/services/auth.ts` | Estado de usuario (Signals) |
| `core/services/micovi.api.ts` | Cliente HTTP con cookies |
| `core/interceptors/refresh.interceptor.ts` | Renovación automática |
| `core/interceptors/csrf.interceptor.ts` | Header CSRF |

Guía de autenticación completa: [`auth-httpOnly-cookies.md`](auth-httpOnly-cookies.md)
