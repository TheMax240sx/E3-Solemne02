import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuraciones específicas para correr Vite dentro de Docker
  server: {
    /**
     * Esto le dice a Vite que acepte conexiones desde cualquier host (IP).
     * Es OBLIGATORIO para que Docker pueda exponer el puerto.
     */
    host: true, // Equivale a '0.0.0.0'
    
    /**
     * Este es el puerto por defecto de Vite.
     * Nos aseguramos de que esté fijado aquí.
     */
    port: 5173,

    /**
     * Esto es necesario para que el "hot reload" (que la página
     * se recargue sola cuando guardas un archivo) funcione
     * correctamente dentro de un contenedor Docker.
     */
    watch: {
      usePolling: true
    },

    // Esto le dice a Vite que confíe en las peticiones que
    // vengan del host "frontend" (es decir, de nuestro proxy Apache).
    allowedHosts: ['frontend']
  }
  // ---------------------------------
})