# 🐳 Docker Setup para Micovi Backend

Este archivo documenta el entorno de Docker usado para el backend de Micovi con NestJS y PostgreSQL.

---

## 📁 Archivos importantes

| Archivo                       | Descripción                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `Dockerfile`                  | Imagen multietapa para compilar y ejecutar la app.                                |
| `docker-compose.yml`          | Define los servicios principales (`app`, `db`). Se usa para producción y staging. |
| `docker-compose.override.yml` | Archivo para desarrollo local. Monta el código fuente y habilita debugging.       |
| `.dockerignore`               | Excluye archivos innecesarios del contexto de build.                              |

---

## 🧪 Entorno local (Desarrollo)

1. Asegúrate de tener un archivo `.env` en la raíz del proyecto (no dentro de `docker/`)
2. Corre:

```bash
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up --build -d

```
