import { ref, readonly, computed } from 'vue'
import { promotionService } from '~/lib/api/services/promotion'
import { useAuth } from '~/lib/api/composables/auth'
import type { 
  LinkingCode,
  CreateLinkingCodeRequest,
  UpdateLinkingCodeRequest,
  DeleteLinkingCodeRequest,
  ActivateLinkingCodeRequest
} from '~/lib/api/types'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'

// ============================================================================
// COMPOSABLE MEJORADO DE PROMOCIONES CON AUTENTICACIÓN INTEGRADA
// ============================================================================

// Instancia singleton para evitar múltiples instancias
let promotionServiceInstance: ReturnType<typeof createPromotionService> | null = null

/**
 * Función interna para crear el servicio de promociones mejorado
 * Integra autenticación automática y manejo robusto de errores
 */
function createPromotionService() {
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()

  // ============================================================================
  // ESTADOS REACTIVOS
  // ============================================================================

  const linkingCodes = ref<LinkingCode[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const isCreating = ref(false)
  const isUpdating = ref(false)
  const isDeleting = ref(false)

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Obtiene el ID del usuario autenticado para operaciones
   */
  const getUserModifiedId = (): number => {
    if (!user.value?.userId) {
      throw new Error('Usuario no autenticado')
    }
    return user.value.userId
  }

  /**
   * Maneja errores de forma consistente
   */
  const handleError = (err: any, operation: string) => {
    console.error(`Error en ${operation}:`, err)
    error.value = err as Error
    const errorMessage = getErrorMessage(err)
    showError('Error', errorMessage || `No se pudo ${operation}`)
    throw err
  }

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    error.value = null
  }

  // ============================================================================
  // OPERACIONES DE CÓDIGOS DE VINCULACIÓN
  // ============================================================================

  /**
   * Obtiene todos los códigos de vinculación
   */
  const getAllLinkingCodes = async () => {
    loading.value = true
    clearError()
    try {
      linkingCodes.value = await promotionService.getAllLinkingCodes()
      return linkingCodes.value
    } catch (err) {
      handleError(err, 'cargar códigos de vinculación')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo código de vinculación con autenticación automática
   */
  const createLinkingCode = async (request: Omit<CreateLinkingCodeRequest, 'userModifiedId'>) => {
    if (isCreating.value) return null
    
    isCreating.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: CreateLinkingCodeRequest = {
        ...request,
        userModifiedId: 1
      }

      const newCode = await promotionService.createLinkingCode(fullRequest)
      
      // Agregar optimísticamente a la lista local
      linkingCodes.value = [...linkingCodes.value, newCode]
      
      showSuccess('Éxito', 'Código de vinculación creado correctamente')
      return newCode
    } catch (err) {
      handleError(err, 'crear código de vinculación')
      return null
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Actualiza un código de vinculación con autenticación automática
   */
  const updateLinkingCode = async (request: Omit<UpdateLinkingCodeRequest, 'userModifiedId'>) => {
    if (isUpdating.value) return null
    
    isUpdating.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: UpdateLinkingCodeRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const updatedCode = await promotionService.updateLinkingCode(fullRequest)
      
      // Actualizar optimísticamente en la lista local
      const index = linkingCodes.value.findIndex(code => code.id === Number(request.id))
      if (index !== -1) {
        const newCodes = [...linkingCodes.value]
        newCodes[index] = updatedCode
        linkingCodes.value = newCodes
      }
      
      showSuccess('Éxito', 'Código de vinculación actualizado correctamente')
      return updatedCode
    } catch (err) {
      handleError(err, 'actualizar código de vinculación')
      return null
    } finally {
      isUpdating.value = false
    }
  }

  /**
   * Activa o desactiva un código de vinculación con autenticación automática
   */
  const activateLinkingCode = async (request: Omit<ActivateLinkingCodeRequest, 'userModifiedId'>) => {
    if (isUpdating.value) return null
    
    isUpdating.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: ActivateLinkingCodeRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      const result = await promotionService.activateLinkingCode(fullRequest)
      
      // La API devuelve solo un número (1) en lugar del objeto completo
      // Necesitamos actualizar el estado local manualmente
      const index = linkingCodes.value.findIndex(code => code.id === Number(request.id))
      
      if (index !== -1) {
        // Crear un nuevo array para evitar problemas con readonly
        const newCodes = [...linkingCodes.value]
        // Actualizar solo el campo enable del código existente
        newCodes[index] = {
          ...newCodes[index],
          enable: request.enable
        }
        linkingCodes.value = newCodes
      }
      
      showSuccess('Éxito', 'Estado del código de vinculación actualizado correctamente')
      
      // Devolver el código actualizado para el componente
      const updatedCode = index !== -1 ? linkingCodes.value[index] : null
      return updatedCode
    } catch (err) {
      handleError(err, 'activar/desactivar código de vinculación')
      return null
    } finally {
      isUpdating.value = false
    }
  }

  /**
   * Elimina un código de vinculación con autenticación automática
   */
  const deleteLinkingCode = async (request: Omit<DeleteLinkingCodeRequest, 'userModifiedId'>) => {
    if (isDeleting.value) return null
    
    isDeleting.value = true
    clearError()
    try {
      // Agregar userModifiedId automáticamente
      const fullRequest: DeleteLinkingCodeRequest = {
        ...request,
        userModifiedId: getUserModifiedId()
      }

      await promotionService.deleteLinkingCode(fullRequest.id, fullRequest.userModifiedId)
      
      // Remover optimísticamente de la lista local
      const index = linkingCodes.value.findIndex(code => code.id === request.id)
      
      if (index !== -1) {
        const newCodes = [...linkingCodes.value]
        newCodes.splice(index, 1)
        linkingCodes.value = newCodes
      }
      
      showSuccess('Éxito', 'Código de vinculación eliminado correctamente')
      return true
    } catch (err) {
      handleError(err, 'eliminar código de vinculación')
      return null
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Obtiene un código de vinculación por ID
   */
  const getLinkingCodeById = async (id: number) => {
    loading.value = true
    clearError()
    try {
      return await promotionService.getLinkingCode(id.toString())
    } catch (err) {
      handleError(err, 'obtener código de vinculación')
      return null
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // UTILIDADES Y COMPUTED PROPERTIES
  // ============================================================================

  /**
   * Filtra códigos activos
   */
  const activeLinkingCodes = readonly(
    computed(() => linkingCodes.value.filter(code => code.enable))
  )

  /**
   * Filtra códigos inactivos
   */
  const inactiveLinkingCodes = readonly(
    computed(() => linkingCodes.value.filter(code => !code.enable))
  )

  /**
   * Estado de loading consolidado
   */
  const isLoading = readonly(
    computed(() => loading.value || isCreating.value || isUpdating.value || isDeleting.value)
  )

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Estados reactivos
    linkingCodes: readonly(linkingCodes),
    loading: readonly(loading),
    isLoading,
    isCreating: readonly(isCreating),
    isUpdating: readonly(isUpdating),
    isDeleting: readonly(isDeleting),
    error: readonly(error),

    // Computed properties
    activeLinkingCodes,
    inactiveLinkingCodes,

    // Operaciones CRUD principales
    getAllLinkingCodes,
    getLinkingCodeById,
    createLinkingCode,
    updateLinkingCode,
    activateLinkingCode,
    deleteLinkingCode,

    // Utilidades
    clearError
  }
}

/**
 * Composable unificado para gestión de promociones y códigos de vinculación
 * 
 * Características:
 * - ✅ Autenticación automática integrada
 * - ✅ Operaciones optimistas
 * - ✅ Estados granulares de loading
 * - ✅ Manejo robusto de errores
 * - ✅ Notificaciones automáticas
 * - ✅ Patrón singleton para consistencia
 * 
 * @example
 * ```typescript
 * const {
 *   linkingCodes,
 *   isLoading,
 *   createLinkingCode,
 *   updateLinkingCode,
 *   deleteLinkingCode
 * } = usePromotionService()
 * 
 * // Crear código de vinculación (userModifiedId se agrega automáticamente)
 * await createLinkingCode({
 *   name: 'Nuevo código',
 *   code: 'PROMO123',
 *   ticketPrice: 50.00
 * })
 * ```
 */
export function usePromotionService() {
  if (!promotionServiceInstance) {
    promotionServiceInstance = createPromotionService()
  }
  return promotionServiceInstance
}

// ============================================================================
// EXPORTS PARA COMPATIBILIDAD
// ============================================================================

// Export principal (recomendado)
export { usePromotionService as usePromotions }

// Export de tipos para convenience
export type {
  LinkingCode,
  CreateLinkingCodeRequest,
  UpdateLinkingCodeRequest,
  DeleteLinkingCodeRequest,
  ActivateLinkingCodeRequest
} from '~/lib/api/types' 