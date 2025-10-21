# Sistema de Loading Global - AppLoading

## 📋 Resumen

Se ha implementado un sistema completo de loading global que permite mostrar una pantalla de carga con el logo MIDE animado con efecto de pulso. Este sistema es completamente reutilizable y puede ser controlado desde cualquier parte de la aplicación.

## 📁 Archivos Creados

### Componentes
- `components/app/AppLoading.vue` - Componente principal de loading
- `components/app/AppLoadingExample.md` - Documentación detallada con ejemplos

### Composables
- `composables/ui/useAppLoading.ts` - Composable para controlar el loading globalmente

### Ejemplos y Pruebas
- `pages/test-loading.vue` - Página de prueba interactiva
- `middleware/page-loading.example.ts` - Ejemplo de middleware para cargar antes de páginas

### Documentación
- `components/app/README.md` - README actualizado con documentación
- `docs/APP_LOADING_SYSTEM.md` - Este archivo

## 🎨 Características del Componente

### AppLoading Component

#### Características Principales
- ✅ **Fullscreen**: Ocupa el 100% de la pantalla (position: fixed, inset-0)
- ✅ **Z-Index Alto**: z-index de 9999 para estar sobre todo el contenido
- ✅ **Logo Animado**: Logo MIDE con animación de pulso personalizada
- ✅ **Transiciones Suaves**: Fade in/out de 300ms
- ✅ **Modo Oscuro**: Soporte completo para dark mode
- ✅ **Customizable**: Props para controlar texto, spinner y visibilidad
- ✅ **SSR Compatible**: Funciona perfectamente con Server Side Rendering

#### Props

```typescript
interface Props {
  isVisible?: boolean      // Default: true - Controla la visibilidad
  showText?: boolean       // Default: true - Muestra el texto de carga
  loadingText?: string     // Default: 'Cargando...' - Texto personalizado
  showSpinner?: boolean    // Default: true - Muestra los puntos animados
}
```

#### Diseño Visual

```
┌────────────────────────────────────────┐
│                                        │
│                                        │
│           ┌──────────────┐             │
│           │              │             │
│           │   MIDE LOGO  │ (pulsando) │
│           │              │             │
│           └──────────────┘             │
│                                        │
│           Cargando datos...            │
│                                        │
│              • • •                     │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

## 🔧 API del Composable `useAppLoading`

### Estados (readonly)

```typescript
const {
  isLoading,     // Ref<boolean> - Estado de visibilidad
  loadingText,   // Ref<string> - Texto actual
  showText,      // Ref<boolean> - Mostrar texto
  showSpinner,   // Ref<boolean> - Mostrar spinner
} = useAppLoading()
```

### Métodos

#### `showLoading(text?, options?)`

Muestra el loading global con opciones personalizables.

```typescript
// Uso básico
showLoading()

// Con texto personalizado
showLoading('Procesando datos...')

// Con opciones
showLoading('Cargando...', {
  showText: true,
  showSpinner: false
})

// Solo logo (sin texto ni spinner)
showLoading('', {
  showText: false,
  showSpinner: false
})
```

#### `hideLoading()`

Oculta el loading global y resetea los valores por defecto.

```typescript
hideLoading()
```

#### `withLoading(fn, text?)`

Helper que ejecuta una función async mostrando el loading automáticamente.

```typescript
// Retorna el resultado de la función
const resultado = await withLoading(
  async () => {
    return await fetchData()
  },
  'Cargando datos...'
)
```

## 📖 Ejemplos de Uso

### 1. Uso Básico en un Componente

```vue
<template>
  <div>
    <button @click="cargarDatos">Cargar Datos</button>
  </div>
</template>

<script setup lang="ts">
const { showLoading, hideLoading } = useAppLoading()

const cargarDatos = async () => {
  showLoading('Cargando información...')
  
  try {
    await fetchDatosDelServidor()
  } finally {
    hideLoading()
  }
}
</script>
```

### 2. Con Helper `withLoading`

```vue
<script setup lang="ts">
const { withLoading } = useAppLoading()

