from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import DashboardIndicator
from .serializers import UserSerializer, DashboardIndicatorSerializer

# -----------------
# ViewSet para los Usuarios (Registro)
# -----------------
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y crear Usuarios.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    # (Opcional) Puedes añadir permisos, ej: permissions.IsAdminUser
    
# -----------------
# ViewSet para los Indicadores del Dashboard
# -----------------
class DashboardIndicatorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite LEER (GET) los indicadores del dashboard.
    Usamos ReadOnly para que no se puedan crear/borrar desde la API.
    """
    # Le decimos que lea desde la base de datos 'mongo'
    queryset = DashboardIndicator.objects.using('mongo').all()
    serializer_class = DashboardIndicatorSerializer