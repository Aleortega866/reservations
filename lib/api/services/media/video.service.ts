// ============================================================================
// VIDEO SERVICE - Servicio de Gestión de Videos
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete, apiClient } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import axios from 'axios'
import { API_CONFIG } from '../../core/config'
import type { 
  Video, 
  UploadVideoRequest, 
  UpdateVideoRequest, 
  ReplaceVideoFileRequest,
  DeleteVideoRequest,
  DuplicateVideoRequest,
  ToggleVisibilityVideoRequest,
  VideoFilters,
  VideoFileResponse,
  VideoSection
} from '../../types/media'

// ============================================================================
// CONFIGURACIÓN ESPECÍFICA PARA MULTIPART/FORM-DATA
// ============================================================================

/**
 * Instancia específica de axios para FormData sin Content-Type por defecto
 * Utilizada para upload de archivos de video que requieren multipart/form-data
 */
const formDataClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout
})

// Interceptor para agregar token automáticamente a FormData requests
formDataClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

// Interceptor para debugging de respuestas FormData
formDataClient.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.data)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data)
    console.error('Response status:', error.response?.status)
    console.error('Response headers:', error.response?.headers)
    return Promise.reject(error)
  }
)

/**
 * Servicio de gestión de videos que maneja CRUD y operaciones de archivos
 * Nota: Los métodos de upload usan multipart/form-data en lugar de application/json
 * @class VideoService
 */