const cargarDatos = async () => {
  const datos = await withLoading(
    async () => {
      return await api.getDatos()
    },
    'Procesando información...'
  )
  
  console.log(datos)
}
</script>
```

### 3. En Página con onBeforeMount

```vue
<script setup lang="ts">
const { withLoading } = useAppLoading()

onBeforeMount(async () => {
  await withLoading(
    async () => {
      await cargarRecursos()
      await validarPermisos()
    },
    'Preparando página...'
  )
})
</script>
```

### 4. Proceso de Múltiples Pasos

```vue
<script setup lang="ts">
const { showLoading, hideLoading } = useAppLoading()

const procesarReservacion = async () => {
  try {
    showLoading('Validando datos...')
    await validar()
    
    showLoading('Procesando pago...')
    await procesarPago()
    
    showLoading('Confirmando reservación...')
    await confirmar()
    
    hideLoading()
    toast.success('¡Reservación completada!')
  } catch (error) {
    hideLoading()
    toast.error('Error en el proceso')
  }
}
</script>
```

### 5. En Middleware de Navegación

```typescript
// middleware/admin-loading.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path.startsWith('/admin')) {
    const { showLoading } = useAppLoading()
    showLoading('Cargando panel de administración...')
  }
})
```

```vue
<!-- pages/admin/usuarios.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: ['admin-loading']
})

const { hideLoading } = useAppLoading()

onMounted(() => {
  hideLoading()
})
</script>
```

### 6. Solo Logo (Sin Texto ni Spinner)

```vue
<script setup lang="ts">
const { showLoading, hideLoading } = useAppLoading()

const inicializar = async () => {
  // Mostrar solo el logo pulsando
  showLoading('', {
    showText: false,
    showSpinner: false
  })
  
  await inicializarApp()
  
  hideLoading()
}
</script>
```

### 7. En un Plugin Global

```typescript
// plugins/global-loading.ts
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { showLoading, hideLoading } = useAppLoading()
  
  router.beforeEach((to, from) => {
    if (to.path !== from.path) {
      showLoading('Navegando...')
    }
  })
  
  router.afterEach(() => {
    setTimeout(() => {
      hideLoading()
    }, 500)
  })
})
```

## 🎨 Personalización

### Cambiar el Logo

Edita el componente `components/app/AppLoading.vue`:

```vue
<img
  src="/assets/tu-logo.svg"
  alt="Logo"
  class="h-32 w-auto"
/>
```

### Cambiar Colores

Modifica las clases de Tailwind en el componente:

```vue
<!-- Fondo -->
<div class="bg-white dark:bg-gray-900">

<!-- Gradiente -->
<div class="bg-gradient-to-br from-blue-50 to-indigo-50">

