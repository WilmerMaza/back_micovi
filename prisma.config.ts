import 'dotenv/config'; // 👈 Esto importa y carga automáticamente las variables de .env
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: process.env.DATABASE_URL || '', // 👈 Usa process.env ya cargado
  },
});
