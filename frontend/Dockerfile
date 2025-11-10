# frontend/Dockerfile
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de desarrollo
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]