from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Creamos un router de DRF
router = DefaultRouter()
# Registramos nuestros ViewSets con el router
# Esto crea las rutas: /users/ (para GET, POST) y /users/<pk>/ (para GET, PUT, DELETE)
router.register(r'users', views.UserViewSet)
router.register(r'dashboard-stats', views.DashboardIndicatorViewSet)

# -----------------
# Login y Reseteo de Contraseña
# -----------------
# Para cumplir el requisito de "Login" y "Restauración de contraseña",
# la forma más fácil es usar las vistas que DRF ya trae.
# Estas líneas crean los endpoints:
# /api/auth/login/
# /api/auth/logout/
# /api/auth/password/reset/
# /api/auth/password/reset/confirm/
# ...y más.

urlpatterns = [
    # 1. Rutas de nuestros ViewSets
    path('', include(router.urls)),
    
    # 2. Rutas de autenticación (Login, Logout, Password Reset)
    path('auth/', include('rest_framework.urls', namespace='rest_framework'))
]