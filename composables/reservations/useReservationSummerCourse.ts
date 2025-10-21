// ============================================================================
// USE RESERVATION SUMMER COURSE - Composable simplificado para Reservaciones de Cursos de Verano
// ============================================================================

import { readonly } from 'vue'
import { useReservationSummerCourseStore } from '@/stores/reservation-summer-course'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'
import { useStepSaveEvents } from './useStepSaveEvents'

/**
 * Composable simplificado para la gestión de reservaciones de cursos de verano
 * Expone el store y proporciona funciones auxiliares para toasts y manejo de errores
 * 
 * Características:
 * - Persistencia automática con localStorage
 * - Manejo de errores con toasts
 * - Funciones de API con feedback visual
 * - Acceso directo al store para operaciones avanzadas
 */
export function useReservationSummerCourse() {
  
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()
  const { emitStep1Saved, emitStep2Saved, emitStep3Saved } = useStepSaveEvents()

  // Store de reservaciones de cursos de verano
  const store = useReservationSummerCourseStore()
  
  // Verificar que el store esté inicializado
  if (!store) {
    console.error('❌ Store de reservaciones de cursos de verano no se pudo inicializar')
    throw new Error('Store de reservaciones de cursos de verano no disponible')
  }
  
  // Debug: verificar el store (desactivado para reducir verbosidad)
  // console.log('🔍 useReservationSummerCourse - store inicializado:', store)
  // console.log('🔍 useReservationSummerCourse - currentReservation:', store.currentReservation)

  // ============================================================================
  // FUNCIONES AUXILIARES CON TOASTS
  // ============================================================================

  /**
   * Crea una nueva reservación de curso de verano (Paso 1) con toasts
   */
  const createReservationStep1 = async (requestData?: any) => {
    try {
      const result = await store.createReservationStep1(requestData)
      if (result) {
        showSuccess('Éxito', 'Paso 1 completado correctamente. Redirigiendo al paso 2...')
        
        // Emitir evento de guardado exitoso
        emitStep1Saved('curso-verano', result.id || store.currentReservationId.value, result)
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo crear la reservación')
      throw error
    }
  }

  /**
   * Actualiza el paso 1 de una reservación con toasts
   */
  const updateReservationStep1 = async (requestData?: any) => {
    try {
      const result = await store.updateReservationStep1(requestData)
      if (result) {
        showSuccess('Éxito', 'Paso 1 actualizado correctamente')
        emitStep1Saved('curso-verano', store.currentReservationId.value, result)
        
        // Cargar datos del paso 2 y emitir evento para setear en el formulario
        console.log('🔄 Cargando datos del paso 2 para setear en formulario...')
        try {
          const step2Data = await store.loadStep2(store.currentReservationId.value)
          if (step2Data) {
            console.log('✅ Datos del paso 2 cargados, emitiendo evento para setear en formulario...')
            emitStep2Saved('curso-verano', store.currentReservationId.value, step2Data)
          }
        } catch (error) {
          console.error('❌ Error al cargar datos del paso 2:', error)
        }
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo actualizar el paso 1')
      throw error
    }
  }

  /**
   * Crea el paso 2 de una reservación con toasts
   */
  const createReservationStep2 = async () => {
    try {
      const result = await store.createReservationStep2()
      if (result) {
        showSuccess('Éxito', 'Paso 2 completado correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep2Saved('curso-verano', store.currentReservationId.value, result)
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo crear el paso 2')
      throw error
    }
  }

  /**
   * Actualiza el paso 2 de una reservación con toasts
   */
  const updateReservationStep2 = async () => {
    try {
      const result = await store.updateReservationStep2()
      if (result) {
        showSuccess('Éxito', 'Paso 2 actualizado correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep2Saved('curso-verano', store.currentReservationId.value, result)
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo actualizar el paso 2')
      throw error
    }
  }

  /**
   * Verifica si una reservación tiene personas con discapacidad
   * @param {number} reservationId - ID de la reservación
   * @returns {Promise<boolean>} True si tiene personas con discapacidad
   */
  const checkReservationHasDisability = async (reservationId: number): Promise<boolean> => {
    try {
      const hasDisability = await store.checkReservationHasDisability(reservationId)
      return hasDisability
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo verificar si la reservación tiene personas con discapacidad')
      return false
    }
  }

  /**
   * Actualiza el paso 3 de una reservación con toasts
   */
  const updateReservationStep3 = async () => {
    try {
      const result = await store.updateReservationStep3()
      if (result) {
        showSuccess('Éxito', 'Reservación completada correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep3Saved('curso-verano', store.currentReservationId.value, result)
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo completar la reservación')
      throw error
    }
  }

  /**
   * Obtiene reservaciones con filtros opcionales
   */
  const fetchReservations = async (filters?: { id?: number, visitorId?: number, folio?: string }) => {
    try {
      const result = await store.fetchReservations(filters)
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar las reservaciones')
      throw error
    }
  }

  /**
   * Obtiene una reservación específica por ID
   */
  const fetchReservationById = async (id: number) => {
    try {
      const result = await store.fetchReservationById(id)
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo cargar la reservación')
      throw error
    }
  }

  /**
   * Carga los datos del paso 1 de una reservación por ID
   */
  const loadStep1 = async (id: number) => {
    try {
      const result = await store.fetchReservationById(id)
      if (result) {
        // Establecer la reservación actual en el store
        store.setCurrentReservation(result)
        store.setCurrentReservationId(id)
        return true
      }
      return false
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 1')
      throw error
    }
  }

  /**
   * Carga los datos del paso 2 de una reservación por ID
   */
  const loadStep2 = async (reservationId: number) => {
    try {
      const result = await store.loadStep2(reservationId)
      if (!result) {
        showError('Error', 'No se pudieron cargar los datos del paso 2')
        return null
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 2')
      throw error
    }
  }

  /**
   * Carga los datos del paso 3 de una reservación por ID
   */
  const loadStep3 = async (reservationId: number) => {
    try {
      const result = await store.loadStep3(reservationId)
      // Si result es false, significa que ya está cargando, no es un error
      if (result === false) {
        console.log('ℹ️ loadStep3 - Ya se están cargando los datos del paso 3')
        return false
      }
      // Si result es null o undefined, entonces sí hubo un error
      if (!result && result !== false) {
        showError('Error', 'No se pudieron cargar los datos del paso 3')
        return null
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 3')
      throw error
    }
  }

  /**
   * Obtiene reservaciones de un visitante específico
   */
  const fetchReservationsByVisitor = async (visitorId: number) => {
    try {
      const result = await store.fetchReservationsByVisitor(visitorId)
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar las reservaciones del visitante')
      throw error
    }
  }

  /**
   * Limpia errores y muestra mensaje de éxito
   */
  const clearErrorsAndShowSuccess = (message: string) => {
    store.clearAllErrors()
    showSuccess('Éxito', message)
  }

  /**
   * Maneja errores de forma consistente
   */
  const handleError = (error: any, operation: string) => {
    const errorMessage = getErrorMessage(error)
    showError('Error', errorMessage || `No se pudo ${operation}`)
    throw error
  }

  /**
   * Limpia toda la persistencia del localStorage con confirmación
   */
  const clearPersistence = () => {
    try {
      store.clearPersistence()
      showSuccess('Éxito', 'Datos de persistencia limpiados correctamente')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo limpiar la persistencia')
    }
  }

  /**
   * Carga y muestra datos desde localStorage (para debugging)
   */
  const loadFromStorage = () => {
    try {
      store.loadFromStorage()
      showSuccess('Info', 'Datos cargados desde localStorage (ver consola)')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos desde localStorage')
    }
  }

  /**
   * Resetea el formulario y limpia la persistencia
   */
  const resetFormAndPersistence = () => {
    try {
      store.resetForm()
      showSuccess('Éxito', 'Formulario reseteado y persistencia limpiada')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo resetear el formulario')
    }
  }

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Store completo (solo lectura)
    store: readonly(store),

    // Estados reactivos (solo lectura)
    currentReservation: store.currentReservation,
    currentReservationId: store.currentReservationId,
    formData: store.formData,
    reservations: store.reservations,
    currentStep: store.currentStep,
    isCompleted: store.isCompleted,
    costBreakdown: store.costBreakdown,

    // Estados de loading (solo lectura)
    isCreating: store.isCreating,
    isUpdating: store.isUpdating,
    isLoading: store.isLoading,
    isLoadingStep1: store.isLoadingStep1,
    isLoadingStep2: store.isLoadingStep2,
    isLoadingStep3: store.isLoadingStep3,
    isLoadingAny: store.isLoadingAny,

    // Estados de error (solo lectura)
    error: store.error,
    stepErrors: store.stepErrors,

    // Computed properties (solo lectura)
    totalPeople: store.totalPeople,
    isStep1Valid: store.isStep1Valid,
    isStep2Valid: store.isStep2Valid,
    isStep3Valid: store.isStep3Valid,
    reservationStatus: store.reservationStatus,
    
    // Funciones de API con toasts
    createReservationStep1,
    updateReservationStep1,
    createReservationStep2,
    updateReservationStep2,
    updateReservationStep3,
    
    // Funciones de consulta con toasts
    fetchReservations,
    fetchReservationById,
    fetchReservationsByVisitor,
    loadStep1,
    loadStep2,
    loadStep3,
    checkReservationHasDisability,
    
    // Funciones auxiliares
    clearErrorsAndShowSuccess,
    handleError,
    
    // Funciones de persistencia con toasts
    clearPersistence,
    loadFromStorage,
    resetFormAndPersistence,
    
    // Funciones del store (acceso directo)
    resetForm: store.resetForm,
    clearStepError: store.clearStepError,
    clearAllErrors: store.clearAllErrors,
    setCurrentStep: store.setCurrentStep,
    nextStep: store.nextStep,
    previousStep: store.previousStep,
    updateFormData: store.updateFormData,
    updateStepData: store.updateStepData,
    getStepData: store.getStepData,
    setCurrentReservation: store.setCurrentReservation,
    setCurrentReservationId: store.setCurrentReservationId,
    
    // Funciones de persistencia del store (acceso directo)
    clearPersistenceStore: store.clearPersistence,
    loadFromStorageStore: store.loadFromStorage
  }
}
