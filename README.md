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

## Endpoints

### POST /api/instituciones — Registro de institución

Registra una nueva institución deportiva con usuario administrador.

**Reglas de negocio:**
- `name` debe ser único (409 si ya existe)
- `email` debe ser único (409 si ya existe)
- `taxId` debe ser único (409 si ya existe)
- `disciplineIds` requerido — las disciplinas deben existir (404 si no)
- `categories` requerido — sin nombres duplicados (case-insensitive)
- `website` opcional con validación de URL

**Body:**
```json
{
  "name": "Mi Academia",
  "address": "Cra 45 #23-90",
  "phone": "+573001112233",
  "country": "Colombia",
  "state": "Bolívar",
  "city": "Cartagena",
  "character": "PRIVATE",
  "institutionType": "ACADEMY",
  "taxId": "901123456-7",
  "headquarters": "Sede Principal",
  "website": "https://ejemplo.com",
  "representativename": "Juan Pérez",
  "email": "admin@academia.com",
  "password": "SuperSecret123",
  "disciplineIds": ["uuid-de-una-disciplina"],
  "categories": [{ "name": "Infantil", "minAge": 6, "maxAge": 12 }]
}
```

**Respuestas:**
- `201 Created` — institución registrada con todos los datos
- `400 Bad Request` — validación de campos fallida
- `404 Not Found` — disciplina no existe
- `409 Conflict` — email, taxId o nombre duplicado

### POST /auth/login — Inicio de sesión

```json
{
  "email": "admin@academia.com",
  "password": "SuperSecret123"
}
```

## Ejecutar en local

### 1. Base de datos

Con Docker (recomendado):
```bash
docker compose -f docker/docker-compose.yml up -d db
```

Sin Docker: necesitas PostgreSQL en `localhost:5433`, usuario `postgres`, contraseña `post123`, base `micovi_db`.

### 2. Migraciones
```bash
npx prisma migrate deploy
```

### 3. Poblar disciplinas deportivas
```bash
docker exec -i micovi_db psql -U postgres -d micovi_db <<EOF
INSERT INTO "SportDiscipline" ("id", "name", "description", "createdAt", "updatedAt") VALUES
('a0000000-0000-4000-8000-000000000001', 'Fútbol', 'Deporte de equipo con balón', NOW(), NOW()),
('a0000000-0000-4000-8000-000000000002', 'Baloncesto', 'Deporte de equipo con canasta', NOW(), NOW()),
('a0000000-0000-4000-8000-000000000003', 'Tenis', 'Deporte individual de raqueta', NOW(), NOW()),
('a0000000-0000-4000-8000-000000000004', 'Natación', 'Deporte acuático individual', NOW(), NOW()),
('a0000000-0000-4000-8000-000000000005', 'Atletismo', 'Conjunto de disciplinas deportivas', NOW(), NOW()),
('a0000000-0000-4000-8000-000000000006', 'Voleibol', 'Deporte de equipo con red', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
EOF
```

### 4. Iniciar la API
```bash
npm run start:dev
```

La API estará en `http://localhost:3000`.

## Pruebas

### Tests automatizados
```bash
# Unit tests (10 tests)
npm test

# E2E tests (8 tests)
npm run test:e2e
```

### Prueba manual con curl
```powershell
curl.exe -X POST http://localhost:3000/api/instituciones ^
  -H "Content-Type: application/json" ^
  -d @- <<EOF
{
  "name": "Mi Academia",
  "address": "Cra 45 #23-90",
  "phone": "+573001112233",
  "country": "Colombia",
  "state": "Bolivar",
  "city": "Cartagena",
  "character": "PRIVATE",
  "institutionType": "ACADEMY",
  "taxId": "901123456-7",
  "headquarters": "Sede Principal",
  "website": "https://ejemplo.com",
  "representativename": "Juan Perez",
  "email": "test@test.com",
  "password": "Secret123",
  "disciplineIds": ["a0000000-0000-4000-8000-000000000001"],
  "categories": [{ "name": "Infantil", "minAge": 6, "maxAge": 12 }]
}
EOF
```

## Prácticas recomendadas
- Toda nueva funcionalidad debe partir del dominio (entidades/puertos) y exponer el caso de uso mediante commands/queries.
- Mantén las excepciones de dominio en `src/domain/**/exceptions` y tradúcelas a HTTP en la interfaz (controllers/guards/filters).
- Reutiliza módulos de infraestructura comunes (`PersistenceModule`, `SecurityModule`) y evita importar `PrismaService` o clases Nest en la capa de aplicación.
- Documenta cada flujo nuevo en `docs/` siguiendo la guía de APIs para conservar la trazabilidad técnica.










{
  "name": "Academia Deportiva Chocó 2026",
  "address": "Cra 10 #20-30",
  "phone": "+573001119999",
  "country": "Colombia",
  "state": "Chocó",
  "city": "Quibdó",
  "character": "PRIVATE",
  "institutionType": "ACADEMY",
  "taxId": "901999999-1",
  "headquarters": "Sede Norte",
  "website": "https://academiachoco2026.com",
  "representativename": "Carlos Pérez",
  "email": "academia2026@test.com",
  "password": "Secret123",
  "disciplineIds": [
    "a0000000-0000-4000-8000-000000000001"
  ],
  "categories": [
    {
      "name": "Infantil",
      "minAge": 6,
      "maxAge": 12
    }
  ]
}