# Endpoint: GetVideoFile

## Descripción
Este endpoint permite obtener archivos de video por su nombre de archivo. Retorna el archivo como un blob que puede ser reproducido o descargado.

## Detalles del Endpoint

### URL
```
GET /api/Video/GetVideoFile/{fileName}
```

### Parámetros de Ruta
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `fileName` | string | ✅ | Nombre del archivo de video (ej: `video.mp4`) |

### Headers Requeridos
```
Authorization: Bearer YOUR_SECRET_TOKEN
```

### Respuestas

#### 200 OK
- **Tipo**: `Blob`
- **Descripción**: Archivo de video
- **Headers**:
  - `Content-Type`: Tipo MIME del video (ej: `video/mp4`)
  - `Content-Length`: Tamaño del archivo en bytes

#### 401 Unauthorized
- **Descripción**: Token de autorización inválido o faltante

#### 404 Not Found
- **Descripción**: El archivo de video no existe

#### 500 Internal Server Error
- **Descripción**: Error interno del servidor

## Ejemplos de Uso

### Usando el Servicio de Video (Recomendado)

```typescript
import { videoService } from '@/lib/api/services/media/video.service'

// Obtener archivo de video
const result = await videoService.getVideoFile('mi-video.mp4')

if (result.success) {
  // Crear URL para el blob
  const videoUrl = URL.createObjectURL(result.data)
  
  // Usar en elemento video
  const videoElement = document.querySelector('video')
  videoElement.src = videoUrl
  
  // Descargar archivo
  const link = document.createElement('a')
  link.href = videoUrl
  link.download = 'mi-video.mp4'
  link.click()
  
  // Limpiar URL cuando ya no se necesite
  URL.revokeObjectURL(videoUrl)
} else {
  console.error('Error:', result.error)
}
```

### Usando Axios Directamente

```typescript
import axios from 'axios'

const response = await axios.get(
  'http://localhost:5137/api/Video/GetVideoFile/mi-video.mp4',
  {
    headers: {
      Authorization: 'Bearer YOUR_SECRET_TOKEN'
    },
    responseType: 'blob'
  }
)

const videoUrl = URL.createObjectURL(response.data)
```

### Usando Fetch API

```typescript
const response = await fetch(
  'http://localhost:5137/api/Video/GetVideoFile/mi-video.mp4',
  {
    headers: {
      'Authorization': 'Bearer YOUR_SECRET_TOKEN'
    }
  }
)

if (response.ok) {
  const blob = await response.blob()
  const videoUrl = URL.createObjectURL(blob)
} else {
  console.error('Error:', response.status, response.statusText)
}
```

## Implementación en Vue.js

### Componente de Ejemplo

```vue
<template>
  <div>
    <input v-model="fileName" placeholder="Nombre del archivo" />
    <button @click="getVideo">Obtener Video</button>
    
    <video v-if="videoUrl" :src="videoUrl" controls></video>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { videoService } from '@/lib/api/services/media/video.service'

const fileName = ref('')
const videoUrl = ref<string | null>(null)

const getVideo = async () => {
  const result = await videoService.getVideoFile(fileName.value)
  
  if (result.success && result.data) {
    videoUrl.value = URL.createObjectURL(result.data)
  }
}

// Limpiar URL al desmontar
onUnmounted(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})
</script>
```

## Manejo de Errores

### Tipos de Error Comunes

1. **Archivo no encontrado (404)**
   - Verificar que el nombre del archivo sea correcto
   - Asegurar que el archivo existe en el servidor

2. **No autorizado (401)**
   - Verificar que el token de autorización sea válido
   - Asegurar que el usuario tenga permisos para acceder al video

3. **Error de red**
   - Verificar la conectividad
   - Revisar la configuración del servidor

### Ejemplo de Manejo de Errores

```typescript
try {
  const result = await videoService.getVideoFile(fileName)
  
  if (result.success) {
    // Procesar video exitosamente
    const videoUrl = URL.createObjectURL(result.data)
    return videoUrl
  } else {
    // Manejar error específico
    switch (result.error) {
      case 'File not found':
        throw new Error('El archivo de video no existe')
      case 'Unauthorized':
        throw new Error('No tienes permisos para acceder a este video')
      default:
        throw new Error(`Error al obtener video: ${result.error}`)
    }
  }
} catch (error) {
  console.error('Error al obtener video:', error)
  // Mostrar mensaje de error al usuario
}
```

## Consideraciones de Rendimiento

### Optimizaciones Recomendadas

1. **Lazy Loading**: Cargar videos solo cuando sean necesarios
2. **Caché**: Implementar caché para videos frecuentemente accedidos
3. **Compresión**: Usar formatos de video optimizados
4. **CDN**: Considerar usar una CDN para videos grandes

### Ejemplo de Lazy Loading

```typescript
const loadVideo = async (fileName: string) => {
  // Mostrar loading
  const loading = ref(true)
  
  try {
    const result = await videoService.getVideoFile(fileName)
    if (result.success) {
      return URL.createObjectURL(result.data)
    }
  } finally {
    loading.value = false
  }
}
```

## Seguridad

### Consideraciones de Seguridad

1. **Autenticación**: Siempre incluir token de autorización
2. **Validación**: Validar nombres de archivo en el cliente
3. **Sanitización**: Evitar inyección de rutas
4. **Rate Limiting**: Implementar límites de velocidad en el servidor

### Ejemplo de Validación

```typescript
const validateFileName = (fileName: string): boolean => {
  // Solo permitir caracteres seguros
  const safePattern = /^[a-zA-Z0-9._-]+\.(mp4|avi|mov|wmv|flv|webm)$/i
  return safePattern.test(fileName)
}

const getVideo = async (fileName: string) => {
  if (!validateFileName(fileName)) {
    throw new Error('Nombre de archivo inválido')
  }
  
  return await videoService.getVideoFile(fileName)
}
```

## Testing

### Ejemplos de Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { videoService } from '@/lib/api/services/media/video.service'

describe('VideoService.getVideoFile', () => {
  it('should return video blob for valid filename', async () => {
    const result = await videoService.getVideoFile('test-video.mp4')
    
    expect(result.success).toBe(true)
    expect(result.data).toBeInstanceOf(Blob)
  })
  
  it('should return error for invalid filename', async () => {
    const result = await videoService.getVideoFile('invalid-file.txt')
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

## Referencias

- [API Documentation](../lib/api/services/media/video.service.ts)
- [Types](../lib/api/types/media/index.ts)
- [Example Component](../examples/GetVideoFileExample.vue)
- [Example Page](../pages/examples/get-video-file.vue)
