# Servicio de Video - Documentación Completa

## 📋 **Descripción General**

El servicio de video proporciona una interfaz completa para gestionar videos en el sistema MIDEReservaciones. Incluye operaciones CRUD completas, duplicación de videos, control de visibilidad y descarga de archivos de video.

## 🚀 **Características Principales**

- ✅ **Operaciones CRUD completas** para videos
- ✅ **Subida de videos** con FormData
- ✅ **Duplicación de videos** existentes
- ✅ **Control de visibilidad** con fechas de inicio y fin
- ✅ **Descarga de archivos** de video
- ✅ **Estados reactivos** automáticos
- ✅ **Integración con autenticación** automática
- ✅ **Manejo de errores** mejorado
- ✅ **Tipos TypeScript** completos
- ✅ **Composables reactivos** para Vue 3

## 📁 **Estructura del Servicio**

```
lib/api/services/media/
├── video.service.ts    # Servicio principal con clase
└── index.ts           # Exportaciones del módulo

lib/api/types/media/
└── index.ts          # Tipos TypeScript para video

composables/
└── useVideo.ts       # Composable reactivo para Vue 3

examples/
└── VideoServiceExample.vue  # Ejemplo de uso completo
```

## 🔧 **Configuración de Endpoints**

Los endpoints están configurados en `lib/api/core/config.ts`:

```typescript
export const API_ENDPOINTS = {
  video: {
    getAll: '/api/Video/GetAllVideosAsync',
    getById: '/api/Video/GetVideoAsync',
    upload: '/api/Video/UploadVideoAsync',
    update: '/api/Video/UpdateVideoAsync',
    delete: '/api/Video/DeleteVideoAsync',
    duplicate: '/api/Video/DuplicateVideoAsync',
    toggleVisibility: '/api/Video/ToggleVisibilityVideoAsync',
    getVideoFile: '/api/Video/GetVideoFile'
  }
}
```

## 📖 **Tipos TypeScript**

### **Entidad Principal**

```typescript
export interface Video {
  id: number
  title: string
  description: string
  visibleFrom: string
  visibleTo: string
  videoFile: string
  userModifiedId: number
  fileName: string
}
```

### **Requests**

```typescript
// Subir video
export interface UploadVideoRequest {
  title: string
  description: string
  visibleFrom: string
  visibleTo: string
  videoFile: string
  userModifiedId: number
  fileName: string
}

// Actualizar video
export interface UpdateVideoRequest {
  id: number
  title: string
  description: string
  visibleFrom: string
  visibleTo: string
  videoFile: string
  userModifiedId: number
  fileName: string
}

// Eliminar video
export interface DeleteVideoRequest {
  ids: number[]
  confirm: boolean
  userModifiedId: number
}

// Duplicar video
export interface DuplicateVideoRequest {
  id: number
  userModifiedId: number
}

// Alternar visibilidad
export interface ToggleVisibilityVideoRequest {
  id: number
  isVisible: boolean
  userModifiedId: number
}
```

## 🔄 **Operaciones Disponibles**

### **Servicio de Video (VideoService)**

| Operación | Método | Endpoint | Descripción |
|-----------|--------|----------|-------------|
| `getAllVideos(filters?)` | GET | `/api/Video/GetAllVideosAsync` | Obtener todos los videos |
| `getVideoById(id)` | GET | `/api/Video/GetVideoAsync` | Obtener video por ID |
| `uploadVideo(data)` | POST | `/api/Video/UploadVideoAsync` | Subir nuevo video |
| `updateVideo(data)` | PUT | `/api/Video/UpdateVideoAsync` | Actualizar video |
| `deleteVideo(data)` | DELETE | `/api/Video/DeleteVideoAsync` | Eliminar video(s) |
| `duplicateVideo(data)` | POST | `/api/Video/DuplicateVideoAsync` | Duplicar video |
| `toggleVisibility(data)` | PUT | `/api/Video/ToggleVisibilityVideoAsync` | Alternar visibilidad |
| `getVideoFile(fileName)` | GET | `/api/Video/GetVideoFile/{fileName}` | Obtener archivo de video |

### **Composable de Video (useVideo)**

| Operación | Descripción |
|-----------|-------------|
| `fetchVideos(filters?)` | Obtener todos los videos |
| `fetchVideoById(id)` | Obtener video específico |
| `uploadVideo(data)` | Subir nuevo video |
| `updateVideo(data)` | Actualizar video existente |
| `deleteVideo(data)` | Eliminar video(s) |
| `duplicateVideo(data)` | Duplicar video |
| `toggleVisibility(data)` | Alternar visibilidad |
| `searchVideosByTitle(title)` | Buscar por título |
| `getVideoById(id)` | Obtener video desde lista local |
| `clearState()` | Limpiar estado del composable |

## 💻 **Ejemplo de Uso**

### **Uso del Composable**

