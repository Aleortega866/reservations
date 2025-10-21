# AppLoading - Componente de Carga Global

## Descripción
Componente de loading global que ocupa el 100% de la pantalla con un logo animado con efecto de pulso. Perfecto para mostrar antes de entrar a cualquier página o durante procesos largos.

## Características
- ✅ Ocupa el 100% de la pantalla (fullscreen)
- ✅ Z-index máximo (9999) para estar sobre todo
- ✅ Logo con animación de pulso personalizada
- ✅ Transiciones suaves de entrada/salida
- ✅ Soporte para modo oscuro
- ✅ Texto y spinner opcionales
- ✅ Control global mediante composable

## Uso Básico

### 1. Desde cualquier componente o página

```vue
<script setup lang="ts">
const { showLoading, hideLoading } = useAppLoading()

// Mostrar loading
const cargarDatos = async () => {
  showLoading('Cargando datos...')
  
  try {
    await fetchDatos()
  } finally {
    hideLoading()
  }
}
</script>
```

### 2. Usando el helper `withLoading`

```vue
<script setup lang="ts">
const { withLoading } = useAppLoading()

const cargarDatos = async () => {
  await withLoading(
    async () => {
      await fetchDatos()
    },
    'Procesando información...'
  )
}
</script>
```

### 3. En middleware de rutas

```ts
// middleware/loading.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { showLoading, hideLoading } = useAppLoading()
  
  showLoading('Cargando página...')
  
  // Simular carga
  await new Promise(resolve => setTimeout(resolve, 500))
  
  hideLoading()
})
```

### 4. Solo logo (sin texto ni spinner)

```ts
const { showLoading } = useAppLoading()

showLoading('', {
  showText: false,
  showSpinner: false
})
```

## API del Composable `useAppLoading`

### Estados (readonly)
- `isLoading` - Boolean que indica si el loading está visible
- `loadingText` - Texto actual del loading
- `showText` - Si se muestra el texto
- `showSpinner` - Si se muestra el spinner

### Métodos

#### `showLoading(text?, options?)`
Muestra el loading global.

**Parámetros:**
- `text` (string, opcional): Texto a mostrar
- `options` (objeto, opcional):
  - `showText` (boolean): Mostrar/ocultar texto
  - `showSpinner` (boolean): Mostrar/ocultar spinner

**Ejemplo:**
```ts
showLoading('Guardando cambios...', {
  showSpinner: true,
  showText: true
})
```

#### `hideLoading()`
Oculta el loading global.

**Ejemplo:**
```ts
hideLoading()
```

#### `withLoading(fn, text?)`
Ejecuta una función async mostrando el loading automáticamente.

**Parámetros:**
- `fn` (Function): Función async a ejecutar
- `text` (string, opcional): Texto del loading

**Ejemplo:**
```ts
const resultado = await withLoading(
  async () => {
    return await api.getData()
  },
  'Obteniendo datos...'
)
```

## Props del Componente `AppLoading`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isVisible` | Boolean | `true` | Controla la visibilidad |
| `showText` | Boolean | `true` | Muestra el texto de carga |
| `loadingText` | String | `'Cargando...'` | Texto personalizado |
| `showSpinner` | Boolean | `true` | Muestra los puntos animados |

## Ejemplos Avanzados

### Cargar antes de entrar a una página

```vue
<!-- pages/admin/usuarios.vue -->
<script setup lang="ts">
const { withLoading } = useAppLoading()

onBeforeMount(async () => {
  await withLoading(
    async () => {
      await cargarUsuarios()
      await cargarPermisos()
    },
    'Preparando interfaz de administración...'
  )
})
</script>
```

### Proceso de múltiples pasos

```ts
const procesarReservacion = async () => {
  const { showLoading, hideLoading } = useAppLoading()
  
  try {
    showLoading('Validando datos...')
    await validarDatos()
    
    showLoading('Procesando pago...')
    await procesarPago()
    
    showLoading('Confirmando reservación...')
    await confirmarReservacion()
    
    hideLoading()
  } catch (error) {
    hideLoading()
    // Manejar error
  }
}
```

### Uso en plugins o middleware global

```ts
// plugins/loading.ts
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { showLoading, hideLoading } = useAppLoading()
  
  router.beforeEach(() => {
    showLoading('Navegando...')
  })
  
  router.afterEach(() => {
    hideLoading()
  })
})
```

## Personalización

El componente utiliza Tailwind CSS y es totalmente personalizable. Puedes modificar:

- **Logo**: Cambia la ruta en `src="/assets/mide-logo.svg"`
- **Colores**: Modifica las clases de Tailwind en el template
- **Animación**: Ajusta los keyframes en la sección `<style>`
- **Tamaño**: Cambia las clases `h-32 md:h-40 lg:h-48`

## Notas Técnicas

- El componente se renderiza a nivel raíz en `app.vue`
- Usa `useState` de Nuxt para el estado global
- Las transiciones son suaves (300ms)
- Compatible con SSR (Server Side Rendering)
- Se resetea automáticamente después de ocultar

