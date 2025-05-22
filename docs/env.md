# 📁 Plantilla de Variables de Entorno

Crea un archivo llamado `.env` en la raíz de tu proyecto y completa las variables con tus propios datos (¡no pongas valores de ejemplo!).

```env
# 🔗 Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=<TU_USUARIO_DB>
DB_PASSWORD=<TU_CONTRASEÑA_DB>
DB_NAME=<TU_NOMBRE_DB>
DB_SYNCHRONIZE=true         # true para desarrollo (sincroniza entidades)
DB_LOGGING=true             # true para ver consultas SQL en consola

# 📧 Servicio de correo (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465               # 465 para SSL, 587 para TLS
SMTP_SECURE=true            # true si usas 465; false si usas 587
SMTP_USER=<TU_EMAIL>        # p. ej. usuario@gmail.com
SMTP_PASS=<TU_APP_PASSWORD> # contraseña de aplicación generada en Gmail
SMTP_FROM="MiApp <usuario@gmail.com>"

# 🌐 Frontend
APP_URL=http://localhost:4200
```
