# 🧪 Guía de Pruebas del Proyecto Backend

Este directorio contiene todos los niveles de pruebas automatizadas del backend. Las pruebas están organizadas para garantizar que cada parte del sistema — desde funciones individuales hasta flujos completos — funcione correctamente y sea mantenible a largo plazo.

---

## 📁 Estructura de Carpetas

```
test/
├── unit/           # Pruebas unitarias
├── integracion/    # Pruebas de integración
├── e2e/            # Pruebas end-to-end (extremo a extremo)
└── README.md       # Esta guía
```

---

## 🔬 Pruebas Unitarias (`unit/`)

**¿Qué testean?** Funciones y clases de forma aislada, sin dependencias reales.

- ✅ Usan mocks (falsos servicios/repositorios)
- ⚡ Muy rápidas de ejecutar
- ❌ No acceden a la base de datos ni hacen llamadas HTTP reales

**Ejemplo:**

```ts
describe('AuthService', () => {
  it('debe retornar un token válido', () => {
    const result = authService.login({ email, password });
    expect(result.token).toBeDefined();
  });
});
```

📂 Ubicación: test/unit/\*.spec.ts

## 🔗 Pruebas de Integración (integracion/)

**¿Qué testean?** Que varios módulos, controladores y servicios trabajen bien juntos.

- ✅ Pueden usar base de datos real o mockeada

- ✅ Útiles para validar flujos reales (crear entidad, relacionarla, etc.)

- ⏳ Más lentas que las unitarias

**Ejemplo:**

```ts
describe('InstitutionModule', () => {
  it('crea una institución en la base de datos', async () => {
    const institution = await institutionService.create({ name: 'Academia Pro' });
    expect(institution.id).toBeDefined();
  });
});
```

📂 Ubicación: test/integracion/\*.spec.ts

## 🌐 Pruebas End-to-End (e2e/)

**¿Qué testean?** Todo el flujo de una API desde el punto de vista de un cliente (ej. HTTP).

- ✅ Simulan peticiones reales (usando supertest)

- ✅ Arrancan toda la app NestJS (NestFactory)

- 🧪 Útiles para validar rutas, seguridad, validaciones

- 🐢 Las más lentas, pero las más completas

**Ejemplo:**

```ts
it('/auth/login (POST)', () => {
  return request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(200);
});
```

📂 Ubicación: test/e2e/\*.e2e-spec.ts

## 🚀 Comandos de Prueba

Asegúrate de tener estos scripts en tu package.json:

```json
"scripts": {
  "test": "jest",
  "test:unit": "jest test/unit",
  "test:integration": "jest test/integracion",
  "test:e2e": "jest --config test/jest-e2e.json",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

## Comando ¿Qué hace?

Corre todas las pruebas

```bash
 npm run test
```

Solo pruebas unitarias (test/unit)

```bash
npm run test:unit
```

Solo pruebas de integración

```bash
npm run test:integration
```

Pruebas extremo a extremo (test/e2e)

```bash
npm run test:e2e
```

Muestra cobertura de pruebas

```bash
npm run test:cov
```

## 🧠 Buenas prácticas

- ✅ Escribe pruebas pequeñas y con intención clara

- ✅ Usa mocks para pruebas unitarias

- ⚠️ Usa pruebas E2E solo en escenarios críticos (registro, login, pagos)

- 🔄 Ejecuta las pruebas en cada commit (ideal: CI/CD con GitHub Actions)
