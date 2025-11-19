# Back Micovi API

API para la gestión de instituciones deportivas construida con NestJS 11, Prisma y PostgreSQL. El proyecto adopta arquitectura hexagonal con CQRS para desacoplar el dominio del framework y permitir agregar nuevos flujos (commands/queries) sin romper capas existentes.

## Stack
- NestJS 11 + `@nestjs/cqrs`
- Prisma ORM + PostgreSQL
- Passport (estrategia local) + validaciones con `class-validator`
- Winston para logging y Zod para validación de variables de entorno

## Arquitectura
| Capa | Responsabilidad | Código |
| --- | --- | --- |
| **Domain** | Entidades, value objects, puertos (repositorios/servicios) y excepciones ricas en reglas de negocio. | `src/domain/*` |
| **Application** | Casos de uso via commands/queries y handlers CQRS. No dependen de Nest ni de Prisma. | `src/application/*` |
| **Infrastructure** | Adaptadores secundarios: Prisma, módulos Nest, Guards/Strategies, wiring de dependencias y servicios técnicos. | `src/infrastructure/*` |
| **Interfaces** | Adaptadores primarios expuestos al exterior (REST controllers, DTOs). Solo orquestan CommandBus/QueryBus. | `src/interfaces/rest/*` |

Flujos actuales:
- **Auth/Login**: `AuthController` → `LocalAuthGuard` → `LoginCommand` → `LoginHandler` → `UserRepository` (Prisma) + `PasswordHasher`.
- **School/Register**: `SchoolController` → `RegisterSchoolCommand` → `RegisterSchoolHandler` → `UserRepository` + `SchoolRepository`. Excepciones de dominio se traducen a HTTP 409/401 en la capa de interfaz.

Para más contexto ver [`docs/architecture.md`](docs/architecture.md) y la guía paso a paso para nuevos endpoints en [`docs/api-development.md`](docs/api-development.md).

## Estructura principal
```text
src
├── application        # Commands/queries + handlers + DTOs de casos de uso
├── domain             # Entidades, puertos y excepciones
├── infrastructure     # Prisma, módulos Nest, seguridad, persistence
├── interfaces         # Adaptadores REST (controllers + DTOs)
└── main.ts            # Bootstrap Nest (pipes, logger, filters, etc.)
```

## Comenzar
1. Copia variables de entorno y actualiza la URL de base de datos:
   ```bash
   cp .env.example .env
   ```
2. Instala dependencias y genera Prisma Client
   ```bash
   npm install
   ```
3. Ejecuta migraciones (requiere PostgreSQL accesible):
   ```bash
   npx prisma migrate dev
   ```
4. Levanta la API
   ```bash
   npm run start:dev
   ```

## Scripts clave
| Comando | Descripción |
| --- | --- |
| `npm run start:dev` | Levanta Nest con watch mode. |
| `npm run build` | Compila a `dist/`. Útil para CI. |
| `npm run test` / `test:e2e` | Ejecuta unit tests o e2e. |
| `npm run lint` | ESLint + Prettier sobre `src` y `test`. |
| `npx prisma studio` | Explora la base de datos. |

## Prácticas recomendadas
- Toda nueva funcionalidad debe partir del dominio (entidades/puertos) y exponer el caso de uso mediante commands/queries.
- Mantén las excepciones de dominio en `src/domain/**/exceptions` y tradúcelas a HTTP en la interfaz (controllers/guards/filters).
- Reutiliza módulos de infraestructura comunes (`PersistenceModule`, `SecurityModule`) y evita importar `PrismaService` o clases Nest en la capa de aplicación.
- Documenta cada flujo nuevo en `docs/` siguiendo la guía de APIs para conservar la trazabilidad técnica.
