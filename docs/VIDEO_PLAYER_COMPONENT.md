# Componente VideoPlayer

El componente `VideoPlayer` es un reproductor de video reutilizable y altamente configurable que puede ser usado en toda la aplicación. Está ubicado en `components/common/VideoPlayer.vue` y viene acompañado del composable `useVideoPlayer`.

## Características Principales

- **Controles personalizables**: Usa controles propios o los nativos del navegador
- **Picture-in-Picture**: Soporte para ventana flotante
- **Carga asíncrona**: Soporte para obtener videos desde APIs
- **Estado de carga**: Indicadores visuales durante la carga
- **Eventos completos**: Emite eventos para play, pause, load, error, etc.
- **Barra de progreso**: Control de progreso interactivo
- **Responsive**: Se adapta al contenedor
- **Slots personalizables**: Permite agregar controles adicionales

## Props del Componente

### Props Básicas

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `video` | `VideoData` | - | **Requerido**. Datos del video a reproducir |
| `height` | `string` | `'12rem'` | Altura del reproductor |
| `width` | `string` | `'100%'` | Ancho del reproductor |

### Props de Configuración

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `autoplay` | `boolean` | `false` | Reproducir automáticamente |
| `muted` | `boolean` | `false` | Iniciar silenciado |
| `loop` | `boolean` | `false` | Reproducir en bucle |
| `clickToToggle` | `boolean` | `true` | Hacer clic para play/pause |

### Props de UI

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `showCustomControls` | `boolean` | `true` | Mostrar controles personalizados |
| `showNativeControls` | `boolean` | `false` | Usar controles nativos del navegador |
| `showPiPButton` | `boolean` | `true` | Mostrar botón Picture-in-Picture |
| `showDuration` | `boolean` | `true` | Mostrar duración del video |
| `showProgressBar` | `boolean` | `true` | Mostrar barra de progreso |

### Props de Estado

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Estado de carga |
| `loadingText` | `string` | `'Cargando video...'` | Texto durante la carga |

### Props de Funcionalidad

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `getVideoUrl` | `(video: VideoData) => string \| Promise<string>` | - | Función para obtener la URL del video |

## Interface VideoData

```typescript
interface VideoData {
    id: string | number
    title?: string
    description?: string
    fileName?: string
    fileUrl?: string
    src?: string
    duration?: number
    [key: string]: any
}
```

## Eventos

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `play` | `(video: VideoData)` | El video empezó a reproducirse |
| `pause` | `(video: VideoData)` | El video se pausó |
| `loaded` | `(video: VideoData, duration: number)` | El video se cargó exitosamente |
| `error` | `(video: VideoData, error: Event)` | Error al cargar el video |
| `timeUpdate` | `(video: VideoData, currentTime: number, duration: number)` | Actualización del tiempo |
| `ended` | `(video: VideoData)` | El video terminó |
| `pipToggle` | `(video: VideoData, isPiP: boolean)` | Cambio en Picture-in-Picture |

## Slots

### `custom-controls`

Permite agregar controles adicionales al reproductor.

```vue
<VideoPlayer :video="video">
    <template #custom-controls="{ video }">
        <Button @click="downloadVideo(video)">
            <Download class="w-4 h-4" />
        </Button>
        <Button @click="shareVideo(video)">
            <Share class="w-4 h-4" />
        </Button>
    </template>
</VideoPlayer>
```

**Scope Props:**
- `video`: Los datos del video actual

## Ejemplos de Uso

### Uso Básico

```vue
<template>
    <VideoPlayer
        :video="{ id: 1, title: 'Mi Video', src: 'video.mp4' }"
        @play="handlePlay"
        @pause="handlePause"
    />
</template>

<script setup>
import VideoPlayer from '@/components/common/VideoPlayer.vue'

const handlePlay = (video) => {
    console.log('Reproduciendo:', video.title)
}

const handlePause = (video) => {
    console.log('Pausado:', video.title)
}
</script>
```

### Con Carga Asíncrona

```vue
<template>
    <VideoPlayer
        :video="video"
        :get-video-url="getVideoFromServer"
        :loading="isLoading"
        loading-text="Obteniendo video del servidor..."
        @loaded="handleVideoLoaded"
        @error="handleVideoError"
    />
</template>

<script setup>
import VideoPlayer from '@/components/common/VideoPlayer.vue'

const video = ref({
    id: 'video-123',
    title: 'Video del Servidor',
    fileName: 'video-file.mp4'
})

const isLoading = ref(false)

const getVideoFromServer = async (video) => {
    isLoading.value = true
    try {
        const response = await videoService.getVideoFile(video.fileName)
        return URL.createObjectURL(response.data)
    } finally {
        isLoading.value = false
    }
}

const handleVideoLoaded = (video, duration) => {
    console.log(`Video cargado: ${video.title}, duración: ${duration}s`)
}

const handleVideoError = (video, error) => {
    console.error('Error cargando video:', error)
}
</script>
```

