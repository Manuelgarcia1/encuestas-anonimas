# 🚀 Build y Despliegue

El build de producción se realiza con:

```sh
pnpm run build
```
El despliegue se automatiza con:
```sh
pnpm run deploy
```
Esto copia los archivos generados a la carpeta pública de NGINX para servir el frontend en producción.

