from django.db import models
from django.conf import settings

# Modelo para los indicadores del dashboard (ej.: almacenado en MongoDB)
class DashboardIndicator(models.Model):
    nombre = models.CharField(max_length=100)
    valor = models.IntegerField()

    def __str__(self):
        return f"{self.nombre}: {self.valor}"


# Modelo Proyecto (PostgreSQL)
class Proyecto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proyectos_creados",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


# Modelo Tarea (PostgreSQL)
class Tarea(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="tareas",
        null=True,
        blank=True,
    )
    asignado_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tareas_asignadas",
        null=True,
        blank=True,
    )
    estado = models.CharField(
        max_length=20,
        choices=(("todo", "To do"), ("in_progress", "In progress"), ("done", "Done")),
        default="todo",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre