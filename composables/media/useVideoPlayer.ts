import { ref, computed, nextTick, readonly } from 'vue'
import { videoService } from '@/lib/api/services/media/video.service'
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/core/config'

export interface VideoPlayerState {
    isLoading: boolean
    isPlaying: boolean
    isPiP: boolean
    currentTime: number
    duration: number
    error: string | null
}

export interface VideoData {
    id: string | number
    title?: string
    description?: string
    fileName?: string
    fileUrl?: string
    src?: string
    duration?: number
    [key: string]: any
}

export interface VideoPlayerOptions {
    autoLoad?: boolean
    useVideoService?: boolean
    enablePiP?: boolean
    enableCache?: boolean
}

export function useVideoPlayer(options: VideoPlayerOptions = {}) {
    const {
        useVideoService = true,
        enableCache = false
    } = options

    // Estado del reproductor
    const state = ref<VideoPlayerState>({
        isLoading: false,
        isPlaying: false,
        isPiP: false,
        currentTime: 0,
        duration: 0,
        error: null
    })

    // Cache de URLs de videos (opcional)
    const videoUrlCache = ref<Map<string | number, string>>(new Map())
    // Mapa de promesas en curso para evitar peticiones simultáneas
    const pendingRequests = ref<Map<string, Promise<string>>>(new Map())

    // Referencia al elemento de video
    const videoElement = ref<HTMLVideoElement>()

    // Computed properties
    const progressPercentage = computed(() => {
        if (state.value.duration === 0) return 0
        return (state.value.currentTime / state.value.duration) * 100
    })

    const isVideoSupported = computed(() => {
        return typeof window !== 'undefined' && 'HTMLVideoElement' in window
    })

    const isPictureInPictureSupported = computed(() => {
        return typeof document !== 'undefined' && (
            document.pictureInPictureEnabled ||
            (document as any).webkitSupportsPresentationMode
        )
    })

    // Funciones para obtener URLs de video
    const getDirectVideoUrl = (video: VideoData): string => {
        // Si el video tiene una URL directa, usarla
        if (video.fileUrl) {
            return video.fileUrl
        }

        if (video.src) {
            return video.src
        }

        // Si el video tiene un fileName, construir URL directa del endpoint
        // NO añadir timestamp para permitir cache del navegador
        if (video.fileName) {
            return `${API_CONFIG.baseURL}${API_ENDPOINTS.video.getVideoFile}/${video.fileName}`
        }

        throw new Error('Video no tiene URL válida')
    }

    const getVideoBlobUrl = async (video: VideoData): Promise<string> => {
        if (!video.fileName) {
            throw new Error('Video no tiene fileName')
        }

        const cacheKey = `${video.id}_${video.fileName}`

        try {
            // 1. Verificar cache primero - SIEMPRE usar cache si está disponible
            if (videoUrlCache.value.has(cacheKey)) {
                const cachedUrl = videoUrlCache.value.get(cacheKey)!
                console.log('📦 Video obtenido desde cache:', video.fileName)
                return cachedUrl
            }

            // 2. Verificar si ya hay una petición en curso para este video
            if (pendingRequests.value.has(cacheKey)) {
                console.log('⏳ Esperando petición en curso para:', video.fileName)
                return await pendingRequests.value.get(cacheKey)!
            }

            // 3. Crear nueva petición y guardarla en pending
            console.log('🌐 Obteniendo video desde servidor:', video.fileName)
            
            const requestPromise = (async (): Promise<string> => {
                try {
                    const result = await videoService.getVideoFile(video.fileName)
                    if (result.success && result.data) {
                        const videoUrl = URL.createObjectURL(result.data)
                        
                        // SIEMPRE guardar en cache
                        videoUrlCache.value.set(cacheKey, videoUrl)
                        console.log('💾 Video guardado en cache:', video.fileName)
                        
                        return videoUrl
                    } else {
                        throw new Error(result.error || 'Error al obtener video')
                    }
                } finally {
                    // Limpiar de pending requests
                    pendingRequests.value.delete(cacheKey)
                }
            })()

            // Guardar la promesa en pending
            pendingRequests.value.set(cacheKey, requestPromise)
            
            return await requestPromise

        } catch (error) {
            // Limpiar de pending en caso de error
            pendingRequests.value.delete(cacheKey)
            console.error('❌ Error al obtener video blob:', error)
            throw error
        }
    }

    const getVideoUrl = async (video: VideoData): Promise<string> => {
        if (useVideoService) {
            return await getVideoBlobUrl(video)
        } else {
            return getDirectVideoUrl(video)
        }
    }

    // Funciones de control del reproductor
    const loadVideo = async (video: VideoData): Promise<void> => {
        if (!videoElement.value || !video) {
            throw new Error('Elemento de video no disponible')
        }

        try {
            state.value.isLoading = true
            state.value.error = null

            console.log('Cargando video:', video.fileName || video.src)

            // Limpiar cualquier URL de blob anterior
            if (videoElement.value.src && videoElement.value.src.startsWith('blob:')) {
                URL.revokeObjectURL(videoElement.value.src)
            }

            const videoUrl = await getVideoUrl(video)
            
            if (videoUrl) {
                await nextTick()
                
                if (videoElement.value) {
                    videoElement.value.src = videoUrl
                    videoElement.value.load()
                    console.log('✅ Video cargado exitosamente')
                }
            }
        } catch (error) {
            state.value.error = error instanceof Error ? error.message : 'Error desconocido'
            state.value.isLoading = false
            throw error
        }
    }

    const reloadVideo = async (video: VideoData): Promise<void> => {
        if (!videoElement.value) return

        try {
            state.value.isLoading = true
            
            // Limpiar cache si está habilitado
            if (enableCache && videoUrlCache.value.has(video.id)) {
                const cachedUrl = videoUrlCache.value.get(video.id)!
                URL.revokeObjectURL(cachedUrl)
                videoUrlCache.value.delete(video.id)
            }

            // Limpiar el elemento de video
            videoElement.value.src = ''
            videoElement.value.load()

            // Recargar el video
            await loadVideo(video)
        } catch (error) {
            console.error('Error al recargar video:', error)
            throw error
        }
    }

    const playVideo = async (): Promise<void> => {
        if (videoElement.value) {
            try {
                await videoElement.value.play()
            } catch (error) {
                console.error('Error al reproducir video:', error)
                throw error
            }
        }
    }

    const pauseVideo = (): void => {
        if (videoElement.value) {
            videoElement.value.pause()
        }
    }

    const togglePlayPause = async (): Promise<void> => {
        if (videoElement.value) {
            if (videoElement.value.paused) {
                await playVideo()
            } else {
                pauseVideo()
            }
        }
    }

    const seekTo = (time: number): void => {
        if (videoElement.value && time >= 0 && time <= state.value.duration) {
            videoElement.value.currentTime = time
            state.value.currentTime = time
        }
    }

    const seekToPercentage = (percentage: number): void => {
        if (percentage >= 0 && percentage <= 100) {
            const time = (percentage / 100) * state.value.duration
            seekTo(time)
        }
    }

    // Picture-in-Picture
    const togglePictureInPicture = async (): Promise<void> => {
        if (!videoElement.value || !isPictureInPictureSupported.value) {
            throw new Error('Picture-in-Picture no está soportado')
        }

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
            } else {
                await videoElement.value.requestPictureInPicture()
            }
        } catch (error) {
            console.error('Error al alternar Picture-in-Picture:', error)
            throw error
        }
    }

    // Event handlers
    const handlePlay = (): void => {
        state.value.isPlaying = true
    }

    const handlePause = (): void => {
        state.value.isPlaying = false
    }

    const handleLoadedData = (): void => {
        state.value.isLoading = false
        if (videoElement.value) {
            state.value.duration = videoElement.value.duration || 0
        }
    }

    const handleTimeUpdate = (): void => {
        if (videoElement.value) {
            state.value.currentTime = videoElement.value.currentTime
        }
    }

    const handleError = (event: Event): void => {
        state.value.isLoading = false
        state.value.error = 'Error al cargar el video'
        console.error('Error en el video:', event)
    }

    const handleLoadedMetadata = (): void => {
        if (videoElement.value) {
            state.value.duration = videoElement.value.duration || 0
        }
    }

    const handleEnterPiP = (): void => {
        state.value.isPiP = true
    }

    const handleLeavePiP = (): void => {
        state.value.isPiP = false
    }

    // Utilidades
    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00'
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
        }
    }

    // Limpieza
    const cleanup = (): void => {
        // Limpiar URLs de blob
        if (videoElement.value?.src && videoElement.value.src.startsWith('blob:')) {
            URL.revokeObjectURL(videoElement.value.src)
        }

        // Limpiar cache
        if (enableCache) {
            videoUrlCache.value.forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url)
                }
            })
            videoUrlCache.value.clear()
        }
    }

    return {
        // Estado
        state: readonly(state),
        videoElement,
        
        // Computed
        progressPercentage,
        isVideoSupported,
        isPictureInPictureSupported,
        
        // Métodos de control
        loadVideo,
        reloadVideo,
        playVideo,
        pauseVideo,
        togglePlayPause,
        seekTo,
        seekToPercentage,
        togglePictureInPicture,
        
        // Event handlers
        handlePlay,
        handlePause,
        handleLoadedData,
        handleTimeUpdate,
        handleError,
        handleLoadedMetadata,
        handleEnterPiP,
        handleLeavePiP,
        
        // Utilidades
        formatTime,
        formatDuration,
        getVideoUrl,
        cleanup
    }
}

// Composable simplificado para uso básico
export function useSimpleVideoPlayer(video: VideoData, options?: VideoPlayerOptions) {
    const player = useVideoPlayer(options)
    
    const initializePlayer = async (element: HTMLVideoElement) => {
        player.videoElement.value = element
        if (video) {
            await player.loadVideo(video)
        }
    }
    
    return {
        ...player,
        initializePlayer
    }
}
