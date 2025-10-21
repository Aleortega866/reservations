<template>
    <div class="relative overflow-hidden rounded-3xl">
        <div class="w-full bg-black rounded-3xl overflow-hidden"
            :style="{ height: height, width: width }">
            
            <!-- Estado de carga -->
            <div v-if="isLoading"
                class="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div class="flex flex-col items-center space-y-2">
                    <div class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
                        role="status" aria-label="loading">
                        <span class="sr-only text-sm text-muted-foreground">Cargando video...</span>
                    </div>
                    <span class="text-white text-sm">{{ loadingText }}</span>
                </div>
            </div>

            <!-- Elemento de video -->
            <video 
                ref="videoElement"
                class="w-full h-full object-cover" 
                :autoplay="autoplay && !isInitialLoad"
                :muted="muted"
                :loop="loop"
                :controls="showNativeControls"
                preload="metadata"
                @click="handleVideoClick"
                @play="handleVideoPlay"
                @pause="handleVideoPause"
                @loadeddata="handleVideoLoaded"
                @error="handleVideoError"
                @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleMetadataLoaded">
            </video>

            <!-- Overlay con botón de reproducción (solo si no usa controles nativos) -->
            <div v-if="!isPlaying && !isLoading && !showNativeControls"
                class="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                @click="playVideo">
                <div class="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Icon icon="lucide:play" width="32" height="32" class="text-white ml-1" />
                </div>
            </div>

            <!-- Controles personalizados del video -->
            <div v-if="!isLoading && showCustomControls && !showNativeControls"
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <!-- Botón Play/Pause -->
                        <Button variant="ghost" size="sm"
                            @click="togglePlayPause" 
                            class="text-white">
                            <Icon v-if="!isPlaying" icon="lucide:play" width="16" height="16" />
                            <Icon v-else icon="lucide:pause" width="16" height="16" />
                        </Button>
                        
                        <!-- Botón Picture-in-Picture -->
                        <Button v-if="showPiPButton && isPictureInPictureSupported" 
                            variant="ghost" 
                            size="sm"
                            @click="togglePictureInPicture"
                            class="text-white"
                            :title="isPiP ? 'Salir de ventana flotante' : 'Minimizar a ventana flotante'">
                            <Icon v-if="!isPiP" icon="lucide:minimize-2" width="16" height="16" />
                            <Icon v-else icon="lucide:maximize-2" width="16" height="16" />
                        </Button>

                        <!-- Botones adicionales personalizados -->
                        <slot name="custom-controls" :video="videoData" />
                    </div>
                    
                    <!-- Duración del video -->
                    <div class="flex items-center space-x-2">
                        <span v-if="showDuration" class="text-xs text-white">
                            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                        </span>
                        <span v-else-if="duration > 0" class="text-xs text-white">
                            {{ formatTime(duration) }}
                        </span>
                    </div>
                </div>
                
                <!-- Barra de progreso -->
                <div v-if="showProgressBar" class="mt-2">
                    <div class="w-full bg-white/20 rounded-full h-1 cursor-pointer"
                        @click="handleProgressClick">
                        <div class="bg-white rounded-full h-1 transition-all duration-100"
                            :style="{ width: progressPercentage + '%' }">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

interface VideoData {
    id?: string | number
    title?: string
    src?: string
    fileName?: string
    duration?: number
    [key: string]: any
}

interface Props {
    // Datos del video
    video: VideoData
    
    // Configuración del reproductor
    height?: string
    width?: string
    autoplay?: boolean
    muted?: boolean
    loop?: boolean
    
    // Controles de UI
    showCustomControls?: boolean
    showNativeControls?: boolean
    showPiPButton?: boolean
    showDuration?: boolean
    showProgressBar?: boolean
    
    // Estados
    loading?: boolean
    loadingText?: string
    
    // Configuración de comportamiento
    clickToToggle?: boolean
    
    // Función para obtener la URL del video
    getVideoUrl?: (video: VideoData) => string | Promise<string>
}

const props = withDefaults(defineProps<Props>(), {
    height: '12rem', // 48 en Tailwind = 12rem
    width: '100%',
    autoplay: false,
    muted: false,
    loop: false,
    showCustomControls: true,
    showNativeControls: false,
    showPiPButton: true,
    showDuration: true,
    showProgressBar: true,
    loading: false,
    loadingText: 'Cargando video...',
    clickToToggle: true
})

const emit = defineEmits<{
    play: [video: VideoData]
    pause: [video: VideoData]
    loaded: [video: VideoData, duration: number]
    error: [video: VideoData, error: Event]
    timeUpdate: [video: VideoData, currentTime: number, duration: number]
    ended: [video: VideoData]
    pipToggle: [video: VideoData, isPiP: boolean]
}>()

// Referencias
const videoElement = ref<HTMLVideoElement>()

// Estado del reproductor
const isLoading = ref(props.loading)
const isPlaying = ref(false)
const isPiP = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isPictureInPictureSupported = ref(false)

// Datos del video computados
const videoData = computed(() => props.video)

// Progreso del video
const progressPercentage = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
})

// Estado para controlar carga única
const isVideoLoaded = ref(false)
const lastVideoId = ref<string | number | null>(null)
const isInitialLoad = ref(true)

