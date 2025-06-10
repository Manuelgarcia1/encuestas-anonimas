# 🌐 Proxy y CORS en Desarrollo

Para facilitar el desarrollo local y evitar problemas de CORS, se utiliza un archivo de configuración de proxy (`proxy.conf.json`) que redirige las peticiones API al backend NestJS.

Ejemplo de uso en `package.json`:
```json
"start": "ng serve --proxy-config src/proxy.conf.json"
