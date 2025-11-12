-----

# E3-SOLEMNE02: Gestor de Proyectos Interno

Este repositorio contiene la solución para la **Solemne 02** de la asignatura "Especialidad 3".

El proyecto despliega una infraestructura completa y robusta para una aplicación web de gestión de proyectos, diseñada para una pequeña empresa en crecimiento. Toda la infraestructura está contenida y orquestada utilizando Docker y Docker Compose, cumpliendo con los requisitos de flexibilidad y escalabilidad.

## 🛠️ Stack Tecnológico

La solución implementa los siguientes servicios, cada uno ejecutándose en su propio contenedor:

  * **Orquestación:** Docker Compose
  * **Servidor Web / Proxy Inverso:** Apache
  * **Frontend:** React (con **Vite**)
  * **Backend:** Django (con Django REST Framework)
  * **Base de Datos Relacional:** PostgreSQL
  * **Base de Datos Documental:** MongoDB
  * **Servidor de Correo (Pruebas):** Mailhog

## 📋 Requisitos Previos

Para poder levantar esta infraestructura, solo necesitas tener instalado:

  * [Docker](https://www.docker.com/products/docker-desktop/)
  * [Docker Compose](https://docs.docker.com/compose/install/) (usualmente incluido con Docker Desktop)
  * [Git](https://git-scm.com/) (para clonar el repositorio)

## 🚀 Instalación y Despliegue

Sigue estos pasos para levantar la infraestructura completa:

1.  Clona este repositorio en tu máquina local:

    ```bash
    git clone [URL-DEl-REPOSITORIO-EN-GITHUB]
    ```

2.  Navega a la raíz del proyecto:

    ```bash
    cd E3-SOLEMNE02
    ```

3.  Levanta todos los servicios usando Docker Compose. El comando `--build` asegura que se construyan las imágenes de Vite y Django desde sus Dockerfiles por primera vez:

    ```bash
    docker-compose up --build
    ```

¡Eso es todo\! Docker se encargará de:

1.  Descargar las imágenes (Postgres, Mongo, Apache, etc.).
2.  Construir los contenedores de frontend (Vite) y backend (Django).
3.  Esperar a que la base de datos PostgreSQL esté lista (gracias al `healthcheck`).
4.  Ejecutar automáticamente las migraciones de la base de datos (`python manage.py migrate`).
5.  Iniciar todos los servicios.

> **Nota:** Para ejecutar los contenedores en segundo plano (detached mode), puedes usar `docker-compose up -d --build`.

## 🧑‍🎓 Primer Uso (¡Importante\!)

La infraestructura estará corriendo, pero la base de datos de usuarios estará vacía. Para poder probar el flujo de Login, debes crear tu primer superusuario.

1.  Abre una **nueva terminal** en la misma carpeta (`E3-SOLEMNE02`).
2.  Ejecuta el siguiente comando para crear un superusuario en el contenedor del backend:
    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```
3.  Sigue las instrucciones en pantalla (asigna un nombre de usuario, email y contraseña).

¡Listo\! Ahora puedes ir a `http://localhost/` en tu navegador e iniciar sesión con las credenciales que acabas de crear.

## 🌐 Acceso a Servicios

Una vez que los contenedores estén en ejecución, puedes acceder a los diferentes servicios:

### Acceso Web

| Servicio | URL de Acceso | Puerto (Host) |
| :--- | :--- | :--- |
| **Aplicación Web (Vía Apache)** | `http://localhost` | `80` |
| **Interfaz de Correos (Mailhog)** | `http://localhost:8025` | `8025` |
| **API Backend (Vía Apache)** | `http://localhost/api/` | `(vía 80)` |
| *(Acceso directo a Vite)* | `http://localhost:5173` | `5173` |

### Acceso a Bases de Datos (Para Navicat, DBeaver, etc.)

Para cumplir con el requisito de conexión remota segura, las bases de datos están expuestas únicamente en `127.0.0.1` (localhost de tu máquina).

| Base de Datos | Host | Puerto (en Host) | Usuario | Contraseña |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | `127.0.0.1` | `5433` | `postgres` | `supersecretpass` |
| **MongoDB** | `127.0.0.1` | `27018` | (N/A) | (N/A) |

-----

## 🧑‍💻 Integrantes del Equipo

  * Maximiliano Esteban Soto Flores
  * Bryan Kevin Molina Gonzalez
  * Bastián Alejandro Contreras Alfaro
  * Sebastián Felipe Castillo Soto
  * Diego Vicente Castillo Gaete
  * Eduardo Ignacio Herrera Varela

-----
