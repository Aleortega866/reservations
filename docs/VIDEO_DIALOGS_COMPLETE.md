# Diálogos de Gestión de Videos - Documentación Completa

## Descripción General

Este conjunto de diálogos proporciona una interfaz completa para gestionar videos en el sistema MIDER. Cada diálogo está diseñado para una función específica y se integra perfectamente con el servicio de videos existente.

## Diálogos Disponibles

### 1. EditVideoDialog - Editar Información del Video
**Archivo**: `components/admin/videos/EditVideoDialog.vue`

Permite editar la información básica del video:
- ✅ Título del video
- ✅ Descripción del contenido
- ✅ Texto alternativo para accesibilidad
- ✅ Fechas de visibilidad
- ✅ Información del archivo (solo lectura)

### 2. VideoVisibilityDialog - Configurar Visibilidad
**Archivo**: `components/admin/videos/VideoVisibilityDialog.vue`

Configura cuándo y cómo se muestra el video:
- ✅ Fechas de visibilidad (desde/hasta)
- ✅ Switch para mostrar solo una vez
- ✅ Estado actual de visibilidad
- ✅ Validación de fechas

### 3. ReplaceVideoDialog - Reemplazar Archivo de Video
**Archivo**: `components/admin/videos/ReplaceVideoDialog.vue`

Permite reemplazar el archivo de video actual:
- ✅ Selector de archivo con validación
- ✅ Vista previa del archivo seleccionado
- ✅ Opciones para mantener metadatos
- ✅ Opción para crear respaldo
- ✅ Validación de tipo y tamaño de archivo

### 4. DeleteVideoDialog - Eliminar Video
**Archivo**: `components/admin/videos/DeleteVideoDialog.vue`

Elimina el video con confirmación:
- ✅ Información del video a eliminar
- ✅ Opciones de eliminación (permanente/archivo)
- ✅ Campo de confirmación obligatorio
- ✅ Validación de confirmación

## Uso Básico

### Importar todos los diálogos

```vue
<script setup lang="ts">
import EditVideoDialog from '@/components/admin/videos/EditVideoDialog.vue'
import VideoVisibilityDialog from '@/components/admin/videos/VideoVisibilityDialog.vue'
import ReplaceVideoDialog from '@/components/admin/videos/ReplaceVideoDialog.vue'
import DeleteVideoDialog from '@/components/admin/videos/DeleteVideoDialog.vue'
import type { Video } from '@/lib/api/types'
</script>
```

### Agregar al template

```vue
<template>
    <!-- Diálogos -->
    <EditVideoDialog
        v-model:open="editDialogOpen"
        :video="selectedVideo"
        @saved="handleVideoSaved"
    />
    
    <VideoVisibilityDialog
        v-model:open="visibilityDialogOpen"
        :video="selectedVideo"
        @saved="handleVideoSaved"
    />
    
    <ReplaceVideoDialog
        v-model:open="replaceDialogOpen"
        :video="selectedVideo"
        @replaced="handleVideoReplaced"
    />
    
    <DeleteVideoDialog
        v-model:open="deleteDialogOpen"
        :video="selectedVideo"
        @deleted="handleVideoDeleted"
    />
</template>
```

### Variables reactivas

```vue
<script setup lang="ts">
import { ref } from 'vue'

// Estado de los diálogos
const editDialogOpen = ref(false)
const visibilityDialogOpen = ref(false)
const replaceDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const selectedVideo = ref<Video | null>(null)
</script>
```

### Métodos para abrir diálogos

```vue
<script setup lang="ts">
// Abrir diálogo de edición
const openEditDialog = (video: Video) => {
    selectedVideo.value = video
    editDialogOpen.value = true
}

// Abrir diálogo de visibilidad
const openVisibilityDialog = (video: Video) => {
    selectedVideo.value = video
    visibilityDialogOpen.value = true
}

// Abrir diálogo de reemplazo
const openReplaceDialog = (video: Video) => {
    selectedVideo.value = video
    replaceDialogOpen.value = true
}

// Abrir diálogo de eliminación
const openDeleteDialog = (video: Video) => {
    selectedVideo.value = video
    deleteDialogOpen.value = true
}
</script>
```

### Manejar eventos

```vue
<script setup lang="ts">
// Manejar guardado (edición y visibilidad)
const handleVideoSaved = (video: Video) => {
    editDialogOpen.value = false
    visibilityDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video guardado:', video)
}

// Manejar reemplazo
const handleVideoReplaced = (video: Video) => {
    replaceDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video reemplazado:', video)
}

// Manejar eliminación
const handleVideoDeleted = (video: Video) => {
    deleteDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video eliminado:', video)
}
</script>
```

## Props Comunes

Todos los diálogos comparten las siguientes props:

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `open` | `boolean` | Sí | Controla si el diálogo está abierto |
| `video` | `Video \| null` | Sí | El video a gestionar |

## Events por Diálogo

### EditVideoDialog
| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:open` | `boolean` | Emitido cuando cambia el estado de apertura |
| `saved` | `Video` | Emitido cuando se guarda exitosamente |

### VideoVisibilityDialog
| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:open` | `boolean` | Emitido cuando cambia el estado de apertura |
| `saved` | `Video` | Emitido cuando se guarda exitosamente |

