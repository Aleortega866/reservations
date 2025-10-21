# 🏛️ MIDER - Sistema de Gestión de Reservaciones

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.18.1-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.18-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

Sistema moderno y robusto de gestión de reservaciones y talleres para museos, construido con tecnologías de vanguardia y arquitectura escalable.

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚡ Instalación Rápida](#-instalación-rápida)
- [🔧 Configuración](#-configuración)
- [📚 Guías de Uso](#-guías-de-uso)
- [🔌 API Reference](#-api-reference)
- [🎨 Componentes UI](#-componentes-ui)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🚀 Características

### ✨ Funcionalidades Principales

- 🔐 **Autenticación Completa** - Sistema JWT con refresh tokens
- 📅 **Gestión de Reservaciones** - CRUD completo con validaciones
- 👥 **Gestión de Usuarios** - Roles y permisos granulares
- ✅ **Control de Asistencia** - Check-in/check-out automático
- 📁 **Gestión de Documentos** - Subida y descarga segura
- 🎥 **Gestión de Videos** - Streaming optimizado
- 📊 **Catálogos Dinámicos** - APIs públicas para datos
- 📝 **Formularios Dinámicos** - Tipos configurables
- 🎨 **UI Moderna** - Diseño responsive y accesible
- 🔔 **Notificaciones** - Sistema de toasts y alertas

### 🎯 Características Técnicas

- ⚡ **Performance** - SSR/SSG con Nuxt 3
- 🔒 **Seguridad** - Middleware de autenticación
- 📱 **Responsive** - Mobile-first design
- ♿ **Accesibilidad** - WCAG 2.1 compliant
- 🌐 **Internacionalización** - Preparado para i18n
- 🔍 **SEO Optimizado** - Meta tags dinámicos
- 📊 **Analytics** - Integración con Google Analytics
- 🧪 **Testing** - Unit y E2E tests

## 🛠️ Stack Tecnológico

### Frontend Core
- **[Nuxt 3](https://nuxt.com/)** - Framework full-stack
- **[Vue 3](https://vuejs.org/)** - Framework de componentes
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Pinia](https://pinia.vuejs.org/)** - Gestión de estado

### UI/UX
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de utilidades
- **[Shadcn/Vue](https://www.shadcn-vue.com/)** - Componentes de diseño
- **[Lucide Vue](https://lucide.dev/)** - Iconografía
- **[Vue Sonner](https://vue-sonner.vercel.app/)** - Sistema de toasts

### Desarrollo
- **[Vite](https://vitejs.dev/)** - Bundler y dev server
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formateo de código
- **[pnpm](https://pnpm.io/)** - Gestor de paquetes

### Validación y Formularios
- **[Vee-Validate](https://vee-validate.logaretm.com/)** - Validación de formularios
- **[Zod](https://zod.dev/)** - Validación de esquemas
- **[@vee-validate/zod](https://vee-validate.logaretm.com/v4/integrations/zod/)** - Integración

### HTTP y API
- **[Axios](https://axios-http.com/)** - Cliente HTTP
- **[@tanstack/vue-table](https://tanstack.com/table/v8)** - Tablas avanzadas
- **[@vueuse/core](https://vueuse.org/)** - Composables utilitarios

## 🏗️ Arquitectura del Sistema

### Patrón de Arquitectura
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (Nuxt) │ Components (Vue) │ Layouts │ Middleware    │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Composables │ Stores (Pinia) │ Utils │ Validations       │
├─────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Services │ API Client │ Types │ Error Handling            │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  HTTP Client │ Storage │ Authentication │ External APIs    │
└─────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separación de Responsabilidades** - Cada capa tiene una responsabilidad específica
2. **Inversión de Dependencias** - Las capas superiores no dependen de las inferiores
3. **Composición sobre Herencia** - Uso extensivo de composables
4. **Inmutabilidad** - Estados reactivos inmutables
5. **Type Safety** - TypeScript en toda la aplicación

## 📁 Estructura del Proyecto

```
MIDEReservacionesFront/
├── 📁 assets/                    # Recursos estáticos
│   ├── 📁 css/                  # Estilos globales
│   └── 📁 fonts/                # Fuentes tipográficas
├── 📁 components/               # Componentes Vue
│   ├── 📁 ui/                   # Componentes base (Shadcn)
│   ├── 📁 admin/                # Componentes administrativos
│   ├── 📁 auth/                 # Componentes de autenticación
│   ├── 📁 common/               # Componentes compartidos
│   ├── 📁 profile/              # Componentes de perfil
│   ├── 📁 reservations/         # Componentes de reservaciones
│   └── 📁 workshops/            # Componentes de talleres
├── 📁 composables/              # Lógica de negocio reutilizable
│   ├── useUsers.ts              # Gestión de usuarios
│   ├── useReservation.ts        # Gestión de reservaciones
│   ├── useCost.ts               # Gestión de costos
│   ├── useVideo.ts              # Gestión de videos
│   └── ...                      # Otros composables
├── 📁 lib/                      # Librerías y utilidades
│   ├── 📁 api/                  # Sistema de API centralizado
│   │   ├── 📁 core/             # Configuración base
│   │   ├── 📁 composables/      # Composables de API
│   │   ├── 📁 services/         # Servicios de negocio
│   │   └── 📁 types/            # Tipos TypeScript
│   ├── 📁 validations/          # Esquemas de validación
│   └── utils.ts                 # Utilidades generales
├── 📁 pages/                    # Páginas de la aplicación
│   ├── 📁 admin/                # Páginas administrativas
│   ├── 📁 auth/                 # Páginas de autenticación
│   ├── 📁 reservations/         # Páginas de reservaciones
│   └── index.vue                # Página principal
├── 📁 stores/                   # Stores de Pinia
│   ├── auth.ts                  # Estado de autenticación
│   ├── videos.ts                # Estado de videos
│   └── workshops.ts             # Estado de talleres
├── 📁 middleware/               # Middleware de Nuxt
│   └── auth.ts                  # Middleware de autenticación
├── 📁 layouts/                  # Layouts de la aplicación
├── 📁 types/                    # Tipos TypeScript globales
├── 📁 docs/                     # Documentación técnica
├── nuxt.config.ts               # Configuración de Nuxt
├── tailwind.config.js           # Configuración de Tailwind
├── package.json                 # Dependencias del proyecto
└── README.md                    # Este archivo
```

## ⚡ Instalación Rápida

### Prerrequisitos

- **Node.js** 18.0.0 o superior
- **pnpm** 8.0.0 o superior
- **Git** para clonar el repositorio

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-organizacion/MIDEReservacionesFront.git
cd MIDEReservacionesFront
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias
pnpm install

# Verificar instalación
pnpm --version
node --version
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
nano .env
```

**Variables de Entorno Requeridas:**

```env
# API Configuration
NUXT_PUBLIC_API_BASE_URL=https://api-mider-dev.buzzword.com.mx
NUXT_PUBLIC_API_TIMEOUT=30000

# Authentication
NUXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NUXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY=refresh_token

# Environment
NODE_ENV=development
```

### 4. Ejecutar en Desarrollo

```bash
# Servidor de desarrollo
pnpm dev

# Abrir en navegador
open http://localhost:3000
```

### 5. Verificar Instalación

- ✅ Servidor corriendo en `http://localhost:3000`
- ✅ HMR (Hot Module Replacement) funcionando
- ✅ TypeScript sin errores
- ✅ Tailwind CSS cargado

## 🔧 Configuración

### Configuración de Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Módulos
  modules: [
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@pinia/nuxt',
    'vue-sonner/nuxt',
    '@formkit/auto-animate/nuxt',
    '@samk-dev/nuxt-vcalendar'
  ],

  // CSS global
  css: ['@/assets/css/tailwind.css'],

  // Configuración de desarrollo
  devtools: { enabled: false },
  
  // Configuración de build
  build: {
    transpile: ['@vueuse/core']
  }
})
```

### Configuración de Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores personalizada
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
}
```

### Configuración de TypeScript

```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## 📚 Guías de Uso

### 🔐 Autenticación

```typescript
// Composable de autenticación
import { useAuth } from '@/lib/api/composables/auth'

export default defineComponent({
  setup() {
    const { user, isAuthenticated, login, logout } = useAuth()

    // Login
    const handleLogin = async () => {
      try {
        await login({
          email: 'usuario@ejemplo.com',
          password: 'contraseña123'
        })
        // Redirigir después del login
        await navigateTo('/dashboard')
      } catch (error) {
        console.error('Error en login:', error)
      }
    }

    // Logout
    const handleLogout = () => {
      logout()
      navigateTo('/auth/login')
    }

    return {
      user,
      isAuthenticated,
      handleLogin,
      handleLogout
    }
  }
})
```

### 📅 Gestión de Reservaciones

```typescript
// Composable de reservaciones
import { useReservation } from '@/composables/useReservation'

export default defineComponent({
  setup() {
    const {
      reservations,
      isLoading,
      error,
      createReservation,
      updateReservation,
      deleteReservation
    } = useReservation()

    // Crear reservación
    const handleCreate = async (data: CreateReservationData) => {
      try {
        await createReservation(data)
        showSuccess('Reservación creada exitosamente')
      } catch (error) {
        showError('Error al crear reservación')
      }
    }

    // Cargar reservaciones
    onMounted(async () => {
      await loadReservations()
    })

    return {
      reservations,
      isLoading,
      error,
      handleCreate
    }
  }
})
```

### 👥 Gestión de Usuarios

```typescript
// Composable de usuarios
import { useUsers } from '@/composables/useUsers'

export default defineComponent({
  setup() {
    const {
      users,
      isLoading,
      createUser,
      updateUser,
      deleteUser
    } = useUsers()

    // Crear usuario
    const handleCreateUser = async (userData: CreateUserRequest) => {
      try {
        await createUser(userData)
        showSuccess('Usuario creado exitosamente')
      } catch (error) {
        showError('Error al crear usuario')
      }
    }

    return {
      users,
      isLoading,
      handleCreateUser
    }
  }
})
```

### 🎥 Gestión de Videos

```typescript
// Composable de videos
import { useVideo } from '@/composables/useVideo'

export default defineComponent({
  setup() {
    const {
      videos,
      uploadVideo,
      deleteVideo,
      getVideoUrl
    } = useVideo()

    // Subir video
    const handleUpload = async (file: File) => {
      try {
        await uploadVideo(file)
        showSuccess('Video subido exitosamente')
      } catch (error) {
        showError('Error al subir video')
      }
    }

    return {
      videos,
      handleUpload
    }
  }
})
```

### 🔔 Sistema de Notificaciones

```typescript
// Composable de toasts
import { useToast } from '@/composables/useToast'

export default defineComponent({
  setup() {
    const { showSuccess, showError, showInfo, showWarning } = useToast()

    // Ejemplos de uso
    const examples = {
      success: () => showSuccess('¡Éxito!', 'Operación completada'),
      error: () => showError('Error', 'Algo salió mal'),
      info: () => showInfo('Información', 'Datos actualizados'),
      warning: () => showWarning('Advertencia', 'Revisa los datos')
    }

    return { examples }
  }
})
```

## 🔌 API Reference

### Endpoints Principales

```typescript
// Configuración de API
export const API_ENDPOINTS = {
  // Autenticación
  auth: {
    signIn: '/api/Auth/SignInAsync',
    signOut: '/api/Auth/SignOutAsync',
    refresh: '/api/Auth/RefreshTokenAsync'
  },

  // Usuarios
  user: {
    getAll: '/api/Users/GetAllAsync',
    getById: '/api/Users/GetByIdAsync',
    create: '/api/Users/CreateAsync',
    update: '/api/Users/UpdateAsync',
    delete: '/api/Users/DeleteAsync'
  },

  // Reservaciones
  reservation: {
    getAll: '/api/Reservations/GetAllAsync',
    getById: '/api/Reservations/GetByIdAsync',
    create: '/api/Reservations/CreateAsync',
    update: '/api/Reservations/UpdateAsync',
    delete: '/api/Reservations/DeleteAsync'
  },

  // Videos
  video: {
    getAll: '/api/Videos/GetAllAsync',
    upload: '/api/Videos/UploadAsync',
    delete: '/api/Videos/DeleteAsync'
  }
}
```

### Uso de Composables de API

```typescript
// GET automático
import { useApiFetch, API_ENDPOINTS } from '@/lib/api'

const { data: users, pending, error } = useApiFetch(API_ENDPOINTS.user.getAll)

// POST manual
import { useApiPost } from '@/lib/api'

const { execute: createUser } = useApiPost(API_ENDPOINTS.user.create, {
  immediate: false
})

await createUser({ body: userData })
```

## 🎨 Componentes UI

### Componentes Base (Shadcn/Vue)

```vue
<!-- Botón -->
<Button variant="default" size="lg">
  Click me
</Button>

<!-- Input -->
<Input v-model="email" placeholder="Email" />

<!-- Card -->
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
</Card>

<!-- Dialog -->
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>
```

### Componentes de Negocio

```vue
<!-- Formulario de Login -->
<LoginForm @submit="handleLogin" />

<!-- Lista de Reservaciones -->
<ReservationList :reservations="reservations" />

<!-- Reproductor de Video -->
<VideoPlayer :src="videoUrl" />

<!-- Calendario -->
<CalendarField v-model="selectedDate" />
```

## 🧪 Testing

### Configuración de Tests

```bash
# Instalar dependencias de testing
pnpm add -D @nuxt/test-utils @vue/test-utils vitest

# Ejecutar tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Ejemplo de Test

```typescript
// tests/components/LoginForm.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoginForm from '@/components/auth/LoginForm.vue'

describe('LoginForm', () => {
  it('emite evento submit con datos válidos', async () => {
    const wrapper = mount(LoginForm)
    
    await wrapper.find('[data-test="email"]').setValue('test@example.com')
    await wrapper.find('[data-test="password"]').setValue('password123')
    await wrapper.find('[data-test="submit"]').trigger('click')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

## 🚀 Despliegue

### Build de Producción

```bash
# Build estático
pnpm generate

# Build SSR
pnpm build

# Preview del build
pnpm preview
```

### Variables de Entorno de Producción

```env
# Producción
NODE_ENV=production
NUXT_PUBLIC_API_BASE_URL=https://api-mider-prod.buzzword.com.mx
NUXT_PUBLIC_API_TIMEOUT=30000
```

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Despliegue en Netlify

```bash
# Build
pnpm generate

# Desplegar
netlify deploy --prod --dir=dist
```

## 🤝 Contribución

### Guía de Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código

```bash
# Linting
pnpm lint

# Formateo
pnpm format

# Type checking
pnpm type-check
```

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

### Estructura de Pull Request

- **Título descriptivo**
- **Descripción detallada**
- **Screenshots** (si aplica)
- **Tests** incluidos
- **Documentación** actualizada

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Email**: soporte@mider.com
- **Documentación**: [docs.mider.com](https://docs.mider.com)
- **Issues**: [GitHub Issues](https://github.com/tu-organizacion/MIDEReservacionesFront/issues)

## 🙏 Agradecimientos

- [Nuxt Team](https://nuxt.com/) por el framework
- [Vue Team](https://vuejs.org/) por Vue 3
- [Tailwind CSS](https://tailwindcss.com/) por el framework de CSS
- [Shadcn](https://ui.shadcn.com/) por los componentes

---

**Desarrollado con ❤️ por el equipo MIDER**

