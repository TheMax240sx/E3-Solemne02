from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Proyecto, Tarea

"""
Signals simples como placeholders. Evitan errores de importación
y se pueden ampliar según la lógica de la app.
"""

@receiver(post_save, sender=Proyecto)
def proyecto_post_save(sender, instance, created, **kwargs):
    # Placeholder: ejecutar lógica al crear/actualizar un Proyecto
    if created:
        print(f"Proyecto creado: {instance.pk} - {instance.name}")

@receiver(post_save, sender=Tarea)
def tarea_post_save(sender, instance, created, **kwargs):
    # Placeholder: ejecutar lógica al crear/actualizar una Tarea
    if created:
        print(f"Tarea creada: {instance.pk} - {instance.title}")