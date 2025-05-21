# 🚀 Gestión de paquetes con pnpm

En este apartado encontrarás todo lo necesario para gestionar las dependencias del proyecto usando **pnpm**, un gestor de paquetes rápido y eficiente que aprovecha un almacén global de módulos y enlaces simbólicos para reducir el espacio en disco y mejorar la velocidad de instalación. 🎉

---

#### ⚙️ 1. ¿Por qué pnpm?

- 📦 **Eficiencia de espacio**: guarda cada paquete una única vez en un “store” global y crea enlaces simbólicos en `node_modules`.
- ⚡ **Velocidad**: instalaciones más rápidas gracias al cacheo agresivo y uso de enlaces.
- 🔒 **Determinismo**: bloqueo estricto de versiones en `pnpm-lock.yaml` garantiza reproducibilidad.
- 🧩 **Workspaces nativos**: soporte integrado para monorepositorios.

---

#### 📥 2. Instalación

Instala pnpm globalmente (requiere Node.js ≥ 16):

```bash
npm install -g pnpm
# o con Corepack (Node ≥ 16.9):
corepack enable
corepack prepare pnpm@latest --activate
```

#### 🆕 3. Inicializar un proyecto

```bash
pnpm init
```

### 🔧 4. Comandos básicos

▶️ Instalar todas las dependencias

```bash
pnpm install
```

➕ Agregar una dependencia de producción

```bash
pnpm add <paquete>
```

🛠️ Agregar una dependencia de desarrollo

```bash
pnpm add -D <paquete>
```

➖ Eliminar una dependencia

```bash
pnpm remove <paquete>
```

🔄 Actualizar paquetes

```bash
pnpm update
pnpm update <paquete>
```

📋 Listar dependencias instaladas

```bash
pnpm list --depth=0
```

⚡️ Ejecuta un script:

```bash
pnpm run start:dev
```