### ReplaceVideoDialog
| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:open` | `boolean` | Emitido cuando cambia el estado de apertura |
| `replaced` | `Video` | Emitido cuando se reemplaza exitosamente |

### DeleteVideoDialog
| Event | Payload | Descripción |
|-------|---------|-------------|
| `update:open` | `boolean` | Emitido cuando cambia el estado de apertura |
| `deleted` | `Video` | Emitido cuando se elimina exitosamente |

## Características Técnicas

### Validación
- **EditVideoDialog**: Título requerido, fechas válidas
- **VideoVisibilityDialog**: Fechas requeridas, fecha "hasta" posterior a "desde"
- **ReplaceVideoDialog**: Archivo requerido, tipo de video válido, tamaño máximo 100MB
- **DeleteVideoDialog**: Confirmación obligatoria ("ELIMINAR")

### Integración con API
Todos los diálogos utilizan el composable `useVideo` para:
- Obtener métodos de actualización/eliminación
- Acceder a estados de carga
- Manejar errores de la API

### Manejo de Errores
- **Errores de validación**: Se muestran en tiempo real
- **Errores de API**: Se muestran en banners con iconos
- **Errores de red**: Se capturan y muestran de forma amigable

### Estados de Carga
- Indicadores de spinner durante operaciones
- Botones deshabilitados durante carga
- Textos dinámicos ("Guardando...", "Reemplazando...", etc.)

## Accesibilidad

Todos los diálogos incluyen:
- **Labels asociados**: Todos los campos tienen labels apropiados
- **Navegación por teclado**: Se puede navegar usando Tab
- **ARIA labels**: Atributos ARIA apropiados
- **Contraste**: Colores con suficiente contraste
- **Texto alternativo**: Campo específico para usuarios con discapacidades visuales

## Responsive Design

Los diálogos se adaptan a diferentes tamaños:
- **Desktop**: Ancho máximo de 500-600px
- **Tablet**: Se ajusta al ancho de la pantalla
- **Mobile**: Se adapta al ancho completo

## Ejemplo Completo de Integración

```vue
<template>
    <div>
        <!-- Lista de videos -->
        <div v-for="video in videos" :key="video.id" class="video-item">
            <h3>{{ video.title }}</h3>
            <div class="actions">
                <button @click="openEditDialog(video)">Editar</button>
                <button @click="openVisibilityDialog(video)">Visibilidad</button>
                <button @click="openReplaceDialog(video)">Reemplazar</button>
                <button @click="openDeleteDialog(video)">Eliminar</button>
            </div>
        </div>

        <!-- Diálogos -->
        <EditVideoDialog
            v-model:open="editDialogOpen"
            :video="selectedVideo"
            @saved="handleVideoSaved"
        />
        
        <VideoVisibilityDialog
            v-model:open="visibilityDialogOpen"
            :video="selectedVideo"
            @saved="handleVideoSaved"
        />
        
        <ReplaceVideoDialog
            v-model:open="replaceDialogOpen"
            :video="selectedVideo"
            @replaced="handleVideoReplaced"
        />
        
        <DeleteVideoDialog
            v-model:open="deleteDialogOpen"
            :video="selectedVideo"
            @deleted="handleVideoDeleted"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EditVideoDialog from '@/components/admin/videos/EditVideoDialog.vue'
import VideoVisibilityDialog from '@/components/admin/videos/VideoVisibilityDialog.vue'
import ReplaceVideoDialog from '@/components/admin/videos/ReplaceVideoDialog.vue'
import DeleteVideoDialog from '@/components/admin/videos/DeleteVideoDialog.vue'
import { useVideo } from '@/composables/useVideo'
import type { Video } from '@/lib/api/types'

const { videos } = useVideo()

// Estado de los diálogos
const editDialogOpen = ref(false)
const visibilityDialogOpen = ref(false)
const replaceDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const selectedVideo = ref<Video | null>(null)

// Métodos para abrir diálogos
const openEditDialog = (video: Video) => {
    selectedVideo.value = video
    editDialogOpen.value = true
}

const openVisibilityDialog = (video: Video) => {
    selectedVideo.value = video
    visibilityDialogOpen.value = true
}

const openReplaceDialog = (video: Video) => {
    selectedVideo.value = video
    replaceDialogOpen.value = true
}

const openDeleteDialog = (video: Video) => {
    selectedVideo.value = video
    deleteDialogOpen.value = true
}

// Manejar eventos
const handleVideoSaved = (video: Video) => {
    editDialogOpen.value = false
    visibilityDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video guardado:', video)
}

const handleVideoReplaced = (video: Video) => {
    replaceDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video reemplazado:', video)
}

const handleVideoDeleted = (video: Video) => {
    deleteDialogOpen.value = false
    selectedVideo.value = null
    console.log('Video eliminado:', video)
}
</script>
```

## Archivos Relacionados

- **Componentes**: `components/admin/videos/`
  - `EditVideoDialog.vue`
  - `VideoVisibilityDialog.vue`
  - `ReplaceVideoDialog.vue`
  - `DeleteVideoDialog.vue`
- **Composable**: `composables/useVideo.ts`
- **Servicio**: `lib/api/services/media/video.service.ts`
- **Tipos**: `lib/api/types/media/index.ts`
- **Ejemplo**: `examples/VideoDialogsExample.vue`
- **Página de ejemplo**: `pages/examples/video-dialogs.vue`

## Notas de Desarrollo

- Todos los componentes utilizan Vue 3 Composition API
- Se integran completamente con el sistema de diseño existente
- Siguen las convenciones de nomenclatura del proyecto
- Incluyen TypeScript para type safety
- Utilizan Tailwind CSS para estilos
- Son completamente responsivos y accesibles
