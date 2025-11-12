from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.core.mail import send_mail
from .models import DashboardIndicator
from .serializers import UserSerializer, DashboardIndicatorSerializer

# permiso que exige superusuario
from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """
    Permiso que sólo permite el acceso a usuarios autenticados y superusuarios.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

# -----------------
# ViewSet para los Usuarios (Registro)
# -----------------
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y crear Usuarios.
    Sólo accesible para superusuarios.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]  # <- Sólo superusuarios pueden listar/crear/editar/eliminar
    
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

# -----------------
# ViewSet para Cambio de Contraseña
# -----------------
User = get_user_model() # Obtiene el modelo de User

@api_view(['POST'])
@permission_classes([AllowAny]) # Cualquiera puede solicitar un reseteo
def password_reset_request_view(request):
    """
    Endpoint para solicitar un reseteo de contraseña (Paso 1).
    Recibe: {"email": "usuario@ejemplo.com"}
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email es requerido'}, status=status.HTTP_400_BAD_REQUEST)

    # Usamos el formulario de Django para validar el email
    form = PasswordResetForm(data=request.data)
    if form.is_valid():
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # No revelamos si el usuario existe, es una buena práctica
            return Response({'detail': 'Email de reseteo enviado (si el usuario existe).'}, status=status.HTTP_200_OK)

        # 1. Generar token y uid (versión segura de ID)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        # 2. Construir la URL del frontend
        # ¡Esta URL debe coincidir con la ruta de App.tsx!
        reset_link = f"{settings.FRONTEND_URL}/password-reset-confirm/{uidb64}/{token}"
        
        # 3. Enviar el correo
        send_mail(
            subject="Reseteo de contraseña - Gestor de Proyectos",
            message=f"Haz clic en este link para resetear tu contraseña: {reset_link}\n\nSi no solicitaste esto, ignora este email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email]
        )
        return Response({'detail': 'Email de reseteo enviado (si el usuario existe).'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Email inválido.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny]) # Cualquiera puede confirmar
def password_reset_confirm_view(request):
    """
    Endpoint para confirmar el reseteo de contraseña (Paso 2).
    Recibe: {"uidb64": "...", "token": "...", "new_password": "..."}
    """
    uidb64 = request.data.get('uidb64')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    try:
        # Decodificar el uid
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    # Validar el token
    if user is None or not default_token_generator.check_token(user, token):
        return Response({'error': 'Link inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

    # Usar el formulario de Django para validar la nueva contraseña
    form = SetPasswordForm(user, data={'new_password1': new_password, 'new_password2': new_password})
    
    if form.is_valid():
        form.save() # Guarda la nueva contraseña (y la hashea)
        return Response({'detail': 'Contraseña actualizada con éxito.'}, status=status.HTTP_200_OK)
    else:
        # El form.errors dirá si la contraseña es muy débil
        return Response({'error': form.errors}, status=status.HTTP_400_BAD_REQUEST)