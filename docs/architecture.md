# Arquitectura

El proyecto sigue una arquitectura hexagonal impulsada por CQRS. Cada capa tiene dependencias dirigidas hacia adentro (interfaces → application → domain). La infraestructura implementa los puertos definidos en el dominio y se inyecta a través de módulos Nest.

```
[Interfaces REST]
      │ (DTOs + Controllers)
      ▼
[Application Layer]
      │  (Commands / Queries + Handlers)
      ▼
[Domain Layer]
      │  (Entities + Ports + Exceptions)
      ▼
[Infrastructure Layer]
      │  (Prisma, Security, Config, Modules)
```

## Capas

| Capa | Qué contiene | Reglas clave |
| --- | --- | --- |
| **Domain (`src/domain`)** | Entidades (`User`, `School`), interfaces de repositorio, servicios como `PasswordHasher` y excepciones (`InvalidCredentialsException`, `EmailAlreadyInUseException`). | No conoce NestJS ni Prisma. Solo describe contratos y reglas de negocio. |
| **Application (`src/application`)** | Commands/Queries y sus handlers. Son clases puras que orquestan puertos del dominio. | No deben depender de framework. Usan DTOs simples (`AuthenticatedUserDto`, `SchoolDto`). |
| **Infrastructure (`src/infrastructure`)** | Adaptadores secundarios: Prisma repositories, módulos Nest, seguridad, configuración y wiring. | Implementa puertos del dominio (`UserRepository`, `SchoolRepository`, `PasswordHasher`). Se agrupa en módulos como `AuthModule`, `SchoolModule`, `PersistenceModule`, `SecurityModule`. |
| **Interfaces (`src/interfaces/rest`)** | Adaptadores primarios expuestos al exterior: controllers y DTOs validados con `class-validator`. | Solo coordinan el `CommandBus`/`QueryBus`, traducen excepciones de dominio a HTTP y nunca contienen lógica de negocio. |

## Módulos principales

- **PersistenceModule**: registra `PrismaService` y los repositorios Prisma para `User` y `School`.
- **SecurityModule**: provee `PasswordHasher` basado en scrypt. Cualquier módulo que necesite hashing lo importa.
- **AuthModule**: arma el stack de autenticación (controllers REST, guard + local strategy, `LoginHandler` y dependencias).
- **SchoolModule**: expone el caso de uso de registro de instituciones (`RegisterSchoolHandler` + controller REST).

## Flujos actuales

### Login
1. `POST /auth/login` recibe `LoginDto`.
2. `LocalAuthGuard` dispara la estrategia local (`LocalStrategy`).
3. `LocalStrategy` ejecuta `LoginCommand` mediante el `CommandBus`.
4. `LoginHandler` busca al usuario (`UserRepository`) y valida la contraseña con `PasswordHasher`.
5. El handler retorna `AuthenticatedUserDto`; la estrategia lo adjunta a `req.user` y el controlador responde.

### Registro de instituciones (School)
1. `POST /schools` recibe `RegisterSchoolDto`.
2. El controller envía `RegisterSchoolCommand` al `CommandBus`.
3. `RegisterSchoolHandler` verifica unicidad del email (`UserRepository`), hashea la contraseña (`PasswordHasher`) y crea tanto el `User` como la `School` con ayuda de los repositorios Prisma.
4. Si el correo ya existe se lanza `EmailAlreadyInUseException`, traducida en la interfaz a HTTP 409.

## Consideraciones adicionales

- **Excepciones**: las capas internas lanzan excepciones de dominio. Las interfaces REST son responsables de transformarlas en excepciones HTTP de Nest.
- **Validaciones**: DTOs expuestos en REST usan `class-validator`. El resto de validaciones de negocio viven en el dominio o en la capa de aplicación.
- **Transacciones**: Los repositorios Prisma deberían envolver operaciones críticas en `this.prisma.$transaction` cuando se creen múltiples agregados dependientes.
- **Testing**: cada handler puede probarse unitariamente mockeando los puertos del dominio. Los controladores deben cubrirse con pruebas e2e o de controlador usando `@nestjs/testing`.

Para crear nuevos endpoints siguiendo esta arquitectura revisa la guía en [`docs/api-development.md`](./api-development.md).