// Watchers
watch(() => props.loading, (newValue: boolean) => {
    isLoading.value = newValue
})

watch(() => props.video, async (newVideo: VideoData) => {
    if (newVideo && videoElement.value) {
        // Solo cargar si es un video diferente
        if (newVideo.id !== lastVideoId.value) {
            isVideoLoaded.value = false
            lastVideoId.value = newVideo.id || null
            await loadVideo()
        }
    }
}, { immediate: false })

// Métodos del reproductor
const loadVideo = async () => {
    if (!videoElement.value || !props.video || isVideoLoaded.value) return
    
    try {
        isLoading.value = true
        
        console.log('🎬 Cargando video:', props.video.title || props.video.fileName)
        
        let videoUrl = ''
        
        if (props.getVideoUrl) {
            videoUrl = await props.getVideoUrl(props.video)
        } else if (props.video.src) {
            videoUrl = props.video.src
        } else if (props.video.fileName) {
            // URL de fallback si no se proporciona getVideoUrl
            videoUrl = `/api/videos/${props.video.fileName}`
        }
        
        if (videoUrl && videoElement.value) {
            // Verificar si ya tiene la misma URL para evitar recargas innecesarias
            if (videoElement.value.src !== videoUrl) {
                videoElement.value.src = videoUrl
                videoElement.value.load()
                isVideoLoaded.value = true
                console.log('✅ Video URL establecida:', videoUrl)
            } else {
                console.log('ℹ️ Video ya cargado, omitiendo recarga')
                isLoading.value = false
            }
        }
    } catch (error) {
        console.error('❌ Error loading video:', error)
        isVideoLoaded.value = false
        handleVideoError(error as Event)
    }
}

const playVideo = () => {
    if (videoElement.value) {
        videoElement.value.play()
    }
}

const pauseVideo = () => {
    if (videoElement.value) {
        videoElement.value.pause()
    }
}

const togglePlayPause = () => {
    if (videoElement.value) {
        if (videoElement.value.paused) {
            playVideo()
        } else {
            pauseVideo()
        }
    }
}

const togglePictureInPicture = async () => {
    if (!videoElement.value || !isPictureInPictureSupported.value) return
    
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture()
            isPiP.value = false
        } else {
            await videoElement.value.requestPictureInPicture()
            isPiP.value = true
        }
        emit('pipToggle', props.video, isPiP.value)
    } catch (error) {
        console.error('Error toggling Picture-in-Picture:', error)
    }
}

// Event handlers
const handleVideoClick = () => {
    if (props.clickToToggle && !props.showNativeControls) {
        togglePlayPause()
    }
}

const handleVideoPlay = () => {
    isPlaying.value = true
    emit('play', props.video)
}

const handleVideoPause = () => {
    isPlaying.value = false
    emit('pause', props.video)
}

const handleVideoLoaded = () => {
    isLoading.value = false
    isInitialLoad.value = false
    if (videoElement.value) {
        duration.value = videoElement.value.duration || 0
        emit('loaded', props.video, duration.value)
    }
}

const handleVideoError = (error: Event) => {
    isLoading.value = false
    console.error('Video error:', error)
    emit('error', props.video, error)
}

const handleTimeUpdate = () => {
    if (videoElement.value) {
        currentTime.value = videoElement.value.currentTime
        emit('timeUpdate', props.video, currentTime.value, duration.value)
    }
}

const handleMetadataLoaded = () => {
    if (videoElement.value) {
        duration.value = videoElement.value.duration || 0
    }
}

const handleProgressClick = (event: MouseEvent) => {
    if (!videoElement.value || duration.value === 0) return
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    const newTime = percent * duration.value
    
    videoElement.value.currentTime = newTime
    currentTime.value = newTime
}

// Utility functions
const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Picture-in-Picture event listeners
const handleEnterPiP = () => {
    isPiP.value = true
    emit('pipToggle', props.video, true)
}

const handleLeavePiP = () => {
    isPiP.value = false
    emit('pipToggle', props.video, false)
}

// Lifecycle
onMounted(async () => {
    // Verificar soporte de Picture-in-Picture
    isPictureInPictureSupported.value = 
        document.pictureInPictureEnabled ||
        (document as any).webkitSupportsPresentationMode
    
    // Event listeners para PiP
    document.addEventListener('enterpictureinpicture', handleEnterPiP)
    document.addEventListener('leavepictureinpicture', handleLeavePiP)
    
    // Cargar video si ya hay datos (solo una vez)
    if (props.video && !isVideoLoaded.value) {
        lastVideoId.value = props.video.id || null
        await nextTick()
        await loadVideo()
    }
})

onUnmounted(() => {
    // Limpiar event listeners
    document.removeEventListener('enterpictureinpicture', handleEnterPiP)
    document.removeEventListener('leavepictureinpicture', handleLeavePiP)
    
    // Revocar URL del blob si existe
    if (videoElement.value?.src && videoElement.value.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoElement.value.src)
    }
})

// Exponer métodos públicos
defineExpose({
    playVideo,
    pauseVideo,
    togglePlayPause,
    togglePictureInPicture,
    loadVideo,
    videoElement
})
</script>
