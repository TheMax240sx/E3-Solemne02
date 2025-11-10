
FROM python:3.9-slim

# Instala postgresql-client para tener el comando "pg_isready"
RUN apt-get update && apt-get install -y postgresql-client

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar el proyecto
COPY . .