from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.core.mail import send_mail
from django.db import models

from django.contrib.auth.models import User
from .models import DashboardIndicator, Proyecto, Tarea
from .serializers import (
    UserSerializer,
    DashboardIndicatorSerializer,
    ProyectoSerializer,
    TareaSerializer,
)

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


# -----------------
# ViewSet para los Indicadores del Dashboard
# -----------------
class DashboardIndicatorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite LEER (GET) los indicadores del dashboard.
    """
    queryset = DashboardIndicator.objects.using('mongo').all()
    serializer_class = DashboardIndicatorSerializer


# -----------------
# Endpoint para obtener el usuario actual
# -----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# -----------------
# Login / Logout
# -----------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username y password son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logout exitoso."}, status=status.HTTP_204_NO_CONTENT)


# -----------------
# Reseteo de contraseña
# -----------------
User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email es requerido'}, status=status.HTTP_400_BAD_REQUEST)

    form = PasswordResetForm(data=request.data)
    if form.is_valid():
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Email de reseteo enviado (si el usuario existe).'}, status=status.HTTP_200_OK)

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/password-reset-confirm/{uidb64}/{token}"

        send_mail(
            subject="Reseteo de contraseña - Gestor de Proyectos",
            message=f"Haz clic en este link para resetear tu contraseña: {reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email]
        )
        return Response({'detail': 'Email de reseteo enviado (si el usuario existe).'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Email inválido.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    uidb64 = request.data.get('uidb64')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is None or not default_token_generator.check_token(user, token):
        return Response({'error': 'Link inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

    form = SetPasswordForm(user, data={'new_password1': new_password, 'new_password2': new_password})
    if form.is_valid():
        form.save()
        return Response({'detail': 'Contraseña actualizada con éxito.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': form.errors}, status=status.HTTP_400_BAD_REQUEST)


# -----------------
# ViewSets para Proyectos y Tareas
# -----------------
class ProyectoViewSet(viewsets.ModelViewSet):
    """
    CRUD para Proyectos.
    """
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Proyecto.objects.all()
        return Proyecto.objects.filter(creador=user)

    def perform_create(self, serializer):
        serializer.save(creador=self.request.user)


class TareaViewSet(viewsets.ModelViewSet):
    """
    CRUD para Tareas.
    """
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Tarea.objects.all()
        return Tarea.objects.filter(
            models.Q(proyecto__creador=user) | models.Q(asignado_a=user)
        ).distinct()