from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
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

# -----------------
# ViewSet para Usuarios Logeados
# -----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Endpoint simple para obtener los datos del usuario actual
    basado en el token de sesión.
    """
    # request.user es automáticamente poblado por Django
    # gracias a la cookie de sesión.
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# -----------------
# ViewSet para Login
# -----------------
@api_view(['POST'])
@permission_classes([AllowAny]) # Cualquiera puede intentar iniciar sesión
def login_view(request):
    """
    Endpoint personalizado para login que acepta JSON
    en lugar de datos de formulario.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username y password son requeridos"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Autentica al usuario contra la base de datos
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        # Inicia la sesión (esto crea la cookie de sesión)
        login(request, user)
        # Devolvemos los datos del usuario (tal como hace /api/me/)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        # Autenticación fallida
        return Response(
            {"error": "Credenciales inválidas"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

# -----------------
# ViewSet para Usuarios Logout
# -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Solo usuarios logueados pueden salir
def logout_view(request):
    """
    Endpoint para cerrar la sesión (invalida la cookie).
    """
    logout(request)
    return Response(
        {"detail": "Logout exitoso."},
        status=status.HTTP_204_NO_CONTENT
    )