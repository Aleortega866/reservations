import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store para gestionar el estado de los pasos de reservación
 * 
 * Este store centraliza la información sobre qué pasos están completos
 * y permite verificar el estado de cada paso de manera consistente
 * 
 * @example
 * ```typescript
 * const stepStatusStore = useReservationStepStatusStore()
 * 
 * // Verificar si un paso está completo
 * const isStep1Complete = stepStatusStore.isStepComplete(1)
 * 
 * // Marcar un paso como completo
 * stepStatusStore.markStepComplete(1)
 * 
 * // Cargar estado de todos los pasos
 * await stepStatusStore.loadAllStepsStatus(reservationId, 'general')
 * ```
 */
export const useReservationStepStatusStore = defineStore('reservationStepStatus', () => {
  // ============================================================================
  // ESTADO REACTIVO
  // ============================================================================

  /**
   * Estado de completitud de cada paso
   * 
   * @example
   * ```typescript
   * stepStatus.value = {
   *   1: { complete: true, data: {...}, lastUpdated: '2024-01-15T10:30:00Z' },
   *   2: { complete: false, data: null, lastUpdated: null },
   *   3: { complete: false, data: null, lastUpdated: null }
   * }
   * ```
   */
  const stepStatus = ref<{
    [key: number]: {
      complete: boolean
      data: any | null
      lastUpdated: string | null
    }
  }>({
    1: { complete: false, data: null, lastUpdated: null },
    2: { complete: false, data: null, lastUpdated: null },
    3: { complete: false, data: null, lastUpdated: null }
  })

  /**
   * ID de la reservación actual
   */
  const currentReservationId = ref<number | null>(null)

  /**
   * Tipo de asistente actual
   */
  const currentAttendeeType = ref<string | null>(null)

  /**
   * Indica si se está cargando el estado de los pasos
   */
  const isLoading = ref(false)

  /**
   * Control de duplicaciones - almacena promesas de carga activas
   */
  const loadingPromises = ref<Map<string, Promise<any>>>(new Map())
  
  /**
   * Última clave de carga para evitar duplicaciones
   */
  const lastLoadKey = ref<string | null>(null)

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /**
   * Verifica si un paso específico está completo
   */
  const isStepComplete = computed(() => (step: number) => {
    return stepStatus.value[step]?.complete || false
  })

  /**
   * Obtiene los datos de un paso específico
   */
  const getStepData = computed(() => (step: number) => {
    return stepStatus.value[step]?.data || null
  })

  /**
   * Obtiene la fecha de última actualización de un paso
   */
  const getStepLastUpdated = computed(() => (step: number) => {
    return stepStatus.value[step]?.lastUpdated || null
  })

  /**
   * Verifica si todos los pasos están completos
   */
  const areAllStepsComplete = computed(() => {
    return Object.values(stepStatus.value).every(step => step.complete)
  })

  /**
   * Obtiene el número de pasos completados
   */
  const completedStepsCount = computed(() => {
    return Object.values(stepStatus.value).filter(step => step.complete).length
  })

  /**
   * Obtiene el siguiente paso incompleto
   */
  const nextIncompleteStep = computed(() => {
    for (let i = 1; i <= 3; i++) {
      if (!stepStatus.value[i]?.complete) {
        return i
      }
    }
    return null // Todos los pasos están completos
  })

  // ============================================================================
  // ACCIONES
  // ============================================================================

  /**
   * Marca un paso como completo
   */
  const markStepComplete = (step: number, data?: any) => {
    if (step >= 1 && step <= 3) {
      stepStatus.value[step] = {
        complete: true,
        data: data || stepStatus.value[step]?.data,
        lastUpdated: new Date().toISOString()
      }
      // console.log(`✅ Paso ${step} marcado como completo`, {
      //   step,
      //   hasData: !!data,
      //   dataKeys: data ? Object.keys(data) : []
      // })
    }
  }

  /**
   * Marca un paso como incompleto
   */
  const markStepIncomplete = (step: number) => {
    if (step >= 1 && step <= 3) {
      stepStatus.value[step] = {
        complete: false,
        data: null,
        lastUpdated: null
      }
      console.log(`❌ Paso ${step} marcado como incompleto`)
    }
  }

  /**
   * Actualiza los datos de un paso
   */
  const updateStepData = (step: number, data: any) => {
    if (step >= 1 && step <= 3) {
      stepStatus.value[step] = {
        ...stepStatus.value[step],
        data,
        lastUpdated: new Date().toISOString()
      }
   //   console.log(`📝 Datos del paso ${step} actualizados`)
    }
  }

  /**
   * Establece el ID de la reservación actual
   */
  const setCurrentReservationId = (reservationId: number | null) => {
    currentReservationId.value = reservationId
   // console.log('🆔 ID de reservación establecido:', reservationId)
  }

  /**
   * Establece el tipo de asistente actual
   */
  const setCurrentAttendeeType = (attendeeType: string | null) => {
    currentAttendeeType.value = attendeeType
  //  console.log('👤 Tipo de asistente establecido:', attendeeType)
  }

  /**
   * Resetea el estado de todos los pasos
   */
  const resetAllSteps = () => {
    stepStatus.value = {
      1: { complete: false, data: null, lastUpdated: null },
      2: { complete: false, data: null, lastUpdated: null },
      3: { complete: false, data: null, lastUpdated: null }
    }
    currentReservationId.value = null
    currentAttendeeType.value = null
  //  console.log('🔄 Estado de todos los pasos reseteado')
  }

  /**
   * Carga el estado de todos los pasos para una reservación específica
   */
  const loadAllStepsStatus = async (reservationId: number, attendeeType: string, forceReload: boolean = false) => {
    // console.log('🚨 ADVERTENCIA: loadAllStepsStatus ejecutándose desde reservation-step-status.ts', {
    //   reservationId,
    //   attendeeType,
    //   forceReload,
    //   stackTrace: new Error().stack
    // })
    
    if (!reservationId || !attendeeType) {
      console.warn('❌ No se puede cargar el estado: falta reservationId o attendeeType')
      return
    }

    // Crear clave única para esta carga
    const loadKey = `${reservationId}-${attendeeType}-${forceReload}`
    
    // Si ya hay una carga en progreso para la misma clave, esperar a que termine
    if (loadingPromises.value.has(loadKey)) {
  //    console.log('🔄 Carga ya en progreso, esperando a que termine:', loadKey)
      return await loadingPromises.value.get(loadKey)
    }

    // Si es la misma reservación y no se fuerza la recarga, no hacer nada
    if (!forceReload && currentReservationId.value === reservationId && currentAttendeeType.value === attendeeType && lastLoadKey.value === loadKey) {
 //     console.log('ℹ️ La reservación ya está cargada, omitiendo recarga')
      return
    }

    // Crear la promesa de carga
    const loadPromise = performLoadAllStepsStatus(reservationId, attendeeType, forceReload, loadKey)
    loadingPromises.value.set(loadKey, loadPromise)
    
    try {
      const result = await loadPromise
      return result
    } finally {
      // Limpiar la promesa cuando termine
      loadingPromises.value.delete(loadKey)
    }
  }

  /**
   * Función interna que realiza la carga real de los pasos
   */
  const performLoadAllStepsStatus = async (reservationId: number, attendeeType: string, forceReload: boolean, loadKey: string) => {
    isLoading.value = true
    setCurrentReservationId(reservationId)
    setCurrentAttendeeType(attendeeType)
    lastLoadKey.value = loadKey

    try {
//      console.log(`🔄 Cargando estado de pasos para reservación ${reservationId} (${attendeeType})${forceReload ? ' [FORZADO]' : ''}`)

      // Importar los composables necesarios
      const { useReservationGeneral } = await import('@/composables/reservations/useReservationGeneral')
      const { useReservationSchool } = await import('@/composables/reservations/useReservationSchool')
      const { useReservationCompany } = await import('@/composables/reservations/useReservationCompany')
      const { useReservationSummerCourse } = await import('@/composables/reservations/useReservationSummerCourse')

      let store: any = null

      // Mapear códigos de tipo de reservación de la API a los tipos del frontend
      const mapReservationTypeCode = (code: string): string => {
        const typeMapping: Record<string, string> = {
          'VE': 'empresarial',
          'GE': 'general', 
          'VES': 'escolar',
          'CV': 'curso-verano',
          // Mapeos adicionales para códigos que pueden venir de la persistencia
          'vg': 'general',  // Código abreviado para general
          'em': 'empresarial',  // Código abreviado para empresarial
          'ves': 'escolar',  // Código abreviado para escolar
          'cv': 'curso-verano',  // Código abreviado para curso-verano
          'vcv': 'curso-verano',  // Variante de curso-verano
        }
        
        return typeMapping[code] || code.toLowerCase()
      }

      // Mapear el tipo de asistente
      const mappedAttendeeType = mapReservationTypeCode(attendeeType)
 //     console.log(`🔍 BUG-01: Mapeando tipo de asistente: ${attendeeType} -> ${mappedAttendeeType}`)

      // Obtener el store correspondiente
      switch (mappedAttendeeType) {
        case 'general':
          const { store: generalStore } = useReservationGeneral()
          store = generalStore
          break
        case 'escolar':
          const { store: escolarStore } = useReservationSchool()
          store = escolarStore
          break
        case 'empresarial':
          const { store: companyStore } = useReservationCompany()
          store = companyStore
          break
        case 'curso-verano':
          const { store: summerStore } = useReservationSummerCourse()
          store = summerStore
          break
        default:
          throw new Error(`Tipo de asistente no válido: ${attendeeType} (mapeado a: ${mappedAttendeeType})`)
      }

      // Cargar datos de cada paso - verificar si ya están cargados
      const stepPromises = []

      // Paso 1 - Solo ejecutar si no está ya cargado o si se fuerza la recarga
      if (forceReload || !stepStatus.value[1].complete) {
        // console.log('🚨 ADVERTENCIA: loadStep1 ejecutándose desde reservation-step-status.ts', {
        //   reservationId,
        //   attendeeType,
        //   forceReload,
        //   isStep1Complete: stepStatus.value[1].complete,
        //   stackTrace: new Error().stack
        // })
        
        // 🚨 TINGU ADVERTENCIA: Verificar si ya hay una carga en progreso del paso 1
        if (store.isLoadingStep1) {
        //  console.log('🚨 TINGU ADVERTENCIA: Paso 1 ya está cargándose, omitiendo segunda carga')
          return
        }
        
        // 🚨 TINGU ADVERTENCIA: Verificar si el paso 1 ya está completo (verificación adicional)
        if (stepStatus.value[1].complete) {
       //   console.log('🚨 TINGU ADVERTENCIA: Paso 1 ya está completo, omitiendo carga duplicada')
          return
        }
        
        stepPromises.push(
          store.loadStep1(reservationId)
            .then((data: any) => {
              if (data && isStepDataComplete(1, data, attendeeType)) {
                markStepComplete(1, data)
               // console.log('✅ Paso 1 cargado y marcado como completo')
              } else {
                markStepIncomplete(1)
             //   console.log('❌ Paso 1 no tiene datos completos:', data)
              }
            })
            .catch((error: any) => {
              markStepIncomplete(1)
              console.warn('⚠️ Error al cargar paso 1:', error)
            })
        )
      } else {
      //  console.log('ℹ️ Paso 1 ya está completo, omitiendo carga')
      }

      // Paso 2 - Solo ejecutar si no está ya cargado o si se fuerza la recarga
      if (forceReload || !stepStatus.value[2].complete) {
        stepPromises.push(
          store.loadStep2(reservationId)
            .then((data: any) => {
              if (data && isStepDataComplete(2, data, attendeeType)) {
                markStepComplete(2, data)
            //    console.log('✅ Paso 2 cargado y marcado como completo')
              } else {
                markStepIncomplete(2)
                console.log('❌ Paso 2 no tiene datos completos - campos requeridos vacíos o inválidos:', data)
              }
            })
            .catch((error: any) => {
              markStepIncomplete(2)
           //   console.warn('⚠️ Error al cargar paso 2:', error)
            })
        )
      } else {
      //  console.log('ℹ️ Paso 2 ya está completo, omitiendo carga')
      }

      // Paso 3 - Solo ejecutar si no está ya cargado o si se fuerza la recarga
      if (forceReload || !stepStatus.value[3].complete) {
        stepPromises.push(
          store.loadStep3(reservationId)
            .then((data: any) => {
              if (data && isStepDataComplete(3, data, attendeeType)) {
                markStepComplete(3, data)
                // console.log('✅ Paso 3 cargado y marcado como completo')
              } else {
                markStepIncomplete(3)
                // console.log('❌ Paso 3 no tiene datos completos - campos requeridos vacíos o inválidos:', data)
              }
            })
            .catch((error: any) => {
              markStepIncomplete(3)
              console.warn('⚠️ Error al cargar paso 3:', error)
            })
        )
      } else {
        // console.log('ℹ️ Paso 3 ya está completo, omitiendo carga')
      }

      // Esperar a que se completen todas las cargas
      await Promise.allSettled(stepPromises)

      // console.log('🎉 Estado de todos los pasos cargado:', {
      //   paso1: isStepComplete.value(1),
      //   paso2: isStepComplete.value(2),
      //   paso3: isStepComplete.value(3),
      //   totalCompletos: completedStepsCount.value
      // })

      return {
        success: true,
        reservationId,
        attendeeType,
        stepStatus: stepStatus.value,
        completedSteps: completedStepsCount.value
      }

    } catch (error) {
      console.error('❌ Error al cargar el estado de los pasos:', error)
      // En caso de error, marcar todos como incompletos
      resetAllSteps()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fuerza la recarga de todos los pasos para la reservación actual
   */
  const forceReloadAllSteps = async () => {
    if (!currentReservationId.value || !currentAttendeeType.value) {
      console.warn('❌ No hay reservación actual para recargar')
      return
    }

    console.log('🔄 Forzando recarga de todos los pasos')
    await loadAllStepsStatus(currentReservationId.value, currentAttendeeType.value, true)
  }

  /**
   * Configuración de campos requeridos para cada tipo de reservación y paso
   */
  const stepValidationConfig: Record<string, Record<number, string[]>> = {
    general: {
      1: ['reservationDate', 'visitObjectiveId'],
      2: ['interestTopicId', 'whereAreYouVisitingFromId'],
      3: ['paymentMethodId', 'isTermsAccepted']
    },
    escolar: {
      1: ['reservationDate', 'visitObjectiveId'],
      2: ['primaria', 'secundaria', 'mediaSuperior', 'superior', 'posgrado'],
      3: ['paymentMethodId', 'isTermsAccepted']
    },
    empresarial: {
      1: ['reservationDate', 'visitObjectiveId','companyId','checkInDateId'],
      2: ['mainEconomicConceptId','secondaryEconomicConceptId','fullName', 'email', 'phone', 'isReservationPersonAlsoResponsible', 'isResponsibleNotAssigned'],
      3: ['paymentMethodId', 'confirmsInformationAccuracy']
    },
    'curso-verano': {
      1: ['reservationDate', 'visitObjectiveId'],
      2: ['fullName', 'email', 'phone'],
      3: ['paymentMethodId', 'discoveryChannelId']
    }
  }

  /**
   * Verifica si los datos de un paso están completos según el tipo de reservación
   * Sistema genérico y escalable que funciona para cualquier tipo
   */
  const isStepDataComplete = (step: number, data: any, attendeeType: string): boolean => {
    if (!data) return false

    try {
      const config = stepValidationConfig[attendeeType]
      if (!config || !config[step]) {
        console.warn(`No hay configuración para ${attendeeType} paso ${step}`)
        return false
      }

      const requiredFields = config[step]
      
      // Verificar si todos los campos requeridos están en null/undefined
      // Si es así, significa que el paso no ha sido completado aún
      const allFieldsEmpty = requiredFields.every(field => {
        const value = data[field]
        return value === null || value === undefined || value === ''
      })
      
      if (allFieldsEmpty) {
        // console.log(`ℹ️ Paso ${step} no completado aún - todos los campos requeridos están vacíos`)
        return false
      }
      
      const validationResult = validateFields(data, requiredFields, attendeeType, step)
      
      // console.log(`🔍 Validación ${attendeeType} paso ${step}:`, {
      //   requiredFields,
      //   validationResult,
      //   data: getRelevantDataForLogging(data, requiredFields)
      // })

      return validationResult.isValid
    } catch (error) {
      console.error(`Error al validar paso ${step} para ${attendeeType}:`, error)
      return false
    }
  }

  /**
   * Sistema de validación genérico y escalable
   * Define reglas de validación que se aplican automáticamente
   */
  const validateFields = (data: any, requiredFields: string[], attendeeType: string, step: number) => {
    const results = requiredFields.map(field => {
      const value = data[field]
      const validation = validateField(field, value, attendeeType, step)
      return { field, value, ...validation }
    })

    const isValid = results.every(result => result.isValid)
    const invalidFields = results.filter(result => !result.isValid)

    return {
      isValid,
      results,
      invalidFields: invalidFields.map(f => f.field),
      validFields: results.filter(r => r.isValid).map(f => f.field)
    }
  }

  /**
   * Valida un campo individual con reglas inteligentes
   */
  const validateField = (fieldName: string, value: any, attendeeType: string, step: number) => {
    // Regla 1: Campos de identificación básica (siempre obligatorios)
    if (isBasicIdentityField(fieldName)) {
      return validateBasicField(value)
    }

    // Regla 2: Campos de contacto (siempre obligatorios)
    if (isContactField(fieldName)) {
      return validateContactField(value)
    }

    // Regla 3: Campos de fecha (siempre obligatorios)
    if (isDateField(fieldName)) {
      return validateDateField(value)
    }

    // Regla 4: Campos de ID numérico (siempre obligatorios)
    if (isIdField(fieldName)) {
      return validateIdField(value)
    }

    // Regla 5: Campos de costo (pueden ser 0)
    if (isCostField(fieldName)) {
      return validateCostField(value)
    }

    // Regla 6: Campos de confirmación (deben ser true)
    if (isConfirmationField(fieldName)) {
      return validateConfirmationField(value)
    }

    // Regla 7: Campos booleanos (pueden ser true o false, pero no null/undefined)
    if (isBooleanField(fieldName)) {
      return validateBooleanField(value)
    }

    // Regla 8: Arrays de IDs (pueden estar vacíos según el contexto)
    if (isArrayField(fieldName)) {
      return validateArrayField(value, fieldName, attendeeType, step)
    }

    // Regla por defecto: validación estándar
    return validateStandardField(value)
  }

  // Funciones de identificación de tipos de campos
  const isBasicIdentityField = (fieldName: string) => {
    return ['fullName', 'name', 'companyName', 'institutionName'].includes(fieldName)
  }

  const isContactField = (fieldName: string) => {
    return ['email', 'phone', 'telephone', 'contactEmail'].includes(fieldName)
  }

  const isDateField = (fieldName: string) => {
    return fieldName.includes('Date') || fieldName.includes('date')
  }

  const isIdField = (fieldName: string) => {
    return fieldName.endsWith('Id') && !fieldName.includes('Ids')
  }

  const isCostField = (fieldName: string) => {
    return ['totalCost', 'cost', 'price', 'amount'].includes(fieldName)
  }

  const isBooleanField = (fieldName: string) => {
    return fieldName.startsWith('is') || fieldName.startsWith('has') || fieldName.startsWith('requires') || fieldName.startsWith('confirms')
  }

  const isConfirmationField = (fieldName: string) => {
    return fieldName.startsWith('confirms') || fieldName === 'isTermsAccepted'
  }

  const isArrayField = (fieldName: string) => {
    return fieldName.endsWith('Ids') || fieldName.endsWith('s') && Array.isArray(fieldName)
  }

  // Funciones de validación específicas
  const validateBasicField = (value: any) => ({
    isValid: value !== null && value !== undefined && value !== '',
    reason: value === null || value === undefined ? 'null/undefined' : value === '' ? 'empty string' : 'valid'
  })

  const validateContactField = (value: any) => ({
    isValid: value !== null && value !== undefined && value !== '',
    reason: value === null || value === undefined ? 'null/undefined' : value === '' ? 'empty string' : 'valid'
  })

  const validateDateField = (value: any) => ({
    isValid: value !== null && value !== undefined && value !== '',
    reason: value === null || value === undefined ? 'null/undefined' : value === '' ? 'empty string' : 'valid'
  })

  const validateIdField = (value: any) => ({
    isValid: value !== null && value !== undefined && value !== '' && value > 0,
    reason: value === null || value === undefined ? 'null/undefined' : value === '' ? 'empty string' : 'valid'
  })

  const validateCostField = (value: any) => ({
    isValid: value !== null && value !== undefined,
    reason: value === null || value === undefined ? 'null/undefined' : 'valid'
  })

  const validateBooleanField = (value: any) => ({
    isValid: typeof value === 'boolean',
    reason: value === null || value === undefined ? 'null/undefined' : typeof value !== 'boolean' ? 'not a boolean' : 'valid'
  })
  
  const validateConfirmationField = (value: any) => ({
    isValid: value === true,
    reason: value === null || value === undefined ? 'null/undefined' : value === false ? 'false (confirmation required)' : 'valid'
  })

  const validateArrayField = (value: any, fieldName: string, attendeeType: string, _step: number) => {
    // Para company, mainEconomicConceptId y secondaryEconomicConceptId son enteros, no arrays
    if (attendeeType === 'empresarial' && (fieldName === 'mainEconomicConceptId' || fieldName === 'secondaryEconomicConceptId')) {
      return {
        isValid: typeof value === 'number' || value === null || value === undefined,
        reason: typeof value === 'number' ? 'valid integer' : value === null || value === undefined ? 'null/undefined (optional)' : 'not an integer'
      }
    }

    // Para company, positionTypeIds y specialAssistanceIds son arrays, no enteros
    if (attendeeType === 'empresarial' && (fieldName === 'positionTypeIds' || fieldName === 'specialAssistanceIds')) {
      return {
        isValid: Array.isArray(value) || value === null || value === undefined,
        reason: Array.isArray(value) ? 'valid array' : value === null || value === undefined ? 'null/undefined (optional)' : 'not an array'
      }
    }

    // Arrays opcionales por defecto (pueden estar vacíos)
    const optionalArrays = [
      'mainEconomicConceptIds', 'secondaryEconomicConceptIds', 'specialAssistanceIds',
      'positionTypeIds', 'ageRangeIds', 'discoveryChannelIds'
    ]

    if (optionalArrays.includes(fieldName)) {
      return {
        isValid: Array.isArray(value), // Solo verificar que sea array, puede estar vacío
        reason: Array.isArray(value) ? 'valid array (can be empty)' : 'not an array'
      }
    }

    // Arrays obligatorios (deben tener al menos un elemento)
    return {
      isValid: Array.isArray(value) && value.length > 0,
      reason: !Array.isArray(value) ? 'not an array' : value.length === 0 ? 'empty array' : 'valid array'
    }
  }

  const validateStandardField = (value: any) => ({
    isValid: value !== null && value !== undefined && value !== '',
    reason: value === null || value === undefined ? 'null/undefined' : value === '' ? 'empty string' : 'valid'
  })

  const getRelevantDataForLogging = (data: any, requiredFields: string[]) => {
    const relevantData: any = {}
    requiredFields.forEach(field => {
      relevantData[field] = data[field]
    })
    return relevantData
  }

  /**
   * Agrega o modifica la configuración de validación para un tipo de reservación
   * 
   * @param attendeeType - Tipo de asistente
   * @param step - Número del paso (1, 2, o 3)
   * @param requiredFields - Array de campos requeridos para ese paso
   * 
   * @example
   * ```typescript
   * // Agregar nuevo tipo de reservación
   * addStepValidationConfig('nuevo-tipo', 1, ['reservationDate', 'visitObjectiveId'])
   * 
   * // Modificar paso existente
   * addStepValidationConfig('empresarial', 2, ['fullName', 'email', 'phone', 'companyName'])
   * ```
   */
  const addStepValidationConfig = (attendeeType: string, step: number, requiredFields: string[]) => {
    if (!stepValidationConfig[attendeeType]) {
      stepValidationConfig[attendeeType] = {}
    }
    stepValidationConfig[attendeeType][step] = requiredFields
   // console.log(`✅ Configuración agregada para ${attendeeType} paso ${step}:`, requiredFields)
  }

  /**
   * Obtiene la configuración de validación para un tipo y paso específico
   */
  const getStepValidationConfig = (attendeeType: string, step: number): string[] => {
    return stepValidationConfig[attendeeType]?.[step] || []
  }

  /**
   * Agrega un nuevo tipo de reservación completo
   * 
   * @param attendeeType - Tipo de asistente
   * @param config - Configuración completa para los 3 pasos
   * 
   * @example
   * ```typescript
   * addNewReservationType('nuevo-tipo', {
   *   1: ['reservationDate', 'visitObjectiveId'],
   *   2: ['fullName', 'email', 'phone'],
   *   3: ['paymentMethodId', 'totalCost']
   * })
   * ```
   */
  const addNewReservationType = (attendeeType: string, config: Record<number, string[]>) => {
    stepValidationConfig[attendeeType] = config
 //   console.log(`✅ Nuevo tipo de reservación agregado: ${attendeeType}`, config)
  }

  /**
   * Obtiene todos los tipos de reservación disponibles
   */
  const getAvailableReservationTypes = (): string[] => {
    return Object.keys(stepValidationConfig)
  }

  /**
   * Verifica si se puede navegar a un paso específico
   */
  const canNavigateToStep = (step: number) => {
    if (step === 1) return true // Siempre se puede ir al paso 1
    if (step === 2) return isStepComplete.value(1) // Para ir al paso 2, el paso 1 debe estar completo
    if (step === 3) return isStepComplete.value(2) // Para ir al paso 3, el paso 2 debe estar completo
    return false
  }

  return {
    // Estado
    stepStatus,
    currentReservationId,
    currentAttendeeType,
    isLoading,

    // Computed
    isStepComplete,
    getStepData,
    getStepLastUpdated,
    areAllStepsComplete,
    completedStepsCount,
    nextIncompleteStep,

    // Acciones
    markStepComplete,
    markStepIncomplete,
    updateStepData,
    setCurrentReservationId,
    setCurrentAttendeeType,
    resetAllSteps,
    loadAllStepsStatus,
    forceReloadAllSteps,
    canNavigateToStep,
    isStepDataComplete,
    validateFields,
    validateField,
    addStepValidationConfig,
    getStepValidationConfig,
    addNewReservationType,
    getAvailableReservationTypes
  }
})
