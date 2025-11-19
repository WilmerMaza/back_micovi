# Guía para crear un nuevo API / Caso de uso

El flujo recomendado para agregar cualquier endpoint o proceso sigue la arquitectura hexagonal. Esta guía resume los pasos y checklists mínimos.

## 1. Diseña el dominio
1. Identifica el agregado principal y sus límites.
2. Crea o actualiza las entidades y value objects dentro de `src/domain/<context>/entities`.
3. Define los puertos necesarios (repositorios, servicios) bajo `src/domain/<context>/repositories|services`.
4. Modela excepciones específicas (`src/domain/<context>/exceptions`) para los errores controlados.

> Regla: nada en el dominio debe importar NestJS, Prisma o librerías de infraestructura.

## 2. Capa de aplicación (CQRS)
1. Define un `Command` (o `Query`) en `src/application/<context>/<commands|queries>`.
2. Implementa el handler en `src/application/<context>/<commands|queries>/handlers`.
3. Inyecta únicamente puertos del dominio (repositorios, servicios, unit of work). No uses `PrismaService` directo.
4. Devuelve DTOs planos (`src/application/<context>/dto`) que representen lo que expondrás a otra capa.
5. Lanza excepciones de dominio cuando una regla de negocio se viole.

Checklist:
- [ ] No usas `@nestjs/*` dentro del handler.
- [ ] Validas reglas complejas en el handler o dominio, no en el controller.

## 3. Infraestructura (adaptadores secundarios)
1. Implementa los puertos usando Prisma u otra tecnología (`src/infrastructure/<context>/persistence`).
2. Expón estos adaptadores vía módulos reutilizables (`PersistenceModule`, `SecurityModule`, etc.).
3. Si necesitas transacciones, utiliza `PrismaService.$transaction` dentro del adaptador para agrupar operaciones.
4. Evita que los adapters exporten entidades de Prisma directamente; mapea siempre a las entidades de dominio.

## 4. Interfaces REST (adaptadores primarios)
1. Crea los DTOs expuestos (`src/interfaces/rest/<context>/dtos`). Aplica decoradores de `class-validator`.
2. Implementa el controller (`src/interfaces/rest/<context>/controllers`). La lógica debe limitarse a:
   - Validar vía pipes globales (ya configurados).
   - Ejecutar `CommandBus`/`QueryBus`.
   - Traducir excepciones de dominio a `HttpException` (por ejemplo, `EmailAlreadyInUseException` → `ConflictException`).
3. Define guards/strategies específicos de HTTP dentro de `src/interfaces/rest` o módulos especializados (como `LocalAuthGuard`).

## 5. Wiring (Módulos Nest)
1. Crea/actualiza un módulo en `src/infrastructure/<context>/<context>.module.ts`.
2. Importa los módulos compartidos necesarios (`CqrsModule`, `PersistenceModule`, `SecurityModule`, etc.).
3. Registra controllers, handlers y providers. Usa `useClass`/`useExisting` para enlazar puertos con implementaciones.
4. Asegúrate de importar el nuevo módulo en `AppModule` (u otro módulo raíz) para exponer el endpoint.

## 6. Pruebas
- **Unitarias**: prueban handlers aislados mockeando repositorios/servicios.
- **Integración/e2e**: validan controllers y pipelines completos usando el `TestingModule`.
- **Migraciones**: si agregas tablas/campos, genera migraciones Prisma (`npx prisma migrate dev --name <name>`).

## 7. Documentación
1. Actualiza `docs/architecture.md` si añadiste flujos relevantes.
2. Documenta el nuevo endpoint (payload, comandos involucrados, dependencias) en un README dentro de `docs/` o en una sección nueva.
3. Si el endpoint requiere pasos específicos para su uso, enlaza la documentación desde el README principal.

## Checklist rápido antes de abrir PR
- [ ] Entidades/puertos creados o actualizados en `src/domain`.
- [ ] Command/Query + handler implementados sin dependencias de framework.
- [ ] Adaptadores Prisma (u otros) mapean datos al dominio.
- [ ] Controller expone el endpoint y traduce excepciones.
- [ ] Módulo Nest registra el flujo completo.
- [ ] Pruebas básicas y `npm run build` pasan.
- [ ] Documentación actualizada (`README`, `docs/*`).

Seguir esta guía garantiza que cada nueva API respete la arquitectura hexagonal, mantenga el desacoplamiento entre capas y reduzca el costo de mantenimiento a largo plazo.
