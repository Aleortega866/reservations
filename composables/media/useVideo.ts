import { ref, computed } from 'vue'
import { videoService } from '@/lib/api/services'
import type { 
  Video, 
  UploadVideoRequest, 
  UpdateVideoRequest, 
  ReplaceVideoFileRequest,
  DeleteVideoRequest,
  DuplicateVideoRequest,
  ToggleVisibilityVideoRequest,
  VideoFilters,
  VideoResponse,
  VideoListResponse
} from '@/lib/api/types/media'

export const useVideo = () => {
  const videos = ref<Video[]>([])
  const currentVideo = ref<Video | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene todos los videos con filtros opcionales
   * @param filters - Filtros opcionales
   */
  const fetchVideos = async (filters?: VideoFilters) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await videoService.getAllVideos(filters)
      videos.value = response || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener videos'
      console.error('Error en useVideo.fetchVideos:', err)
      videos.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un video específico por ID
   * @param id - ID del video
   */
  const fetchVideoById = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await videoService.getVideoById(id)
      currentVideo.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener el video'
      console.error('Error en useVideo.fetchVideoById:', err)
      currentVideo.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Sube un nuevo video
   * @param data - Datos del video a subir
   */
  const uploadVideo = async (data: UploadVideoRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await videoService.uploadVideo(data)
      // Recargar la lista de videos
      await fetchVideos()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al subir el video'
      console.error('Error en useVideo.uploadVideo:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un video existente
   * @param data - Datos del video a actualizar
   */
  const updateVideo = async (data: UpdateVideoRequest): Promise<Video | null> => {
    loading.value = true
    error.value = null

    console.log('Datos de entrada para updateVideo:', data)
    
    try {
      const response = await videoService.updateVideo(data)
      
      // No actualizamos la lista local aquí, se hará con GetAllVideosAsync después
      // Solo actualizamos el video actual si es el mismo
      if (currentVideo.value?.id === data.id) {
        currentVideo.value = response
      }
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el video'
      console.error('Error en useVideo.updateVideo:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Reemplaza el archivo de video manteniendo los metadatos
   * @param data - Datos para reemplazar el archivo de video
   */
  const replaceVideoFile = async (data: ReplaceVideoFileRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await videoService.replaceVideoFile(data)
      // Actualizar el video en la lista
      const index = videos.value.findIndex(v => v.id === data.id)
      if (index !== -1) {
        videos.value[index] = response
      }
      // Si es el video actual, actualizarlo también
      if (currentVideo.value?.id === data.id) {
        currentVideo.value = response
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al reemplazar el archivo de video'
      console.error('Error en useVideo.replaceVideoFile:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina uno o más videos
   * @param data - Datos para eliminar videos
   */
  const deleteVideo = async (data: DeleteVideoRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      await videoService.deleteVideo(data)
      // Remover videos eliminados de la lista
      videos.value = videos.value.filter(v => !data.ids.includes(Number(v.id)))
      // Si el video actual fue eliminado, limpiarlo
      if (currentVideo.value && data.ids.includes(Number(currentVideo.value.id))) {
        currentVideo.value = null
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el video'
      console.error('Error en useVideo.deleteVideo:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Duplica un video existente
   * @param data - Datos para duplicar el video
   */
  const duplicateVideo = async (data: DuplicateVideoRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await videoService.duplicateVideo(data)
      // Recargar la lista de videos
      await fetchVideos()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al duplicar el video'
      console.error('Error en useVideo.duplicateVideo:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Alterna la visibilidad de un video
   * @param data - Datos para alternar visibilidad
   */
  const toggleVisibility = async (data: ToggleVisibilityVideoRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await videoService.toggleVisibility(data)
      // Actualizar el video en la lista
      const index = videos.value.findIndex(v => v.id === data.id)
      if (index !== -1) {
        videos.value[index] = response
      }
      // Si es el video actual, actualizarlo también
      if (currentVideo.value?.id === data.id) {
        currentVideo.value = response
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar la visibilidad del video'
      console.error('Error en useVideo.toggleVisibility:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca videos por título
   * @param title - Título a buscar
   */
  const searchVideosByTitle = async (title: string) => {
    return fetchVideos({ title })
  }

  /**
   * Obtiene un video por ID desde la lista local
   * @param id - ID del video
   */
  const getVideoById = (id: number) => {
    return computed(() => videos.value.find(video => Number(video.id) === id))
  }

  /**
   * Limpia el estado del composable
   */
  const clearState = () => {
    videos.value = []
    currentVideo.value = null
    error.value = null
  }

  return {
    // Estado
    videos: computed(() => videos.value),
    currentVideo: computed(() => currentVideo.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Métodos
    fetchVideos,
    fetchVideoById,
    uploadVideo,
    updateVideo,
    replaceVideoFile,
    deleteVideo,
    duplicateVideo,
    toggleVisibility,
    searchVideosByTitle,
    getVideoById,
    clearState
  }
}