<!-- Texto -->
<p class="text-gray-700 dark:text-gray-300">
```

### Personalizar Animación

Edita los keyframes en la sección `<style>`:

```css
@keyframes pulse-smooth {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
```

### Cambiar Tamaño del Logo

```vue
<img
  class="h-32 w-auto md:h-40 lg:h-48"
  <!-- Cambia los valores: h-32, h-40, h-48 -->
/>
```

## 🧪 Pruebas

### Página de Prueba Interactiva

Visita `/test-loading` para ver ejemplos interactivos que incluyen:

1. **Loading Básico**: Con todas las opciones por defecto
2. **Texto Personalizado**: Con mensaje custom
3. **Solo Logo**: Sin texto ni spinner
4. **Helper withLoading**: Usando el helper async
5. **Proceso Largo**: Múltiples pasos con diferentes mensajes
6. **Sin Spinner**: Solo logo y texto

### Ejecutar Pruebas

```bash
# Iniciar servidor de desarrollo
npm run dev

# Navegar a la página de pruebas
http://localhost:3000/test-loading
```

## 📂 Estructura de Archivos

```
├── components/
│   └── app/
│       ├── AppLoading.vue                 # Componente principal
│       ├── AppLoadingExample.md           # Ejemplos detallados
│       └── README.md                      # Documentación general
├── composables/
│   ├── index.ts                           # Export del composable
│   └── ui/
│       └── useAppLoading.ts               # Composable de control
├── pages/
│   └── test-loading.vue                   # Página de pruebas
├── middleware/
│   └── page-loading.example.ts            # Ejemplo de middleware
├── app.vue                                # Integración global
└── docs/
    └── APP_LOADING_SYSTEM.md              # Este archivo
```

## 🔄 Integración en app.vue

El componente está integrado globalmente en `app.vue`:

```vue
<script setup lang="ts">
const { isLoading, loadingText, showText, showSpinner } = useAppLoading()
</script>

<template>
  <SidebarProvider>
    <!-- Contenido de la app -->
    
    <!-- Loading Global -->
    <AppLoading
      :is-visible="isLoading"
      :loading-text="loadingText"
      :show-text="showText"
      :show-spinner="showSpinner"
    />
  </SidebarProvider>
</template>
```

## 💡 Mejores Prácticas

### 1. Siempre Ocultar el Loading

Usa bloques `try-finally` para asegurar que el loading se oculte:

```typescript
try {
  showLoading()
  await operacion()
} finally {
  hideLoading()
}
```

### 2. Usa `withLoading` para Operaciones Simples

Es más limpio y seguro:

```typescript
await withLoading(async () => {
  await operacion()
}, 'Procesando...')
```

### 3. Mensajes Descriptivos

Usa mensajes claros que informen al usuario:

```typescript
// ✅ Bien
showLoading('Guardando cambios en el servidor...')

// ❌ Mal
showLoading('Espere...')
```

### 4. Duración Mínima

Para procesos muy rápidos, considera un delay mínimo:

```typescript
const [resultado] = await Promise.all([
  operacionRapida(),
  new Promise(resolve => setTimeout(resolve, 500))
])
```

### 5. Feedback al Usuario

Combina con toasts para mejor UX:

```typescript
await withLoading(
  async () => {
    await guardar()
  },
  'Guardando...'
)

toast.success('¡Guardado exitosamente!')
```

## 🐛 Troubleshooting

### El loading no se muestra

1. Verifica que `isVisible` sea `true`
2. Asegúrate de que el z-index no sea sobrescrito
3. Revisa que no haya errores en la consola

### El loading no se oculta

1. Verifica que llames a `hideLoading()`
2. Usa bloques `try-finally` para asegurar que se ejecute
3. Revisa que no haya errores que interrumpan la ejecución

### El logo no se muestra

1. Verifica que el archivo `/assets/mide-logo.svg` exista
2. Revisa la ruta del logo en el componente
3. Asegúrate de que el archivo sea accesible

## 🚀 Casos de Uso Recomendados

1. **Carga Inicial de Páginas**: Muestra el loading mientras se cargan datos
2. **Procesos Largos**: Operaciones que toman más de 1 segundo
3. **Navegación entre Páginas**: Con middleware global o específico
4. **Guardado de Datos**: Al enviar formularios o guardar cambios
5. **Procesamiento de Pagos**: Durante transacciones importantes
6. **Carga de Archivos**: Al subir documentos o imágenes
7. **Validaciones Remotas**: Consultas al servidor para validar

## 📝 Notas Técnicas

- El componente usa `useState` de Nuxt para estado global SSR-compatible
- Las transiciones son de 300ms para suavidad óptima
- Se resetean los valores por defecto después de ocultar (con 300ms de delay)
- El componente se renderiza fuera del flujo normal del DOM (fixed positioning)
- Compatible con `keepalive` de Nuxt
- No interfiere con otros overlays o modales

## 📚 Referencias

- [Nuxt 3 useState](https://nuxt.com/docs/api/composables/use-state)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)

---

**Fecha de Creación**: 2025-10-09  
**Versión**: 1.0.0  
**Autor**: Sistema de Desarrollo MIDE

