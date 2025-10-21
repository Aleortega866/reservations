import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { videoService } from '@/lib/api/services'
import type { Video } from '@/lib/api/types/media'

export interface VideoWithUI extends Video {
  showDemo?: boolean
  isPlaying?: boolean
  isPiP?: boolean
  isLoading?: boolean
}

export const useVideosStore = defineStore('videos', () => {
  // Estado de los videos
  const videos = ref<VideoWithUI[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Control para evitar múltiples peticiones simultáneas
  let isCurrentlyFetching = false
  const lastFetchTime = ref(0)
  const FETCH_COOLDOWN = 1000 // 1 segundo de cooldown

  // Computed para obtener videos con estado de UI
  const videosWithUI = computed(() => {
    return videos.value.map((video: Video) => ({
      ...video,
      showDemo: false,
      isPlaying: false,
      isPiP: false
    }))
  })

  // Función para cargar todos los videos con protección contra duplicados
  const fetchVideos = async (force: boolean = false) => {
    // Verificar si ya hay una petición en curso
    if (isCurrentlyFetching && !force) {
      console.log('⏸️ Petición de fetchVideos ignorada - ya hay una en curso');
      return videos.value
    }
    
    // Verificar cooldown (a menos que sea forzado)
    const now = Date.now()
    if (!force && (now - lastFetchTime.value) < FETCH_COOLDOWN) {
      console.log('⏸️ Petición de fetchVideos ignorada - cooldown activo');
      return videos.value
    }

    try {
      console.log('🔄 Iniciando fetchVideos - llamando a GetAllVideosAsync...');
      isCurrentlyFetching = true
      loading.value = true
      error.value = null
      lastFetchTime.value = now
      
      const response = await videoService.getAllVideos()
      console.log('✅ Respuesta de GetAllVideosAsync recibida:', response);
      
      videos.value = response.map((video: Video) => ({
        ...video,
        showDemo: false,
        isPlaying: false,
        isPiP: false,
        isLoading: false
      }))
      
      console.log('✅ Lista de videos actualizada en el store:', videos.value.length, 'videos');
      return videos.value
    } catch (err: any) {
      error.value = err.message || 'Error al cargar videos'
      console.error('❌ Error en fetchVideos:', err)
      throw err
    } finally {
      loading.value = false
      isCurrentlyFetching = false
    }
  }

  // Función para actualizar solo la visibilidad de un video
  const updateVideoVisibility = async (id: string, isVisible: boolean, showOnce: boolean) => {
    try {
      const response = await videoService.toggleVisibility({
        id,
        isVisible,
        showOnce
      })

      // Actualizar solo el video específico en el store
      const videoIndex = videos.value.findIndex(v => v.id === id)
      if (videoIndex !== -1) {
        videos.value[videoIndex].isActive = isVisible
      }

      return response
    } catch (err: any) {
      console.error('Error updating video visibility:', err)
      throw err
    }
  }

  // Función para actualizar el estado de UI de un video
  const updateVideoUIState = (id: string, updates: Partial<VideoWithUI>) => {
    const videoIndex = videos.value.findIndex(v => v.id === id)
    if (videoIndex !== -1) {
      videos.value[videoIndex] = {
        ...videos.value[videoIndex],
        ...updates
      }
    }
  }

  // Función para obtener un video por ID
  const getVideoById = (id: string): VideoWithUI | undefined => {
    return videos.value.find(v => v.id === id)
  }

  // Función para limpiar el estado
  const clearVideos = () => {
    videos.value = []
    loading.value = false
    error.value = null
  }

  return {
    videos,
    videosWithUI,
    loading,
    error,
    fetchVideos,
    updateVideoVisibility,
    updateVideoUIState,
    getVideoById,
    clearVideos
  }
})
