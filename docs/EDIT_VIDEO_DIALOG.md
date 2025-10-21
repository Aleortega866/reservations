# Diálogo de Edición de Videos

## Descripción

El componente `EditVideoDialog` permite editar la información de un video existente, incluyendo título, descripción, texto alternativo y fechas de visibilidad. Está integrado con el servicio de videos y maneja automáticamente la actualización de datos.

## Características

- ✅ **Edición de título**: Modificar el nombre del video
- ✅ **Edición de descripción**: Cambiar la descripción del contenido
- ✅ **Texto alternativo**: Agregar texto para accesibilidad
- ✅ **Fechas de visibilidad**: Configurar cuándo se muestra el video
- ✅ **Validación reactiva**: Campos requeridos y validación en tiempo real
- ✅ **Integración con API**: Guardado automático usando el servicio de videos
- ✅ **Manejo de errores**: Muestra errores de la API de forma amigable
- ✅ **Estado de carga**: Indicadores visuales durante las operaciones
- ✅ **Accesibilidad**: Soporte para lectores de pantalla y navegación por teclado
- ✅ **Responsive**: Diseño adaptativo para diferentes tamaños de pantalla

## Uso Básico

### 1. Importar el componente

```vue
<script setup lang="ts">
import EditVideoDialog from '@/components/admin/videos/EditVideoDialog.vue'
import type { Video } from '@/lib/api/types'
</script>
```

### 2. Agregar al template

```vue
<template>
    <EditVideoDialog
        v-model:open="editDialogOpen"
        :video="selectedVideo"
        @saved="handleVideoSaved"
    />
</template>
```

### 3. Variables reactivas

```vue
<script setup lang="ts">
import { ref } from 'vue'

const editDialogOpen = ref(false)
const selectedVideo = ref<Video | null>(null)
</script>
```

### 4. Método para abrir el diálogo

```vue
<script setup lang="ts">
const openEditDialog = (video: Video) => {
    selectedVideo.value = video
    editDialogOpen.value = true
}
</script>
```

### 5. Manejar el guardado

```vue
<script setup lang="ts">
const handleVideoSaved = (video: Video) => {
    editDialogOpen.value = false
    selectedVideo.value = null
    // El video ya se actualizó automáticamente en el composable
    console.log('Video guardado:', video)
}
</script>
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `open` | `boolean` | Sí | Controla si el diálogo está abierto |
| `video` | `Video \| null` | Sí | El video a editar |

## Events

| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:open` | `boolean` | Emitido cuando cambia el estado de apertura |
| `saved` | `Video` | Emitido cuando se guarda exitosamente el video |

## Estructura del Formulario

### Campos del formulario:

1. **Título del video** (requerido)
   - Tipo: `Input`
   - Validación: No puede estar vacío
   - Placeholder: "Ingresa el título del video"

2. **Descripción** (opcional)
   - Tipo: `Textarea`
   - Filas: 3
   - Placeholder: "Describe el contenido del video"

3. **Texto alternativo** (opcional)
   - Tipo: `Textarea`
   - Filas: 2
   - Placeholder: "Texto descriptivo para accesibilidad (opcional)"
   - Descripción: "Este texto ayuda a usuarios con discapacidades visuales a entender el contenido del video"

4. **Fechas de visibilidad**
   - **Visible desde**: `Input` tipo `datetime-local`
   - **Visible hasta**: `Input` tipo `datetime-local`

5. **Información del archivo** (solo lectura)
   - Nombre del archivo
   - Tamaño del archivo (formateado)

## Validación

El formulario incluye las siguientes validaciones:

- **Título**: Campo requerido, no puede estar vacío
- **Fechas**: Ambas fechas son requeridas
- **Formato de fechas**: Se valida que las fechas sean válidas
- **Lógica de fechas**: La fecha "hasta" debe ser posterior a la fecha "desde"

## Integración con el Servicio

El componente utiliza el composable `useVideo` para:

- Obtener el método `updateVideo` para actualizar el video
- Acceder al estado de `loading` para mostrar indicadores de carga
- Obtener el estado de `error` para mostrar mensajes de error

### Flujo de actualización:

1. Usuario llena el formulario
2. Se valida la información
3. Se llama a `updateVideo` con los datos actualizados
4. Si es exitoso, se emite el evento `saved`
5. Si hay error, se muestra el mensaje de error

## Manejo de Errores

El componente maneja errores de las siguientes formas:

- **Errores de validación**: Se muestran en tiempo real
- **Errores de API**: Se muestran en un banner rojo con icono
- **Errores de red**: Se capturan y muestran de forma amigable

## Accesibilidad

El componente incluye las siguientes características de accesibilidad:

- **Labels asociados**: Todos los campos tienen labels apropiados
- **Navegación por teclado**: Se puede navegar usando Tab
- **Texto alternativo**: Campo específico para usuarios con discapacidades visuales
- **ARIA labels**: Atributos ARIA apropiados en los elementos interactivos
- **Contraste**: Colores con suficiente contraste para legibilidad

## Responsive Design

El diálogo se adapta a diferentes tamaños de pantalla:

- **Desktop**: Ancho máximo de 600px
- **Tablet**: Se ajusta al ancho de la pantalla con márgenes
- **Mobile**: Se adapta al ancho completo con padding apropiado

## Ejemplo Completo

```vue
<template>
    <div>
        <!-- Lista de videos -->
        <div v-for="video in videos" :key="video.id" class="video-item">
            <h3>{{ video.title }}</h3>
            <button @click="openEditDialog(video)">
                Editar
            </button>
        </div>

        <!-- Diálogo de edición -->
        <EditVideoDialog
            v-model:open="editDialogOpen"
            :video="selectedVideo"
            @saved="handleVideoSaved"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EditVideoDialog from '@/components/admin/videos/EditVideoDialog.vue'
import { useVideo } from '@/composables/useVideo'
import type { Video } from '@/lib/api/types'

const { videos } = useVideo()

// Estado del diálogo
const editDialogOpen = ref(false)
const selectedVideo = ref<Video | null>(null)

// Abrir diálogo de edición
const openEditDialog = (video: Video) => {
    selectedVideo.value = video
    editDialogOpen.value = true
}

// Manejar guardado del video
const handleVideoSaved = (video: Video) => {
    editDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video actualizado:', video)
}
</script>
```

## Archivos Relacionados

- **Componente**: `components/admin/videos/EditVideoDialog.vue`
- **Composable**: `composables/useVideo.ts`
- **Servicio**: `lib/api/services/media/video.service.ts`
- **Tipos**: `lib/api/types/media/index.ts`
- **Ejemplo**: `examples/EditVideoDialogExample.vue`
- **Página de ejemplo**: `pages/examples/edit-video-dialog.vue`

## Notas de Desarrollo

- El componente utiliza el patrón de composición de Vue 3
- Se integra completamente con el sistema de diseño existente
- Sigue las convenciones de nomenclatura del proyecto
- Incluye TypeScript para type safety
- Utiliza Tailwind CSS para estilos
