// ============================================================================
// COMPOSABLE PARA GESTIÓN DE DOCUMENTOS DE RESERVACIÓN - VERSIÓN LIMPIA
// ============================================================================

import { ref, computed, watch, readonly, type Ref } from 'vue'
import { reservationDocumentsService } from '@/lib/api/services/reservations'
import { useToast } from '../ui/useToast'
import type { 
  ReservationDocument, 
  DocumentUploadState,
  UploadReservationDocumentRequest,
  DeleteReservationDocumentRequest
} from '@/lib/api/types/reservation/documents'

/**
 * Composable para manejar documentos de reservación
 * Proporciona funcionalidades para subir y eliminar documentos
 * @param reservationId - ID de la reservación
 * @param userModifiedId - ID del usuario que modifica
 */
export function useReservationDocuments(reservationId: Ref<number | null>, userModifiedId: Ref<number | null>) {
  
  // ========================================================================
  // COMPOSABLES
  // ========================================================================
  
  const { showError, showSuccess } = useToast()
  
  // ========================================================================
  // ESTADO REACTIVO
  // ========================================================================
  
  const documents = ref<ReservationDocument[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const uploadState = ref<DocumentUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    success: false
  })

  // ========================================================================
  // COMPUTED PROPERTIES
  // ========================================================================
  
  const hasDocuments = computed(() => documents.value.length > 0)
  const canUpload = computed(() => !uploadState.value.isUploading && reservationId.value && userModifiedId.value)
  
  // ========================================================================
  // MÉTODOS PARA SUBIR DOCUMENTOS
  // ========================================================================
  
  /**
   * Sube un archivo directamente al servidor sin agregarlo a documentos locales
   * @param file - Archivo a subir
   * @returns {Promise<{success: boolean, error?: string}>} Resultado de la operación
   */
  const uploadFileDirectly = async (file: File): Promise<{ success: boolean; error?: string }> => {
    if (!userModifiedId.value || !reservationId.value) {
      return { success: false, error: 'Falta ID de usuario o reservación' }
    }

    try {
      // Actualizar estado de carga
      uploadState.value = {
        isUploading: true,
        uploadProgress: 0,
        error: null,
        success: false
      }

      // Validar archivo
      const validation = await reservationDocumentsService.validateFile(file)
      if (!validation.valid) {
        uploadState.value = {
          isUploading: false,
          uploadProgress: 0,
          error: validation.error || 'Error de validación',
          success: false
        }
        return { success: false, error: validation.error || 'Error de validación' }
      }

      // Simular progreso
      uploadState.value.uploadProgress = 50

      // Subir directamente al servidor
      const request: UploadReservationDocumentRequest = {
        file,
        userModifiedId: userModifiedId.value,
        reservationId: reservationId.value
      }

      const uploadedDoc = await reservationDocumentsService.uploadDocument(request)
      
      // Agregar a la lista de documentos del servidor
      documents.value.push(uploadedDoc)

      // Actualizar estado de éxito
      uploadState.value = {
        isUploading: false,
        uploadProgress: 100,
        error: null,
        success: true
      }

      showSuccess('Archivo subido exitosamente', `El archivo "${file.name}" se subió correctamente.`)

      return { success: true }
    } catch (error) {
      console.error('❌ Error al subir archivo directamente:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      uploadState.value = {
        isUploading: false,
        uploadProgress: 0,
        error: errorMessage,
        success: false
      }
      
      showError('Error al subir archivo', `No se pudo subir el archivo: ${errorMessage}`)
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  // ========================================================================
  // MÉTODOS PARA ELIMINAR DOCUMENTOS
  // ========================================================================

  /**
   * Elimina un documento del servidor
   * @param documentId - ID del documento en el servidor
   */
  const deleteDocument = async (documentId: number): Promise<{ success: boolean; error?: string }> => {
    console.log('🔍 deleteDocument called with:', { documentId, userModifiedId: userModifiedId.value })
    
    if (!userModifiedId.value) {
      return { success: false, error: 'Falta ID de usuario' }
    }

    if (!documentId || documentId <= 0) {
      return { success: false, error: 'ID de documento inválido' }
    }

    try {
      const request: DeleteReservationDocumentRequest = {
        documentId,
        userModifiedId: userModifiedId.value
      }

      console.log('🔍 deleteDocument request:', request)
      await reservationDocumentsService.deleteDocument(request)

      // Remover de la lista local
      const index = documents.value.findIndex(doc => doc.id === documentId)
      if (index > -1) {
        documents.value.splice(index, 1)
      }

      showSuccess('Documento eliminado', 'El documento se eliminó correctamente.')

      return { success: true }
    } catch (error) {
      console.error('❌ Error al eliminar documento:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el documento'
      showError('Error al eliminar documento', `No se pudo eliminar el documento: ${errorMessage}`)
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  // ========================================================================
  // MÉTODOS AUXILIARES
  // ========================================================================

  /**
   * Resetea el estado de carga
   */
  const resetUploadState = () => {
    uploadState.value = {
      isUploading: false,
      uploadProgress: 0,
      error: null,
      success: false
    }
  }

  /**
   * Limpia los recursos cuando el componente se desmonta
   */
  const cleanup = () => {
    resetUploadState()
    documents.value = []
    error.value = null
  }

  // ========================================================================
  // WATCHERS
  // ========================================================================

  // Cargar documentos cuando cambien los IDs
  watch([reservationId, userModifiedId], async ([newReservationId, newUserModifiedId]) => {
    console.log('🔍 Watch ejecutado - reservationId:', newReservationId, 'userModifiedId:', newUserModifiedId)
    
    if (newReservationId && newUserModifiedId) {
      console.log('🔄 Iniciando carga de documentos existentes...')
      try {
        isLoading.value = true
        error.value = null
        
        const docs = await reservationDocumentsService.getAllDocuments({
          reservationId: newReservationId,
          userModifiedId: newUserModifiedId
        })
        
        // Mapear documentId a id para consistencia
        const mappedDocs = (docs || []).map(doc => {
          console.log('🔍 Documento original:', doc)
          const mapped = {
            ...doc,
            id: (doc as any).documentId || doc.id
          }
          console.log('🔍 Documento mapeado:', mapped)
          return mapped
        })
        
        documents.value = mappedDocs
        console.log('✅ Documentos cargados:', documents.value)
        if (docs && docs.length > 0) {
          console.log('🔍 Estructura del primer documento cargado:', docs[0])
          console.log('🔍 Campos disponibles:', Object.keys(docs[0]))
          console.log('🔍 Documento mapeado:', mappedDocs[0])
        }
      } catch (err) {
        console.error('❌ Error al cargar documentos:', err)
        error.value = 'Error al cargar los documentos'
        showError('Error al cargar documentos', 'No se pudieron cargar los documentos existentes. Intenta recargar la página.')
      } finally {
        isLoading.value = false
      }
    } else {
      console.log('⚠️ No se cargan documentos - reservationId:', newReservationId, 'userModifiedId:', newUserModifiedId)
    }
  }, { immediate: true })

  // ========================================================================
  // RETORNO
  // ========================================================================

  return {
    // Estado reactivo
    documents: readonly(documents),
    isLoading: readonly(isLoading),
    error: readonly(error),
    uploadState: readonly(uploadState),
    
    // Computed properties
    hasDocuments,
    canUpload,
    
    // Métodos
    uploadFileDirectly,
    deleteDocument,
    resetUploadState,
    cleanup
  }
}
