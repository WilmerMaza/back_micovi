# ========== STAGE 1: Build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias solo del proyecto
COPY package*.json ./
COPY tsconfig*.json ./

# ⬅️ COPIAR PRISMA ANTES DE INSTALAR (por prisma generate)
COPY prisma ./prisma

RUN npm install

# Copiar el resto del código fuente y compilar
COPY . .
RUN npm run build

# ========== STAGE 2: Run ==========
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar solo archivos necesarios del build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma 

EXPOSE 3000 9229

CMD ["node", "dist/main"]
