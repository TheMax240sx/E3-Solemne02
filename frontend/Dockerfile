
# 1. Imagen base
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# 2. Instalar dependencias
# Copiamos package.json y package-lock.json
# Esto aprovecha la caché de Docker si no cambian las dependencias
COPY package*.json ./
RUN npm install

# 3. Copiar el resto del código
COPY . .

# 4. Exponer el puerto de Vite
# Vite usa el 5173
EXPOSE 5173

# 5. Comando para iniciar el servidor de Vite
# Vite usa "npm run dev"
# El 'host' y 'port' ya esta configurado en vite.config.ts
CMD ["npm", "run", "dev"]