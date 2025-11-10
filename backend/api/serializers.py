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
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        # Usamos create_user para que la contraseña se guarde "hasheada"
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    class Meta:
        model = User
        # Definimos los campos que la API va a usar
        fields = ['id', 'username', 'email', 'password']

# -----------------
# Serializer para los Indicadores
# -----------------
class DashboardIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardIndicator
        fields = ['id', 'nombre', 'valor'] # Los campos que definimos en models.py