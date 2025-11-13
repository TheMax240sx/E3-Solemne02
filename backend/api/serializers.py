from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DashboardIndicator, Proyecto, Tarea

# -----------------
# Serializer para el modelo User
# -----------------
class UserSerializer(serializers.ModelSerializer):
    # Hacemos que la contraseña sea de "solo escritura" (write_only)
    # para que nunca se muestre en una respuesta de la API.
    password = serializers.CharField(
        write_only=True, 
        required=False,
        allow_blank=True
        )
    is_superuser = serializers.BooleanField(read_only=True)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        # Actualizar username y email
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        # Si llega contraseña, debemos setearla correctamente (hasheada)
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)

        instance.save()
        return instance

    class Meta:
        model = User
        # Definimos los campos que la API va a usar
        fields = ['id', 'username', 'email', 'password', 'is_superuser']


# -----------------
# Serializer para los Indicadores
# -----------------
class DashboardIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardIndicator
        fields = ['id', 'nombre', 'valor']


# -----------------
# Serializers de Proyectos y Tareas
# -----------------
class ProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'creador', 'created_at']


class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'proyecto', 'asignado_a', 'estado', 'created_at']