```typescript
import { useVideo } from '@/composables/useVideo'
import type { UploadVideoRequest } from '@/lib/api/types'

// En un componente Vue
const {
  videos,
  currentVideo,
  loading,
  error,
  fetchVideos,
  uploadVideo,
  deleteVideo
} = useVideo()

// Cargar videos
await fetchVideos()

// Subir nuevo video
const uploadData: UploadVideoRequest = {
  title: 'Video de bienvenida',
  description: 'Video introductorio al MIDE',
  visibleFrom: '2024-01-01T00:00:00Z',
  visibleTo: '2024-12-31T23:59:59Z',
  videoFile: 'video.mp4',
  userModifiedId: 1,
  fileName: 'bienvenida.mp4'
}

const success = await uploadVideo(uploadData)

// Eliminar video
const deleteSuccess = await deleteVideo({
  ids: [1],
  confirm: true,
  userModifiedId: 1
})
```

### **Uso Directo del Servicio**

```typescript
import { videoService } from '@/lib/api/services'

// Obtener todos los videos
const videos = await videoService.getAllVideos()

// Obtener video específico
const video = await videoService.getVideoById(1)

// Duplicar video
const duplicated = await videoService.duplicateVideo({
  id: 1,
  userModifiedId: 1
})

// Obtener archivo de video
const fileResponse = await videoService.getVideoFile('video.mp4')
if (fileResponse.success && fileResponse.data) {
  // Crear URL para el blob
  const url = URL.createObjectURL(fileResponse.data)
  // Usar la URL para reproducir el video
}
```

## 🎯 **Casos de Uso Comunes**

### **1. Lista de Videos con Búsqueda**

```typescript
const { videos, loading, fetchVideos, searchVideosByTitle } = useVideo()

// Cargar todos los videos
await fetchVideos()

// Buscar por título
await searchVideosByTitle('bienvenida')
```

### **2. Subida de Video con Validación**

```typescript
const { uploadVideo, loading } = useVideo()

const handleUpload = async (formData: UploadVideoRequest) => {
  // Validar fechas
  if (new Date(formData.visibleFrom) >= new Date(formData.visibleTo)) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
  }
  
  const success = await uploadVideo(formData)
  if (success) {
    // Mostrar mensaje de éxito
  }
}
```

### **3. Reproducción de Video**

```typescript
const { getVideoFile } = useVideo()

const playVideo = async (fileName: string) => {
  const response = await videoService.getVideoFile(fileName)
  if (response.success && response.data) {
    const videoUrl = URL.createObjectURL(response.data)
    // Usar videoUrl en un elemento <video>
  }
}
```

### **4. Gestión de Visibilidad**

```typescript
const { toggleVisibility } = useVideo()

const handleToggleVisibility = async (videoId: number, isVisible: boolean) => {
  const success = await toggleVisibility({
    id: videoId,
    isVisible,
    userModifiedId: 1
  })
  
  if (success) {
    // Actualizar UI
  }
}
```

## 🔧 **Configuración Avanzada**

### **Filtros de Búsqueda**

```typescript
// Filtrar por ID
await fetchVideos({ id: 1 })

// Filtrar por título
await fetchVideos({ title: 'bienvenida' })
```

### **Manejo de Errores**

```typescript
const { error, fetchVideos } = useVideo()

try {
  await fetchVideos()
} catch (err) {
  console.error('Error al cargar videos:', err)
  // Mostrar mensaje de error al usuario
}

// O usar el estado de error del composable
if (error.value) {
  // Mostrar error
}
```

## 📱 **Integración con Componentes Vue**

### **Componente de Lista de Videos**

```vue
<template>
  <div>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="video in videos" :key="video.id">
        <h3>{{ video.title }}</h3>
        <p>{{ video.description }}</p>
        <button @click="playVideo(video)">Reproducir</button>
        <button @click="deleteVideo(video)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVideo } from '@/composables/useVideo'

const { videos, loading, error, fetchVideos, deleteVideo } = useVideo()

onMounted(() => {
  fetchVideos()
})
</script>
```

## 🚨 **Consideraciones Importantes**

1. **Autenticación**: Todos los endpoints requieren autenticación Bearer token
2. **FormData**: Los endpoints de subida y actualización usan `multipart/form-data`
3. **Fechas**: Las fechas deben estar en formato ISO 8601 (RFC 3339)
4. **Archivos**: Los archivos de video se manejan como strings (URLs o base64)
5. **userModifiedId**: Siempre debe ser el ID del usuario autenticado

## 🔗 **Enlaces Relacionados**

- [Ejemplo de Uso Completo](./examples/VideoServiceExample.vue)
- [Página de Ejemplo](./pages/examples/video-service.vue)
- [Tipos TypeScript](./lib/api/types/media/index.ts)
- [Servicio de Video](./lib/api/services/media/video.service.ts)
- [Composable de Video](./composables/useVideo.ts)
