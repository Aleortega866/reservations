// ============================================================================
// USE RESERVATION GENERAL - Composable para Gestión de Reservaciones Generales
// ============================================================================

import { readonly } from 'vue'
import { useReservationGeneralStore } from '@/stores/reservation-general'
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'
import { useStepSaveEvents } from './useStepSaveEvents'

/**
 * Composable simplificado para la gestión de reservaciones generales
 * Expone el store y proporciona funciones auxiliares para toasts y manejo de errores
 * 
 * Características:
 * - Persistencia automática con localStorage
 * - Manejo de errores con toasts
 * - Funciones de API con feedback visual
 * - Acceso directo al store para operaciones avanzadas
 */
export function useReservationGeneral() {
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()
  const { emitStep1Saved, emitStep2Saved, emitStep3Saved } = useStepSaveEvents()

  // Store de reservaciones generales
  const store = useReservationGeneralStore()

  // Verificar que el store esté inicializado
  if (!store) {
    console.error('❌ Store de reservaciones generales no se pudo inicializar')
    throw new Error('Store de reservaciones generales no disponible')
  }

  // Debug: verificar el store
  console.log('🔍 useReservationGeneral - store inicializado:', store)
  console.log('🔍 useReservationGeneral - currentReservation:', store.currentReservation)

  // ============================================================================
  // FUNCIONES AUXILIARES CON TOASTS
  // ============================================================================

  /**
   * Crea una nueva reservación empresarial (Paso 1) con toasts
   */
  const createReservationGeneralStep1 = async (requestData?: any): Promise<any> => {
    try {
      const result = await store.createReservationGeneralStep1(requestData)
      if (result) {
        showSuccess('Éxito', 'Paso 1 completado correctamente. Redirigiendo al paso 2...')
        
        // Emitir evento de guardado exitoso
        emitStep1Saved('general', result || store.currentReservationId.value, result)
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
  const updateReservationGeneralStep1 = async (requestData?: any): Promise<void> => {
    try {
      const result = await store.updateReservationGeneralStep1(requestData)
      if (result) {
        showSuccess('Éxito', 'Paso 1 completado correctamente')
        emitStep1Saved('general', store.currentReservationId.value, result)

        // Cargar datos del paso 2 y emitir evento para setear en el formulario
        console.log('🔄 Cargando datos del paso 2 para setear en formulario...')
        try {
          const step2Data = await store.loadStep2(store.currentReservationId.value)
          if (step2Data) {
            console.log('✅ Datos del paso 2 cargados, emitiendo evento para setear en formulario...')
            emitStep2Saved('general', store.currentReservationId.value, step2Data)
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
   * Actualiza el paso 2 de una reservación con toasts
   */
  const updateReservationGeneralStep2 = async (): Promise<void> => {
    try {
      const result = await store.updateReservationGeneralStep2()
      if (result) {
        showSuccess('Éxito', 'Paso 2 completado correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep2Saved('general', store.currentReservationId.value, result)

        // Cargar datos del paso 3 y emitir evento para setear en el formulario
        console.log('🔄 Cargando datos del paso 3 para setear en formulario...')
        try {
          const step3Data = await store.loadStep3(store.currentReservationId.value)
          if (step3Data) {
            console.log('✅ Datos del paso 3 cargados, emitiendo evento para setear en formulario...')
            emitStep3Saved('general', store.currentReservationId.value, step3Data)
          }
        } catch (error) {
          console.error('❌ Error al cargar datos del paso 3:', error)
        }
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo actualizar el paso 2')
      throw error
    }
  }

  const updateReservationGeneralStep3 = async (): Promise<void> => {
    try {
      const result = await store.updateReservationGeneralStep3()
      if (result) {
        showSuccess('Éxito', 'Reservación completada correctamente')
        
        // Emitir evento de guardado exitoso
        emitStep3Saved('general', store.currentReservationId.value, result)
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo completar la reservación')
      throw error
    }
  }

  const getAllReservationGeneralObjectiveVisit = async (): Promise<any> => {
    try {
      const result = await store.getAllReservationGeneralObjectiveVisit()
      return result
    } catch (error) {
      console.log('Error al obtener los objetivos de la visita desde useReservartionGeneral')
      // const errorMessage = getErrorMessage(error as any)
      // showError('Error', errorMessage || 'No se pudo completar la reservación')
      throw error
    }
  }

  const getAllLinkingCodes = async (code: string, getDisabledCodes:boolean | undefined = false): Promise<any> => {
    try {
      const result = await store.getAllLinkingCodes(code, getDisabledCodes)
      return result
    } catch (error) {
      console.log('Error al obtener el codigo desde useReservartionGeneral')
      // const errorMessage = getErrorMessage(error as any)
      // showError('Error', errorMessage || 'No se pudo completar la reservación')
      throw error
    }
  }

  /**
   * Carga los datos del paso 1 con manejo de errores
   */
  const loadStep1 = async (reservationId: number): Promise<void> => {
    try {
      const result = await store.loadStep1(reservationId)
      if (!result) {
        showError('Error', 'No se pudieron cargar los datos del paso 1')
      }
      return result
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudieron cargar los datos del paso 1')
      throw error
    }
  }

  /**
   * Carga los datos del paso 2 con manejo de errores
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
   * Carga los datos del paso 3 con manejo de errores
   */
  const loadStep3 = async (reservationId: number) => {
    try {
      const result = await store.loadStep3(reservationId)
      if (!result) {
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
   * Limpia errores y muestra mensaje de éxito
   */
  const clearErrorsAndShowSuccess = (message: string): void => {
    store.clearAllErrors()
    showSuccess('Éxito', message)
  }

  /**
   * Maneja errores de forma consistente
   */
  const handleError = (error: any, operation: string): void => {
    const errorMessage = getErrorMessage(error)
    showError('Error', errorMessage || `No se pudo ${operation}`)
    throw error
  }

  /**
   * Limpia toda la persistencia del localStorage con confirmación
   */
  const clearPersistence = (): void => {
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
  const loadFromStorage = (): void => {
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
  const resetFormAndPersistence = (): void => {
    try {
      store.resetForm()
      showSuccess('Éxito', 'Formulario reseteado y persistencia limpiada')
    } catch (error) {
      const errorMessage = getErrorMessage(error as any)
      showError('Error', errorMessage || 'No se pudo resetear el formulario')
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
    createReservationGeneralStep1,
    updateReservationGeneralStep1,
    updateReservationGeneralStep2,
    updateReservationGeneralStep3,
    getAllReservationGeneralObjectiveVisit,
    getAllLinkingCodes,
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