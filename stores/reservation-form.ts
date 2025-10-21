import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store para manejar el estado del formulario de reservaciones
 * 
 * Este store centraliza toda la lógica relacionada con:
 * - Selección del tipo de asistente
 * - Navegación entre pasos del formulario
 * - Almacenamiento de datos por paso
 * - Validación de pasos
 * - Persistencia de datos
 * 
 * @example
 * ```typescript
 * const reservationStore = useReservationFormStore()
 * 
 * // Seleccionar tipo de asistente
 * reservationStore.setAttendeeType('general')
 * 
 * // Actualizar datos del paso 1
 * reservationStore.updateStepData(1, { visitDate: '2024-01-15' })
 * 
 * // Navegar al siguiente paso
 * reservationStore.goToNextStep()
 * ```
 */
export const useReservationFormStore = defineStore('reservationForm', () => {
  // ============================================================================
  // ESTADO REACTIVO
  // ============================================================================

  /**
   * Tipo de asistente seleccionado por el usuario
   * 
   * @example
   * - 'general' - Visita general
   * - 'empresarial' - Visita empresarial
   * - 'escolar' - Visita escolar
   * - null - Ningún tipo seleccionado
   */
  const selectedAttendeeType = ref<string | null>(null)

  /**
   * Paso actual del formulario de reservación
   * 
   * @example
   * - 1 - Selección de tipo y fechas
   * - 2 - Información del representante
   * - 3 - Confirmación final
   */
  const currentStep = ref(1)

  /**
   * ID de la reservación que se está editando (si es una edición)
   * 
   * @example
   * - null - Nueva reservación
   * - 751 - Editando reservación existente
   */
  const reservationId = ref<number | null>(null)

  /**
   * Datos del formulario organizados por pasos
   * 
   * @example
   * ```typescript
   * formData.value = {
   *   step1: { visitDate: '2024-01-15', visitObjective: 'educativo' },
   *   step2: { representativeName: 'Juan Pérez', representativeEmail: 'juan@email.com' },
   *   step3: { confirmed: true, termsAccepted: true }
   * }
   * ```
   */
  const formData = ref<{
    step1: Record<string, any>
    step2: Record<string, any>
    step3: Record<string, any>
  }>({
    step1: {},
    step2: {},
    step3: {}
  })

  /**
   * Indica si el usuario ha comenzado a llenar el formulario
   * 
   * @description
   * Esta bandera se activa cuando el usuario selecciona un tipo de asistente.
   * Se usa para controlar cuándo mostrar el formulario y cuándo mostrar
   * la alerta de cambios sin guardar.
   */
  const isFormStarted = ref(false)

  /**
   * Timestamp de la última modificación del formulario
   * 
   * @description
   * Se actualiza cada vez que se modifica cualquier parte del formulario.
   * Útil para detectar cambios recientes y para debugging.
   * 
   * @example
   * // Obtener fecha legible
   * const lastUpdateDate = new Date(lastUpdated.value)
   * console.log('Última modificación:', lastUpdateDate.toLocaleString())
   */
  const lastUpdated = ref(Date.now())

  // ============================================================================
  // GETTERS COMPUTADOS
  // ============================================================================

  /**
   * Verifica si hay un tipo de asistente seleccionado
   * 
   * @returns true si hay un tipo seleccionado, false en caso contrario
   * 
   * @example
   * ```typescript
   * if (hasAttendeeType.value) {
   *   console.log('Tipo seleccionado:', selectedAttendeeType.value)
   * } else {
   *   console.log('No hay tipo seleccionado')
   * }
   * ```
   */
  const hasAttendeeType = computed(() => {
    const hasType = !!selectedAttendeeType.value
    return hasType
  })

  /**
   * Determina si se debe mostrar el formulario
   * 
   * @returns true si se puede mostrar el formulario, false en caso contrario
   * 
   * @description
   * El formulario solo se muestra cuando:
   * 1. El usuario ha comenzado a llenar (isFormStarted = true)
   * 2. Hay un tipo de asistente seleccionado
   * 
   * Esta validación previene mostrar formularios vacíos o incompletos.
   * 
   * @example
   * ```vue
   * <template>
   *   <div v-if="canShowForm">
   *     <!-- Formulario visible solo cuando se cumplan las condiciones -->
   *     <ReservationForm />
   *   </div>
   * </template>
   * ```
   */
  const canShowForm = computed(() => {
    // Solo mostrar el formulario si hay un tipo seleccionado Y el formulario está iniciado
    const canShow = isFormStarted.value && !!selectedAttendeeType.value
    return canShow
  })

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================

  /**
   * Valida si un paso específico del formulario es válido
   * 
   * @param {number} step - Número del paso a validar (1, 2, o 3)
   * @returns {boolean} true si el paso es válido, false en caso contrario
   * 
   * @description
   * La validación es progresiva:
   * - Paso 1: Solo necesita tener tipo de asistente seleccionado
   * - Paso 2: Necesita tipo de asistente + datos del paso 1 completos
   * - Paso 3: Necesita tipo + datos del paso 1 + datos del paso 2
   * 
   * @example
   * ```typescript
   * // Verificar si se puede ir al paso 2
   * if (isStepValid(2)) {
   *   console.log('Paso 2 es válido, se puede navegar')
   * } else {
   *   console.log('Paso 2 no es válido, completar paso 1 primero')
   * }
   * ```
   */
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!selectedAttendeeType.value
      case 2:
        return !!selectedAttendeeType.value && 
               formData.value.step1.saved === true
      case 3:
        return !!selectedAttendeeType.value && 
               formData.value.step1.saved === true && 
               formData.value.step2.saved === true
      default:
        return false
    }
  }

  // ============================================================================
  // FUNCIONES DE ACCIÓN
  // ============================================================================

  /**
   * Establece el tipo de asistente seleccionado
   * 
   * @param {string} type - Tipo de asistente seleccionado
   * @description
   * Esta función es el punto de entrada principal del formulario.
   * Cuando se llama:
   * 1. Se almacena el tipo seleccionado
   * 2. Se marca que el formulario ha comenzado
   * 3. Se actualiza el timestamp de última modificación
   * 
   * @example
   * ```typescript
   * // Usuario selecciona visita general
   * setAttendeeType('general')
   * 
   * // Ahora canShowForm será true y se mostrará el formulario
   * console.log(canShowForm.value) // true
   * ```
   */
  const setAttendeeType = (type: string) => {
    // Limpiar stores específicos cuando se cambia el tipo de asistente
    if (process.client) {
      // Limpiar store de reservaciones generales
      if (type === 'general') {
        import('@/stores/reservation-general').then(({ useReservationGeneralStore }) => {
          const generalStore = useReservationGeneralStore()
          generalStore.resetForm()
        })
      }
      
      // Limpiar store de reservaciones escolares
      if (type === 'escolar') {
        import('@/stores/reservation-school').then(({ useReservationSchoolStore }) => {
          const schoolStore = useReservationSchoolStore()
          schoolStore.resetForm()
        })
      }
      
      // Limpiar store de reservaciones empresariales
      if (type === 'empresarial') {
        import('@/stores/reservation-company').then(({ useReservationCompanyStore }) => {
          const companyStore = useReservationCompanyStore()
          companyStore.resetForm()
        })
      }
      
      // Limpiar store de cursos de verano
      if (type === 'curso-verano') {
        import('@/stores/reservation-summer-course').then(({ useReservationSummerCourseStore }) => {
          const summerStore = useReservationSummerCourseStore()
          summerStore.resetForm()
        })
      }
    }
    
    selectedAttendeeType.value = type
    isFormStarted.value = true
    lastUpdated.value = Date.now()
  }

  /**
   * Cambia el paso actual del formulario
   * 
   * @param {number} step - Número del paso al que navegar (1, 2, o 3)
   * @description
   * Solo permite navegar a pasos válidos (entre 1 y 3).
   * Actualiza el timestamp de última modificación.
   * 
   * @example
   * ```typescript
   * // Ir al paso 2
   * setCurrentStep(2)
   * console.log(currentStep.value) // 2
   * 
   * // Intentar ir a un paso inválido
   * setCurrentStep(5) // No hace nada, currentStep sigue siendo 2
   * ```
   */
  const setCurrentStep = (step: number) => {
    if (step >= 1 && step <= 3) {
      currentStep.value = step
      lastUpdated.value = Date.now()
    }
  }

  /**
   * Actualiza los datos de un paso específico del formulario
   * 
   * @param {number} step - Número del paso a actualizar (1, 2, o 3)
   * @param {Record<string, any>} data - Datos a agregar/actualizar en el paso
   * @description
   * Los datos se fusionan con los existentes usando spread operator.
   * Esto significa que no se sobrescriben datos existentes, solo se agregan/actualizan.
   * Siempre actualiza el timestamp de última modificación.
   * 
   * @example
   * ```typescript
   * // Actualizar datos del paso 1
   * updateStepData(1, { visitDate: '2024-01-15' })
   * 
   * // Agregar más datos al mismo paso
   * updateStepData(1, { visitObjective: 'educativo' })
   * 
   * // Resultado: formData.step1 = { visitDate: '2024-01-15', visitObjective: 'educativo' }
   * ```
   */
  const updateStepData = (step: number, data: any) => {
    switch (step) {
      case 1:
        formData.value.step1 = { ...formData.value.step1, ...data }
        break
      case 2:
        formData.value.step2 = { ...formData.value.step2, ...data }
        break
      case 3:
        formData.value.step3 = { ...formData.value.step3, ...data }
        break
    }
    lastUpdated.value = Date.now()
  }

  /**
   * Obtiene los datos de un paso específico del formulario
   * 
   * @param {number} step - Número del paso del cual obtener datos (1, 2, o 3)
   * @returns {Record<string, any>} Datos del paso especificado o objeto vacío si el paso no existe
   * 
   * @example
   * ```typescript
   * // Obtener datos del paso 1
   * const step1Data = getStepData(1)
   * console.log('Datos del paso 1:', step1Data)
   * 
   * // Obtener datos de un paso inexistente
   * const invalidData = getStepData(5) // Retorna {}
   * ```
   */
  const getStepData = (step: number): any => {
    switch (step) {
      case 1:
        return formData.value.step1
      case 2:
        return formData.value.step2
      case 3:
        return formData.value.step3
      default:
        return {}
    }
  }

  /**
   * Reinicia completamente el formulario a su estado inicial
   * 
   * @description
   * Esta función limpia todos los datos y vuelve al estado inicial:
   * - Limpia el tipo de asistente seleccionado
   * - Vuelve al primer paso
   * - Limpia todos los datos de todos los pasos
   * - Marca el formulario como no iniciado
   * - Actualiza el timestamp
   * 
   * @example
   * ```typescript
   * // Usuario completa la reservación exitosamente
   * await completeReservation()
   * 
   * // Limpiar para nueva reservación
   * resetForm()
   * 
   * // Ahora el formulario está listo para una nueva reservación
   * console.log(currentStep.value) // 1
   * console.log(isFormStarted.value) // false
   * ```
   */
  const resetForm = () => {
    selectedAttendeeType.value = null
    currentStep.value = 1
    reservationId.value = null
    formData.value = {
      step1: {},
      step2: {},
      step3: {}
    }
    isFormStarted.value = false
    lastUpdated.value = Date.now()
  }

  /**
   * Inicializa el formulario para una nueva sesión
   * 
   * @description
   * Esta función se debe llamar al iniciar una nueva sesión de reservación.
   * Limpia cualquier estado persistido para asegurar que el usuario
   * siempre vea primero el selector de tipo de visita.
   * 
   * @example
   * ```typescript
   * // Al cargar la página de reservaciones
   * initializeNewSession()
   * 
   * // Ahora el usuario verá el selector de tipo de visita
   * console.log(canShowForm.value) // false
   * console.log(selectedAttendeeType.value) // null
   * ```
   */
  const initializeNewSession = () => {
    // Solo limpiar si no hay una sesión activa en progreso
    // Esto permite que el usuario continúe una reservación en progreso
    // pero limpia sesiones completadas o abandonadas
    const timeSinceLastUpdate = Date.now() - lastUpdated.value
    const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos
    
    if (timeSinceLastUpdate > SESSION_TIMEOUT || !isFormStarted.value) {
      resetForm()
    }
  }

  /**
   * Alias para resetForm - Limpia completamente el formulario
   * 
   * @description
   * Función de conveniencia que simplemente llama a resetForm.
   * Útil para casos donde se prefiere un nombre más descriptivo.
   * 
   * @example
   * ```typescript
   * // Usuario cancela la reservación
   * clearForm() // Equivalente a resetForm()
   * ```
   */
  const clearForm = () => {
    resetForm()
  }

  /**
   * Limpia todos los stores específicos de reservaciones
   * 
   * @description
   * Esta función limpia todos los stores específicos (empresarial, curso-verano, etc.)
   * sin importar cuál esté activo. Útil para limpieza completa del sistema.
   * 
   * @example
   * ```typescript
   * // Limpiar todos los stores al cerrar sesión
   * clearAllSpecificStores()
   * ```
   */
  const clearAllSpecificStores = () => {
    if (process.client) {
      // Limpiar store de reservaciones generales
      import('@/stores/reservation-general').then(({ useReservationGeneralStore }) => {
        const generalStore = useReservationGeneralStore()
        generalStore.resetForm()
       
      }).catch(() => {
        // Store no cargado, no hay nada que limpiar
      })

      // Limpiar store de reservaciones escolares
      import('@/stores/reservation-school').then(({ useReservationSchoolStore }) => {
        const escolarStore = useReservationSchoolStore()
        escolarStore.resetForm()
       
      }).catch(() => {
        // Store no cargado, no hay nada que limpiar
      })

      // Limpiar store de reservaciones empresariales
      import('@/stores/reservation-company').then(({ useReservationCompanyStore }) => {
        const companyStore = useReservationCompanyStore()
        companyStore.resetForm()

      }).catch(() => {
        // Store no cargado, no hay nada que limpiar
      })
      
      // Limpiar store de cursos de verano
      import('@/stores/reservation-summer-course').then(({ useReservationSummerCourseStore }) => {
        const summerStore = useReservationSummerCourseStore()
        summerStore.resetForm()

      }).catch(() => {
        // Store no cargado, no hay nada que limpiar
      })
    }
  }

  /**
   * Navega al siguiente paso del formulario
   * 
   * @description
   * Solo permite avanzar si no estamos en el último paso (3).
   * Actualiza el timestamp de última modificación.
   * 
   * @example
   * ```typescript
   * // Desde el paso 1
   * goToNextStep() // currentStep = 2
   * 
   * // Desde el paso 2
   * goToNextStep() // currentStep = 3
   * 
   * // Desde el paso 3 (último)
   * goToNextStep() // No hace nada, currentStep sigue siendo 3
   * ```
   */
  const goToNextStep = () => {
    if (currentStep.value < 3) {
      setCurrentStep(currentStep.value + 1)
    }
  }

  /**
   * Navega al paso anterior del formulario
   * 
   * @description
   * Solo permite retroceder si no estamos en el primer paso (1).
   * Actualiza el timestamp de última modificación.
   * 
   * @example
   * ```typescript
   * // Desde el paso 3
   * goToPreviousStep() // currentStep = 2
   * 
   * // Desde el paso 2
   * goToPreviousStep() // currentStep = 1
   * 
   * // Desde el paso 1 (primero)
   * goToPreviousStep() // No hace nada, currentStep sigue siendo 1
   * ```
   */
  const goToPreviousStep = () => {
    if (currentStep.value > 1) {
      setCurrentStep(currentStep.value - 1)
    }
  }

  /**
   * Verifica si se puede navegar a un paso específico
   * 
   * @param {number} step - Número del paso al que se quiere navegar
   * @returns {boolean} true si se puede navegar al paso, false en caso contrario
   * 
   * @description
   * La validación se basa en si el paso anterior es válido.
   * Esto previene saltos de pasos sin completar los anteriores.
   * 
   * @example
   * ```typescript
   * // Verificar si se puede ir al paso 2
   * if (canGoToStep(2)) {
   *   console.log('Se puede navegar al paso 2')
   *   goToNextStep()
   * } else {
   *   console.log('Completar paso 1 primero')
   * }
   * ```
   */
  const canGoToStep = (step: number) => {
    return isStepValid(step - 1)
  }

  /**
   * Establece el ID de la reservación que se está editando
   * 
   * @param {number | null} id - ID de la reservación (null para nueva reservación)
   * 
   * @example
   * ```typescript
   * // Establecer ID para editar reservación existente
   * setReservationId(751)
   * 
   * // Limpiar ID para nueva reservación
   * setReservationId(null)
   * ```
   */
  const setReservationId = (id: number | null) => {
    reservationId.value = id
  }

  // ============================================================================
  // RETORNO DEL STORE
  // ============================================================================

  return {
    // Estado
    selectedAttendeeType,
    currentStep,
    reservationId,
    formData,
    isFormStarted,
    lastUpdated,
    
    // Getters
    hasAttendeeType,
    canShowForm,
    isStepValid,
    
    // Actions
    setAttendeeType,
    setCurrentStep,
    setReservationId,
    updateStepData,
    getStepData,
    resetForm,
    clearForm,
    clearAllSpecificStores,
    initializeNewSession,
    goToNextStep,
    goToPreviousStep,
    canGoToStep
  }
}, {
  /**
   * Configuración de persistencia del store
   * 
   * @description
   * Habilita la persistencia automática del estado en localStorage.
   * Esto significa que:
   * - Los datos se guardan automáticamente en el navegador
   * - Los datos se restauran al recargar la página
   * - El estado se mantiene entre sesiones del navegador
   * - Los datos se sincronizan entre pestañas del mismo dominio
   */
  persist: true
})
