from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import get_current_user, login_view, logout_view, password_reset_request_view, password_reset_confirm_view

# Creamos un router de DRF
router = DefaultRouter()
# Registramos nuestros ViewSets con el router
# Esto crea las rutas: /users/ (para GET, POST) y /users/<pk>/ (para GET, PUT, DELETE)
router.register(r'users', views.UserViewSet)
router.register(r'dashboard-stats', views.DashboardIndicatorViewSet)

urlpatterns = [
    # 1. Rutas de nuestros ViewSets ( /users/, /dashboard-stats/ )
    path('', include(router.urls)),
    
    # 2. Ruta de Perfil ( /me/ )
    path('me/', get_current_user, name='get_current_user'),

    # 3. Rutas de Autenticación Personalizadas
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('password-reset/', password_reset_request_view, name='password_reset_request'),
    path('password-reset-confirm/', password_reset_confirm_view, name='password_reset_confirm'),
]