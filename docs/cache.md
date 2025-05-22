# 📑 Caché Local

Implementamos **node-cache** para almacenar en memoria las respuestas de encuestas y **reducir el tiempo de respuesta** en solicitudes GET.

- **TTL**: 60 segundos
- **Servicio**: `LocalCacheService` guarda resultados frecuentes en memoria, disminuyendo la carga en la base de datos y acelerando las encuestas.
