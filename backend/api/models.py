from django.db import models
from django.contrib.auth.models import User

# -----------------
# Modelo para los Indicadores del Dashboard (esqueleto aun)
# -----------------
# Este modelo SÍ se guardará en MongoDB, como lo pide la solemne.

class DashboardIndicator(models.Model):
    # Definimos los campos que tendrán los indicadores
    nombre = models.CharField(max_length=100)
    valor = models.IntegerField()
    # 'djongo' crea un _id automáticamente
        
    def __str__(self):
        return f"{self.nombre}: {self.valor}"