### Con Controles Nativos

```vue
<template>
    <VideoPlayer
        :video="video"
        :show-custom-controls="false"
        :show-native-controls="true"
        :click-to-toggle="false"
        height="400px"
    />
</template>
```

### Lista de Videos

```vue
<template>
    <div class="grid grid-cols-2 gap-4">
        <div v-for="video in videos" :key="video.id">
            <h3>{{ video.title }}</h3>
            <VideoPlayer
                :video="video"
                height="200px"
                @play="pauseOtherVideos"
            />
        </div>
    </div>
</template>

<script setup>
const videos = ref([
    { id: 1, title: 'Video 1', src: 'video1.mp4' },
    { id: 2, title: 'Video 2', src: 'video2.mp4' }
])

const pauseOtherVideos = (currentVideo) => {
    // Lógica para pausar otros videos
    console.log('Pausando otros videos, reproduciendo:', currentVideo.title)
}
</script>
```

### Con Controles Personalizados

```vue
<template>
    <VideoPlayer
        :video="video"
        @play="handlePlay"
        @pause="handlePause"
    >
        <template #custom-controls="{ video }">
            <!-- Botón de descarga -->
            <Button variant="ghost" size="sm" @click="downloadVideo(video)" class="text-white">
                <Download class="w-4 h-4" />
            </Button>
            
            <!-- Botón de compartir -->
            <Button variant="ghost" size="sm" @click="shareVideo(video)" class="text-white">
                <Share class="w-4 h-4" />
            </Button>
            
            <!-- Botón de favoritos -->
            <Button variant="ghost" size="sm" @click="toggleFavorite(video)" class="text-white">
                <Heart :class="{ 'fill-red-500': video.isFavorite }" class="w-4 h-4" />
            </Button>
        </template>
    </VideoPlayer>
</template>
```

## Composable useVideoPlayer

El composable `useVideoPlayer` proporciona toda la lógica del reproductor de video y puede ser usado independientemente del componente.

### Uso del Composable

```typescript
import { useVideoPlayer } from '@/composables/useVideoPlayer'

// Configuración básica
const player = useVideoPlayer({
    useVideoService: true,
    enableCache: false
})

// Usar con un elemento de video
const initPlayer = async (videoEl: HTMLVideoElement, video: VideoData) => {
    player.videoElement.value = videoEl
    await player.loadVideo(video)
}

// Controlar el reproductor
player.playVideo()
player.pauseVideo()
player.seekTo(30) // Ir a los 30 segundos
player.togglePictureInPicture()
```

### Opciones del Composable

```typescript
interface VideoPlayerOptions {
    autoLoad?: boolean        // Cargar automáticamente
    useVideoService?: boolean // Usar servicio de video para obtener blobs
    enablePiP?: boolean      // Habilitar Picture-in-Picture
    enableCache?: boolean    // Habilitar cache de URLs
}
```

## Integración con Stores

El componente funciona perfectamente con Pinia stores:

```vue
<script setup>
import { useVideosStore } from '@/stores/videos'

const videosStore = useVideosStore()

const handleVideoPlay = (video) => {
    videosStore.updateVideoState(video.id, { isPlaying: true })
}

const handleVideoPause = (video) => {
    videosStore.updateVideoState(video.id, { isPlaying: false })
}
</script>
```

## Consideraciones de Rendimiento

1. **Limpieza de URLs**: El componente automáticamente limpia las URLs de blob cuando se desmonta
2. **Cache opcional**: Usa `enableCache: true` para cachear URLs de blob
3. **Carga bajo demanda**: Solo carga videos cuando es necesario
4. **Picture-in-Picture**: Verifica soporte antes de habilitar

## Troubleshooting

### El video no se carga

1. Verifica que la función `getVideoUrl` retorne una URL válida
2. Asegúrate de que el servidor permita CORS si es necesario
3. Revisa la consola para errores de red

### Los controles no aparecen

1. Verifica que `showCustomControls` esté en `true`
2. Asegúrate de que `showNativeControls` esté en `false`
3. Revisa que el CSS no esté ocultando los controles

### Picture-in-Picture no funciona

1. Verifica soporte del navegador con `isPictureInPictureSupported`
2. Asegúrate de que el video esté reproduciéndose
3. Algunos navegadores requieren interacción del usuario

## Migración desde el VideoList Anterior

Si tienes código usando el reproductor anterior en VideoList:

```vue
<!-- Antes -->
<video ref="videoRef" @play="handlePlay" />

<!-- Ahora -->
<VideoPlayer 
    :video="video" 
    :get-video-url="getVideoBlob"
    @play="handleVideoPlayerPlay"
/>
```

Los eventos cambian ligeramente:
- `handlePlay(id)` → `handleVideoPlayerPlay(video)`
- `handlePause(id)` → `handleVideoPlayerPause(video)`
- `handleLoaded(id)` → `handleVideoPlayerLoaded(video, duration)`
