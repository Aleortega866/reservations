# 🏛️ MIDER - Sistema de Gestión de Reservaciones

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.18.1-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.18-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

Aplicación web para gestionar reservaciones y talleres de museos, construida sobre Nuxt 3 con un enfoque modular y escalable.

## ✨ Características principales

- 🔐 Autenticación con persistencia de sesión y refresco de tokens.
- 📅 CRUD completo de reservaciones con validaciones.
- 👥 Gestión de usuarios con roles y permisos.
- 🎨 Interfaz responsive con componentes reutilizables basados en Tailwind + shadcn/vue.
- 📂 Integraciones de subida/descarga de archivos y manejo de videos.

## 🛠️ Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript.
- **Estado**: Pinia con persistencia.
- **Estilos**: Tailwind CSS 4, shadcn/vue, Lucide.
- **Formularios**: Vee-Validate + Zod.
- **Utilidades**: VueUse, Axios, TanStack Table.

## 🗂️ Estructura del proyecto

```
├── app.vue                 # Shell principal de Nuxt
├── assets/                 # Estilos y recursos estáticos
├── components/             # Componentes UI (incluye componentes shadcn)
├── composables/            # Composables reutilizables para datos y lógica
├── lib/                    # API client, validaciones y utilidades comunes
├── middleware/             # Middleware de navegación (auth, etc.)
├── pages/                  # Rutas de la aplicación
├── plugins/                # Plugins de Nuxt y configuración de librerías
├── server/                 # Endpoints y helpers del lado servidor
├── stores/                 # Stores de Pinia con persistencia
├── scripts/                # Scripts auxiliares (build/versionado)
├── public/                 # Activos públicos servidos directamente
├── nuxt.config.ts          # Configuración de Nuxt
└── tailwind.config.js      # Configuración de Tailwind
```

## ⚡ Inicio rápido

### Prerrequisitos

- Node.js 18+ (recomendado: versión LTS).
- pnpm 10+ (el proyecto fija `packageManager: pnpm@10.18.1`).
- Acceso a la API de MIDER y sus credenciales.

### Instalación

```bash
git clone <url-del-repo>
cd reservations
pnpm install
```

### Variables de entorno

El proyecto no incluye un `.env` por defecto. Crea un archivo `.env` en la raíz con las llaves que usa Nuxt (prefijo `NUXT_`).

```env
# Dirección base de la API
NUXT_PUBLIC_API_BASE_URL=https://api-mider-dev.buzzword.com.mx

# Tiempo máximo de respuesta (ms)
NUXT_PUBLIC_API_TIMEOUT=30000

# Claves de almacenamiento local
NUXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NUXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY=refresh_token

# Entorno de ejecución
NODE_ENV=development
```

### Ejecutar en desarrollo

```bash
pnpm dev
# http://localhost:3000
```

### Builds y generación

- `pnpm build`: compila para SSR.
- `pnpm preview`: sirve el build SSR localmente.
- `pnpm generate`: genera la versión estática e incrementa la versión del paquete.
- `pnpm generate:safe`: ejecuta la generación estática con captura de errores.
- `pnpm deploy`: genera un nuevo patch y ejecuta el build de producción.

## 🧭 Navegación técnica

- **Autenticación**: middleware en `middleware/` y stores en `stores/`.
- **API client**: se encuentra en `lib/api/` junto con tipos y servicios.
- **UI**: componentes base en `components/` y estilos globales en `assets/`.
- **Composables de dominio**: disponibles en `composables/` (reservaciones, usuarios, videos, etc.).

## 🤝 Contribuir

1. Crea una rama desde `main` (`git checkout -b feature/nueva-funcionalidad`).
2. Asegura que el código compile (`pnpm build` o `pnpm generate:safe`).
3. Abre un Pull Request describiendo el cambio y, si aplica, captura de pantalla.

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ por el equipo MIDER**
