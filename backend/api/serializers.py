from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DashboardIndicator

# -----------------
# Serializer para el modelo User
# -----------------
# Se usará para "Crear Usuarios" y "Listar Usuarios"
class UserSerializer(serializers.ModelSerializer):
    # Hacemos que la contraseña sea de "solo escritura" (write_only)
    # para que nunca se muestre en una respuesta de la API.
    password = serializers.CharField(write_only=True, required=False)
    is_superuser = serializers.BooleanField(read_only=True)

    def create(self, validated_data):
        # Usamos create_user para que la contraseña se guarde "hasheada"
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
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
        fields = ['id', 'nombre', 'valor'] # Los campos que definimos en models.py