export class VideoService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los videos con filtros opcionales
   * @param {VideoFilters} [filters] - Filtros opcionales para la consulta
   * @param {string} [filters.id] - ID específico del video
   * @param {string} [filters.title] - Título del video a buscar
   * @returns {Promise<Video[]>} Lista de videos filtrados
   * @throws {Error} Error si no se pueden cargar los videos
   */
  async getAllVideos(filters?: VideoFilters): Promise<Video[]> {    
    const { execute } = useApiFetch<{ response: Video[] }>(
      API_ENDPOINTS.video.getAll, 
      { immediate: false }
    )
    
    const query: Record<string, any> = {}
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query[key] = value
        }
      })
    }

    const result = await execute({ query })

    return result.response || []
  }

  /**
   * Obtiene un video específico por su ID
   * @param {number} id - ID del video a buscar
   * @returns {Promise<Video>} Información del video encontrado
   * @throws {Error} Error si el video no existe
   */
  async getVideoById(id: number): Promise<Video> {
    const { execute } = useApiFetch<{ response: Video }>(
      `${API_ENDPOINTS.video.getById}?id=${id}`, 
      { immediate: false }
    )
    const result = await execute()
    return result.response
  }

  /**
   * Obtiene el archivo de video por nombre de archivo
   * @param {string} fileName - Nombre del archivo de video
   * @returns {Promise<VideoFileResponse>} Archivo de video en formato blob
   * @throws {Error} Error si el archivo no existe
   */
  async getVideoFile(fileName: string): Promise<VideoFileResponse> {
    try {
      const response = await apiClient.get<Blob>(`${API_ENDPOINTS.video.getVideoFile}/${fileName}`, {
        responseType: 'blob'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener el archivo de video'
      }
    }
  }

  /**
   * Obtiene todas las secciones de video disponibles
   * @returns {Promise<VideoSection[]>} Lista de secciones de video
   * @throws {Error} Error si no se pueden cargar las secciones
   */
  async getAllSections(): Promise<VideoSection[]> {
    const { execute } = useApiFetch<{ response: VideoSection[] }>(
      API_ENDPOINTS.video.getAllSections, 
      { immediate: false }
    )
    
    const result = await execute()
    return result.response || []
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN) - MULTIPART/FORM-DATA
  // ========================================================================

  /**
   * Sube un nuevo video al sistema usando multipart/form-data
   * @param {UploadVideoRequest} data - Datos del video a subir
   * @param {string} data.title - Título del video
   * @param {string} [data.description] - Descripción del video
   * @param {string} data.fileName - Nombre del archivo de video
   * @param {string} data.visibleFrom - Fecha desde cuando es visible
   * @param {string} data.visibleTo - Fecha hasta cuando es visible
   * @param {boolean} data.isVisible - Si el video es visible
   * @param {boolean} data.enable - Si el video está habilitado
   * @param {string} [data.category] - Categoría del video
   * @param {string[]} [data.tags] - Tags del video
   * @returns {Promise<Video>} Información del video creado
   * @throws {Error} Error si los datos son inválidos o falla la subida
   */
  async uploadVideo(data: UploadVideoRequest): Promise<Video> {
    const formData = new FormData()
    
    // Campos requeridos con nombres exactos de la API
    formData.append('Title', data.title)
    if (data.description) formData.append('Description', data.description)
    if (data.additionalDescription) formData.append('AdditionalDescription', data.additionalDescription)
    formData.append('FileName', data.fileName)
    
    // Formatear fechas al formato RFC 3339
    const formatDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString()
    }
    
    formData.append('VisibleFrom', formatDate(data.visibleFrom))
    formData.append('VisibleTo', formatDate(data.visibleTo))
    
    // Campos booleanos
    if (data.showOnce !== undefined) formData.append('ShowOnce', data.showOnce.toString())
    
    // Archivo de video
    formData.append('VideoFile', data.file)
    
    // Campos opcionales
    if (data.sectionId && data.sectionId > 0) formData.append('SectionId', data.sectionId.toString())
    if (data.userModifiedId) formData.append('UserModifiedId', data.userModifiedId.toString())
    else formData.append('UserModifiedId', '1') // Valor por defecto
    
    // Campos adicionales (no en la API pero mantenidos para compatibilidad)
    if (data.category) formData.append('category', data.category)
    if (data.tags && data.tags.length > 0) formData.append('tags', JSON.stringify(data.tags))
    formData.append('isVisible', data.isVisible.toString())
    formData.append('enable', data.enable.toString())

    // Debug: Log del FormData
    console.log('UploadVideo FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    // Usar formDataClient específico para FormData (no composables para multipart)
    const response = await formDataClient.post<{ response: Video }>(API_ENDPOINTS.video.upload, formData)
    
    return response.data.response
  }

  /**
   * Duplica un video existente
   * @param {DuplicateVideoRequest} data - Datos para duplicar el video
   * @returns {Promise<Video>} Información del video duplicado
   * @throws {Error} Error si el video original no existe
   */
  async duplicateVideo(data: DuplicateVideoRequest): Promise<Video> {
    const { execute } = useApiPost<{ response: Video }>(
      API_ENDPOINTS.video.duplicate,
      { immediate: false }
    )
    const result = await execute({ body: data })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN) - MULTIPART/FORM-DATA
  // ========================================================================

  /**
   * Actualiza un video existente usando multipart/form-data
   * @param {UpdateVideoRequest} data - Datos del video a actualizar
   * @param {number} data.id - ID del video a actualizar
   * @param {string} data.title - Nuevo título del video
   * @param {string} [data.description] - Nueva descripción del video
   * @param {string} [data.additionalDescription] - Descripción adicional
   * @param {string} [data.visibleFrom] - Fecha desde cuando es visible
   * @param {string} [data.visibleTo] - Fecha hasta cuando es visible
   * @param {string} [data.fileName] - Nombre del archivo
   * @param {string} [data.category] - Categoría del video
   * @param {string[]} [data.tags] - Tags del video
   * @returns {Promise<Video>} Información del video actualizado
   * @throws {Error} Error si el video no existe o datos inválidos
   */
  async updateVideo(data: UpdateVideoRequest): Promise<Video> {
    const formData = new FormData()
    
    // Debug: Verificar datos de entrada
    console.log('Datos de entrada para updateVideo services:', data)
    console.log('ID tipo:', typeof data.id, 'Valor:', data.id)
    console.log('Title tipo:', typeof data.title, 'Valor:', data.title)
    console.log('VisibleFrom tipo:', typeof data.visibleFrom, 'Valor:', data.visibleFrom)
    console.log('VisibleTo tipo:', typeof data.visibleTo, 'Valor:', data.visibleTo)
    console.log('IsActive tipo:', typeof data.isActive, 'Valor:', data.isActive)
    
    // Enviar cada campo individualmente como espera la API con nombres correctos
    formData.append('Id', data.id.toString())
    formData.append('Title', data.title)
    formData.append('Description', data.description || '')
    formData.append('AdditionalDescription', data.additionalDescription || '')
    
    // Formatear fechas al formato RFC 3339
    const formatDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString()
    }
    
    formData.append('VisibleFrom', formatDate(data.visibleFrom || ''))
    formData.append('VisibleTo', formatDate(data.visibleTo || ''))
    formData.append('UserModifiedId', '1') // Campo requerido por la API
    formData.append('FileName', data.fileName || '')
    
    // Campos opcionales
    if (data.category) formData.append('Category', data.category)
    if (data.tags && data.tags.length > 0) formData.append('Tags', JSON.stringify(data.tags))
    if (data.sectionId && data.sectionId > 0) formData.append('SectionId', data.sectionId.toString())
    if (data.showOnce !== undefined) formData.append('ShowOnce', data.showOnce.toString())

    // Debug: Log del FormData
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    // Usar formDataClient específico para FormData (no composables para multipart)
    const response = await formDataClient.put<{ response: Video }>(API_ENDPOINTS.video.update, formData)
    
    return response.data.response
  }

  /**
   * Reemplaza el archivo de video usando multipart/form-data
   * @param {ReplaceVideoFileRequest} data - Datos para reemplazar el archivo de video
   * @param {string|number} data.id - ID del video
   * @param {string} data.title - Título del video
   * @param {File} data.videoFile - Nuevo archivo de video
   * @param {string} data.fileName - Nombre del archivo
   * @param {string} data.visibleFrom - Fecha desde cuando es visible
   * @param {string} data.visibleTo - Fecha hasta cuando es visible
   * @param {string} [data.description] - Descripción del video
   * @param {string} [data.additionalDescription] - Descripción adicional
   * @param {number} [data.userModifiedId] - ID del usuario que modifica
   * @param {string} [data.category] - Categoría del video
   * @param {string[]} [data.tags] - Tags del video
   * @returns {Promise<Video>} Información del video con archivo reemplazado
   * @throws {Error} Error si el video no existe o falla la subida del archivo
   */
  async replaceVideoFile(data: ReplaceVideoFileRequest): Promise<Video> {
    const formData = new FormData()
    
    // Enviar cada campo individualmente como espera la API
    const id = typeof data.id === 'string' ? parseInt(data.id, 10) : data.id
    formData.append('Id', id.toString())
    formData.append('Title', data.title)
    formData.append('Description', data.description || '')
    formData.append('AdditionalDescription', data.additionalDescription || '')
    
    // Formatear fechas al formato RFC 3339
    const formatDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString()
    }
    
    formData.append('VisibleFrom', formatDate(data.visibleFrom))
    formData.append('VisibleTo', formatDate(data.visibleTo))
    formData.append('VideoFile', data.videoFile)
    formData.append('UserModifiedId', (data.userModifiedId || 1).toString())
    formData.append('FileName', data.fileName)
    
    // Campos opcionales
    if (data.category) formData.append('Category', data.category)
    if (data.tags && data.tags.length > 0) formData.append('Tags', JSON.stringify(data.tags))

    // Debug: Log del FormData
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    // Usar formDataClient específico para FormData (no composables para multipart)
    const response = await formDataClient.put<{ response: Video }>(API_ENDPOINTS.video.update, formData)
    
    return response.data.response
  }

  /**
   * Alterna la visibilidad de un video
   * @param {ToggleVisibilityVideoRequest} data - Datos para alternar visibilidad
   * @returns {Promise<Video>} Información del video con visibilidad actualizada
   * @throws {Error} Error si el video no existe
   */
  async toggleVisibility(data: ToggleVisibilityVideoRequest): Promise<Video> {
    const { execute } = useApiPut<{ response: Video }>(
      API_ENDPOINTS.video.toggleVisibility,
      { immediate: false }
    )
    const result = await execute({ body: data })
    return result.response
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina uno o más videos del sistema
   * @param {DeleteVideoRequest} data - Datos para eliminar videos
   * @returns {Promise<boolean>} Confirmación de eliminación
   * @throws {Error} Error si los videos no existen o no se pueden eliminar
   */
  async deleteVideo(data: DeleteVideoRequest): Promise<boolean> {
    const { execute } = useApiDelete<{ response: boolean }>(
      API_ENDPOINTS.video.delete,
      { immediate: false }
    )
    const result = await execute({ body: data })
    return result.response
  }

  // ========================================================================
  // MÉTODOS UTILITARIOS
  // ========================================================================

  /**
   * Busca videos por título
   * @param {string} title - Título a buscar
   * @returns {Promise<Video[]>} Lista de videos que coinciden con el título
   * @throws {Error} Error si no se pueden realizar la búsqueda
   */
  async searchVideosByTitle(title: string): Promise<Video[]> {
    return this.getAllVideos({ title })
  }

  /**
   * Obtiene un video por ID usando el endpoint de getAll
   * @param {string} id - ID del video a buscar
   * @returns {Promise<{isValid: boolean; response: Video | undefined; comments: string}>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getVideoByIdFromAll(id: string): Promise<{ isValid: boolean; response: Video | undefined; comments: string }> {
    const videos = await this.getAllVideos({ id })
    const video = videos.find((v: Video) => v.id === id)
    return {
      isValid: !!video,
      response: video,
      comments: video ? 'Video encontrado' : 'Video no encontrado'
    }
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de videos
 * @type {VideoService}
 */
export const videoService = new VideoService() 