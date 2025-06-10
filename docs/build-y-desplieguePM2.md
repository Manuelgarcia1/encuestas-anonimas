# 🚀 Build y Despliegue

## Build de Producción con PM2

Para generar el build de producción, ejecuta uno de los siguientes comandos:

```sh
pnpm build
# o alternativamente
tsc -p tsconfig.build.json
```

Luego, copia la carpeta `templates` a la carpeta `dist`:

```sh
cp -r templates dist/
```

## Despliegue

El despliegue se realiza utilizando PM2. Para iniciar la aplicación, ejecuta:

```sh
pm2 start ecosystem.config.js
```

Para detener la aplicación, utiliza:

```sh
pm2 stop encuestas
```
