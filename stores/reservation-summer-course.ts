import { ref, computed } from 'vue' 
import { reservationSummerCourseService } from '@/lib/api/services/reservations/reservation.summer-course.service' 
import { useLocalStorage, clearLocalStorage } from '@/composables/utils/useLocalStorage'
import { useAuthStore } from '@/stores/auth'
import type { ReservationSummerCourse,
  ReservationSummerCourseFormData,
  CreateReservationSummerCourseStep1Request,
  UpdateReservationSummerCourseStep2Request,
  UpdateReservationSummerCourseStep3Request,
  CostBreakdown } from '@/lib/api/types/reservation/summer-course'

  // Definir defineStore si no está disponible 
  const defineStore = (_id: string, setup: any) => { return () => setup() }



  export const useReservationSummerCourseStore = defineStore(
    'reservation-summer-course',
    () => {
    
    // ============================================================================
    // CLAVES DE LOCALSTORAGE
    // ============================================================================
    
    const STORAGE_KEYS = {
      FORM_DATA: 'reservation-summer-course-form-data',
      CURRENT_STEP: 'reservation-summer-course-current-step',
      CURRENT_RESERVATION_ID: 'reservation-summer-course-current-id',
      IS_COMPLETED: 'reservation-summer-course-is-completed'
    }
    
    // ============================================================================
    // AUTH STORE
    // ============================================================================
    
    const authStore = useAuthStore()
    
    /**
     * Obtiene el ID del usuario autenticado para usar en userModifiedId
     * @throws {Error} Si el usuario no está autenticado
     */
    const getUserModifiedId = (): number => {
      const userId = authStore.currentUser?.userId
      if (!userId) {
        throw new Error('Usuario no autenticado. Por favor inicia sesión.')
      }
      return userId
    }
    
    // ============================================================================
    // ESTADOS REACTIVOS CON PERSISTENCIA
    // ============================================================================
  
    // Estados de loading granulares
    const isCreating = ref(false)
    const isUpdating = ref(false)
    const isLoading = ref(false)
    const isLoadingStep1 = ref(false)
    const isLoadingStep2 = ref(false)
    const isLoadingStep3 = ref(false)
  
    // Estados de error
    const error = ref<string | null>(null)
    const stepErrors = ref({
      step1: null as string | null,
      step2: null as string | null,
      step3: null as string | null
    })

    // Datos de la reservación actual
    const currentReservation = ref<ReservationSummerCourse | null>(null)

    // Desglose de costos del paso 3 (se obtiene del endpoint getStep3)
    const costBreakdown = ref<CostBreakdown | null>(null)
    
    // Datos del formulario actual con persistencia (mapea a ReservationSummerCourseStep1CreateCmd)
    const defaultFormData: ReservationSummerCourseFormData = {
      // Paso 1 (compatible con ReservationSummerCourseStep1CreateCmd)
      visitorId: null,
      visitObjectiveId: null,
      totalKids: 0,
      totalKidsWithDisabilities: 0,
      totalAdults: 0,
      totalAdultsWithDisabilities: 0,
      totalSeniors: 0,
      totalSeniorsWithDisabilities: 0,
      totalYoungAdults: 0,
      totalYoungAdultsWithDisabilities: 0,
      totalTeenagers: 0,
      totalTeenagersWithDisabilities: 0,
      reservationDate: '',
      checkInDateId: null,
      institutionNameId: null,
      userModifiedId: null,

      // Paso 2
      isReservationPersonAlsoResponsible: null,
      isResponsibleNotAssigned: null,
      fullName: '',
      email: '',
      phone: '',
      specialAssistances: [],
      mainEconomicConceptId: null,
      secondaryEconomicConceptId: null,

      // Paso 3
      discoveryChannelId: null,
      paymentMethodId: null,
      requiresDetailedLocationInformation: null,
      requestsPostVisitInvoice: null,
      confirmsInformationAccuracy: null,
      workShopsIds: [],
      totalPeople: null,
      totalCost: null
    }
    
    const formData = useLocalStorage(STORAGE_KEYS.FORM_DATA, defaultFormData)
    const currentReservationId = useLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID, null as number | null)
  
    // 🔍 DEBUG: Verificar valores iniciales desde localStorage
    // if (process.client) {
    //   console.log('🔍 Store Summer Course inicializado:')
    //   console.log('  - currentReservationId:', currentReservationId.value)
    //   console.log('  - formData.visitorId:', formData.value.visitorId)
    //   console.log('  - formData.institutionNameId:', formData.value.institutionNameId)
    //   console.log('  - formData.fullName:', formData.value.fullName)
    //   console.log('  - formData.email:', formData.value.email)
    // }
  
    // Lista de reservaciones
    const reservations = ref<ReservationSummerCourse[]>([])
  
    // Estado del proceso actual con persistencia
    const currentStep = useLocalStorage(STORAGE_KEYS.CURRENT_STEP, 1 as 1 | 2 | 3)
    const isCompleted = useLocalStorage(STORAGE_KEYS.IS_COMPLETED, false)
  
    // ============================================================================
    // COMPUTED PROPERTIES
    // ============================================================================
  
    // Estado de loading consolidado
    const isLoadingAny = computed(() => 
      isCreating.value || 
      isUpdating.value || 
      isLoading.value ||
      isLoadingStep1.value ||
      isLoadingStep2.value ||
      isLoadingStep3.value
    )
  
    // Total de personas calculado (incluyendo todos los grupos de edad)
    const totalPeople = computed(() =>
      formData.value.totalKids +
      formData.value.totalTeenagers +
      formData.value.totalYoungAdults +
      formData.value.totalAdults +
      formData.value.totalSeniors
    )

    // Validación del paso 1 (compatible con ReservationSummerCourseStep1CreateCmd)
    const isStep1Valid = computed(() => {
      const data = formData.value
      return !!(
        data.visitorId &&
        data.reservationDate &&
        data.checkInDateId &&
        data.visitObjectiveId &&
        data.institutionNameId &&
        totalPeople.value > 0
      )
    })
  
    // Validación del paso 2
    const isStep2Valid = computed(() => {
      const data = formData.value
      if (data.isResponsibleNotAssigned === false) {
        return !!(
          data.fullName?.trim() &&
          data.email?.trim() &&
          data.phone?.trim()
        )
      }
      return true
    })
  
    // Validación del paso 3
    const isStep3Valid = computed(() => {
      const data = formData.value
      console.log('🔍 Validando paso 3 summer course:')
      console.log('  - confirmsInformationAccuracy:', data.confirmsInformationAccuracy)
      console.log('  - workShopsIds:', data.workShopsIds)
      
      // Solo validar que confirmsInformationAccuracy sea true
      const isValid = data.confirmsInformationAccuracy === true
      console.log('🔍 Validación paso 3 resultado:', isValid)
      return isValid
    })
  
    // Estado de la reservación actual
    const reservationStatus = computed(() => {
      if (!currentReservation.value) return 'draft'
      return currentReservation.value.status
    })
  
    // ============================================================================
    // FUNCIONES AUXILIARES
    // ============================================================================
  
    /**
     * Limpia errores de un paso específico
     */
    const clearStepError = (step: 1 | 2 | 3) => {
      stepErrors.value[`step${step}` as keyof typeof stepErrors.value] = null
    }
  
    /**
     * Limpia todos los errores
     */
    const clearAllErrors = () => {
      error.value = null
      stepErrors.value = {
        step1: null,
        step2: null,
        step3: null
      }
    }
  
    /**
     * Resetea el formulario a su estado inicial y limpia la persistencia
     */
    const resetForm = () => {
      formData.value = { ...defaultFormData }
      currentReservation.value = null
      currentReservationId.value = null
      currentStep.value = 1
      isCompleted.value = false
      clearAllErrors()
    }
    
    /**
     * Limpia toda la persistencia del localStorage
     */
    const clearPersistence = () => {
      clearLocalStorage(STORAGE_KEYS.FORM_DATA)
      clearLocalStorage(STORAGE_KEYS.CURRENT_STEP)
      clearLocalStorage(STORAGE_KEYS.CURRENT_RESERVATION_ID)
      clearLocalStorage(STORAGE_KEYS.IS_COMPLETED)
      console.log('🗑️ Persistencia limpiada del localStorage')
    }
    
    /**
     * Carga datos desde localStorage (útil para debugging)
     */
    const loadFromStorage = () => {
      if (process.client) {
        // console.log('📂 Datos cargados desde localStorage:')
        // console.log('- FormData:', formData.value)
        // console.log('- CurrentStep:', currentStep.value)
        // console.log('- CurrentReservationId:', currentReservationId.value)
        // console.log('- IsCompleted:', isCompleted.value)
      }
    }
  
    // ============================================================================
    // OPERACIONES DE RESERVACIÓN
    // ============================================================================
  
    /**
     * Establece la reservación actual
     */
    const setCurrentReservation = (reservation: ReservationSummerCourse) => {
      currentReservation.value = reservation
      currentReservationId.value = typeof reservation.id === 'string' ? parseInt(reservation.id, 10) : reservation.id
      //console.log('✅ Reservación actual establecida:', reservation.id)
    }
  
    /**
     * Establece solo el ID de la reservación actual
     */
    const setCurrentReservationId = (id: number | string) => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      currentReservationId.value = numericId
     // console.log('✅ ID de reservación actual establecido:', numericId)
    }
  
    /**
     * Actualiza los datos del formulario
     */
    const updateFormData = (updates: Partial<ReservationSummerCourseFormData>) => {
      Object.assign(formData.value, updates)
      //console.log('📝 Datos del formulario actualizados:', updates)
    }
  
    /**
     * Actualiza los datos de un paso específico
     */
    const updateStepData = (step: 1 | 2 | 3, data: any) => {
      switch (step) {
        case 1:
          // Actualizar con los campos del comando ReservationSummerCourseStep1CreateCmd
          updateFormData({
            visitorId: data.visitorId,
            visitObjectiveId: data.visitObjectiveId,
            totalKids: data.totalKids,
            totalKidsWithDisabilities: data.totalKidsWithDisabilities,
            totalAdults: data.totalAdults,
            totalAdultsWithDisabilities: data.totalAdultsWithDisabilities,
            totalSeniors: data.totalSeniors,
            totalSeniorsWithDisabilities: data.totalSeniorsWithDisabilities,
            totalYoungAdults: data.totalYoungAdults,
            totalYoungAdultsWithDisabilities: data.totalYoungAdultsWithDisabilities,
            totalTeenagers: data.totalTeenagers,
            totalTeenagersWithDisabilities: data.totalTeenagersWithDisabilities,
            reservationDate: data.reservationDate,
            checkInDateId: data.checkInDateId,
            institutionNameId: data.institutionNameId,
            userModifiedId: data.userModifiedId
          })
          // Actualizar también el store principal
          if (process.client) {
            import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
              const mainStore = useReservationFormStore()
              mainStore.updateStepData(1, { saved: true, timestamp: Date.now() })
            })
          }
          break
        case 2:
          updateFormData({
            isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: data.isResponsibleNotAssigned,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            specialAssistances: data.specialAssistances,
            mainEconomicConceptId: data.mainEconomicConceptId,
            secondaryEconomicConceptId: data.secondaryEconomicConceptId,
            userModifiedId: data.userModifiedId
          })
          // Actualizar también el store principal
          if (process.client) {
            import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
              const mainStore = useReservationFormStore()
              mainStore.updateStepData(2, { saved: true, timestamp: Date.now() })
            })
          }
          break
        case 3:
          updateFormData({
            discoveryChannelId: data.discoveryChannelId,
            paymentMethodId: data.paymentMethodId,
            requiresDetailedLocationInformation: data.requiresDetailedLocationInformation,
            requestsPostVisitInvoice: data.requestsPostVisitInvoice,
            confirmsInformationAccuracy: data.confirmsInformationAccuracy,
            workShopsIds: data.workShopsIds,
            totalPeople: data.totalPeople,
            totalCost: data.totalCost,
            userModifiedId: data.userModifiedId
          })
          // Actualizar también el store principal
          if (process.client) {
            import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
              const mainStore = useReservationFormStore()
              mainStore.updateStepData(3, { saved: true, timestamp: Date.now() })
            })
          }
          break
      }
    }
  
    /**
     * Obtiene los datos de un paso específico
     */
    const getStepData = (step: 1 | 2 | 3) => {
      switch (step) {
        case 1:
          // Devolver los campos del comando ReservationSummerCourseStep1CreateCmd
          return {
            visitorId: formData.value.visitorId,
            visitObjectiveId: formData.value.visitObjectiveId,
            totalKids: formData.value.totalKids,
            totalKidsWithDisabilities: formData.value.totalKidsWithDisabilities,
            totalAdults: formData.value.totalAdults,
            totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities,
            totalSeniors: formData.value.totalSeniors,
            totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities,
            totalYoungAdults: formData.value.totalYoungAdults,
            totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities,
            totalTeenagers: formData.value.totalTeenagers,
            totalTeenagersWithDisabilities: formData.value.totalTeenagersWithDisabilities,
            reservationDate: formData.value.reservationDate,
            checkInDateId: formData.value.checkInDateId,
            institutionNameId: formData.value.institutionNameId,
            userModifiedId: formData.value.userModifiedId
          }
        case 2:
          return {
            isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned,
            fullName: formData.value.fullName,
            email: formData.value.email,
            phone: formData.value.phone,
            specialAssistances: formData.value.specialAssistances,
            mainEconomicConceptId: formData.value.mainEconomicConceptId,
            secondaryEconomicConceptId: formData.value.secondaryEconomicConceptId,
            userModifiedId: formData.value.userModifiedId
          }
        case 3:
          return {
            discoveryChannelId: formData.value.discoveryChannelId,
            paymentMethodId: formData.value.paymentMethodId,
            requiresDetailedLocationInformation: formData.value.requiresDetailedLocationInformation,
            requestsPostVisitInvoice: formData.value.requestsPostVisitInvoice,
            confirmsInformationAccuracy: formData.value.confirmsInformationAccuracy,
            workShopsIds: formData.value.workShopsIds,
            totalPeople: formData.value.totalPeople,
            totalCost: formData.value.totalCost,
            userModifiedId: formData.value.userModifiedId
          }
        default:
          return {}
      }
    }
  
    // ============================================================================
    // OPERACIONES DE ESTADO
    // ============================================================================
  
    /**
     * Establece el paso actual
     */
    const setCurrentStep = (step: 1 | 2 | 3) => {
      currentStep.value = step
     // console.log('🔄 Paso actual establecido:', step)
    }
  
    /**
     * Avanza al siguiente paso
     */
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value = (currentStep.value + 1) as 1 | 2 | 3
     //  console.log('➡️ Avanzando al paso:', currentStep.value)
      }
    }
  
    /**
     * Retrocede al paso anterior
     */
    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value = (currentStep.value - 1) as 1 | 2 | 3
      //  console.log('⬅️ Retrocediendo al paso:', currentStep.value)
      }
    }
  
    /**
     * Marca la reservación como completada
     */
    const markAsCompleted = () => {
      isCompleted.value = true
      //console.log('✅ Reservación marcada como completada')
    }
  
    // ============================================================================
    // OPERACIONES DE LOADING
    // ============================================================================
  
    /**
     * Establece el estado de loading para crear
     */
    const setCreating = (loading: boolean) => {
      isCreating.value = loading
    }
  
    /**
     * Establece el estado de loading para actualizar
     */
    const setUpdating = (loading: boolean) => {
      isUpdating.value = loading
    }
  
    /**
     * Establece el estado de loading general
     */
    const setLoading = (loading: boolean) => {
      isLoading.value = loading
    }
  
    /**
     * Establece el estado de loading para un paso específico
     */
    const setStepLoading = (step: 1 | 2 | 3, loading: boolean) => {
      switch (step) {
        case 1:
          isLoadingStep1.value = loading
          break
        case 2:
          isLoadingStep2.value = loading
          break
        case 3:
          isLoadingStep3.value = loading
          break
      }
    }
  
    // ============================================================================
    // OPERACIONES DE ERROR
    // ============================================================================
  
    /**
     * Establece un error general
     */
    const setError = (errorMessage: string | null) => {
      error.value = errorMessage
      if (errorMessage) {
        console.error('❌ Error establecido:', errorMessage)
      }
    }
  
    /**
     * Establece un error de paso específico
     */
    const setStepError = (step: 1 | 2 | 3, errorMessage: string | null) => {
      stepErrors.value[`step${step}` as keyof typeof stepErrors.value] = errorMessage
      if (errorMessage) {
        console.error(`❌ Error del paso ${step}:`, errorMessage)
      }
    }
  
    // ============================================================================
    // OPERACIONES DE RESERVACIONES
    // ============================================================================
  
    /**
     * Agrega una reservación a la lista
     */
    const addReservation = (reservation: ReservationSummerCourse) => {
      const existingIndex = reservations.value.findIndex(r => r.id === reservation.id)
      if (existingIndex >= 0) {
        reservations.value[existingIndex] = reservation
      } else {
        reservations.value.push(reservation)
      }
     // console.log('📝 Reservación agregada/actualizada:', reservation.id)
    }
  
    /**
     * Actualiza una reservación en la lista
     */
    const updateReservation = (reservation: ReservationSummerCourse) => {
      const index = reservations.value.findIndex(r => r.id === reservation.id)
      if (index >= 0) {
        reservations.value[index] = reservation
        //console.log('📝 Reservación actualizada:', reservation.id)
      }
    }
  
    /**
     * Elimina una reservación de la lista
     */
    const removeReservation = (reservationId: number) => {
      const index = reservations.value.findIndex(r => r.id === reservationId)
      if (index >= 0) {
        reservations.value.splice(index, 1)
       // console.log('🗑️ Reservación eliminada:', reservationId)
      }
    }
  
    /**
     * Establece la lista completa de reservaciones
     */
    const setReservations = (reservationsList: ReservationSummerCourse[]) => {
      reservations.value = reservationsList
      //console.log('📝 Lista de reservaciones establecida:', reservationsList.length)
    }
  
    // ============================================================================
    // OPERACIONES DE CONSULTA
    // ============================================================================

    /**
     * Obtiene reservaciones de cursos de verano con filtros opcionales
     */
    const fetchReservations = async (filters?: { id?: number, visitorId?: number, folio?: string }): Promise<ReservationSummerCourse[]> => {
      setLoading(true)
      clearAllErrors()

      try {
        const response = await reservationSummerCourseService.getReservationSummerCoursesById(
          filters?.id,
          filters?.visitorId,
          filters?.folio
        )
        
        // Debug: verificar qué está devolviendo el API
        // console.log('🔍 fetchReservations - Respuesta del API:', response)
        // console.log('🔍 fetchReservations - Tipo de respuesta:', typeof response)
        // console.log('🔍 fetchReservations - Es array?:', Array.isArray(response))
        
        // Extraer los datos reales de la respuesta del servidor
        // El servidor devuelve una estructura ApiResponse, no directamente los datos
        const actualData = (response as any).response || response
        
       // console.log('🔍 fetchReservations - Datos extraídos:', actualData)
        
        // Verificar que los datos extraídos sean un array
        if (!Array.isArray(actualData)) {
          console.error('❌ Los datos extraídos no son un array:', actualData)
          setError('La respuesta del servidor no tiene el formato esperado')
          return []
        }
        
        const dataArray = actualData
        
      //  console.log('🔍 fetchReservations - Array extraído:', dataArray)
        
        // Convertir DTOs a objetos completos de reservación
        const reservationsList = dataArray.map(dto => ({
          id: dto.id,
          visitorId: dto.visitorId,
          totalKids: 0,
          totalAdults: 0,
          totalSeniors: 0,
          totalYoungAdults: 0,
          totalTeenagers: 0,
          totalKidsWithDisabilities: 0,
          totalAdultsWithDisabilities: 0,
          totalSeniorsWithDisabilities: 0,
          totalYoungAdultsWithDisabilities: 0,
          totalTeenagersWithDisabilities: 0,
          reservationDate: dto.reservationDate,
          checkInDateId: 0,
          visitObjectiveId: 0,
          institutionNameId: dto.institutionNameId,
          isReservationPersonAlsoResponsible: null,
          isResponsibleNotAssigned: null,
          fullName: null,
          email: null,
          phone: null,
          specialAssistances: null,
          mainEconomicConceptId: null,
          secondaryEconomicConceptId: null,
          userModifiedId: null,
          discoveryChannelId: null,
          paymentMethodId: null,
          acknowledgedCivilProtectionDocs: null,
          requiresStreetCrossingAssistance: null,
          confirmsInformationAccuracy: null,
          workShopsIds: [],
          totalPeople: null,
          totalCost: null,
          status: dto.status as any,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt
        }))

        setReservations(reservationsList)
        return reservationsList

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar reservaciones')
        throw err
      } finally {
        setLoading(false)
      }
    }

    /**
     * Obtiene una reservación específica por ID usando el endpoint específico del paso 1
     */
    const fetchReservationById = async (id: number): Promise<ReservationSummerCourse | null> => {
      try {
        const response = await reservationSummerCourseService.getReservationSummerCourseStep1(id)
        
       // console.log('🔍 fetchReservationById - Respuesta del API:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        const step1Data = (response as any).response || response
        
        //console.log('🔍 fetchReservationById - Datos extraídos:', step1Data)
        
        if (!step1Data) {
          console.error('❌ No se encontraron datos en la respuesta')
          return null
        }
        
        // Convertir los datos del paso 1 a un objeto completo de reservación
        const reservation: ReservationSummerCourse = {
          id: step1Data.reservationId || id,
          visitorId: step1Data.visitorId,
          totalKids: step1Data.totalKids,
          totalAdults: step1Data.totalAdults,
          totalSeniors: step1Data.totalSeniors,
          totalYoungAdults: step1Data.totalYoungAdults || 0,
          totalTeenagers: step1Data.totalTeenagers || 0,
          totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities || 0,
          totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities,
          totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities,
          totalKidsWithDisabilities: step1Data.totalKidsWithDisabilities,
          totalTeenagersWithDisabilities: step1Data.totalTeenagersWithDisabilities || 0,
          reservationDate: step1Data.reservationDate,
          checkInDateId: step1Data.checkInDateId,
          visitObjectiveId: step1Data.visitObjectiveId,
          institutionNameId: step1Data.institutionNameId || 0,
          
          // Paso 2 - Campos con valores por defecto (se cargarán después si existen)
          isReservationPersonAlsoResponsible: null,
          isResponsibleNotAssigned: null,
          fullName: null,
          email: null,
          phone: null,
          specialAssistances: null,
          mainEconomicConceptId: null,
          secondaryEconomicConceptId: null,
          userModifiedId: null,
          
          // Paso 3 - Campos con valores por defecto
          discoveryChannelId: null,
          paymentMethodId: null,
          acknowledgedCivilProtectionDocs: null,
          requiresStreetCrossingAssistance: null,
          confirmsInformationAccuracy: null,
          workShopsIds: [],
          totalPeople: null,
          totalCost: null,
          
          // Metadatos
          status: 'step1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
      //  console.log('🔍 fetchReservationById - Reservación construida:', reservation)
        return reservation
        
      } catch (error) {
        console.error('Error al obtener reservación por ID:', error)
        return null
      }
    }

    /**
     * Obtiene reservaciones de un visitante específico
     */
    const fetchReservationsByVisitor = async (visitorId: number): Promise<ReservationSummerCourse[]> => {
      try {
        return await fetchReservations({ visitorId })
      } catch (error) {
        console.error('Error al obtener reservaciones del visitante:', error)
        return []
      }
    }

    // ============================================================================
    // OPERACIONES DE API
    // ============================================================================
  
    /**
     * Crea una nueva reservación de curso de verano (Paso 1)
     */
    const createReservationStep1 = async (requestData?: CreateReservationSummerCourseStep1Request): Promise<ReservationSummerCourse | null> => {
      // Si se proporcionan datos, usarlos; si no, usar los del formulario
      const dataToUse = requestData || {
        visitorId: formData.value.visitorId!,
        totalKids: formData.value.totalKids,
        totalAdults: formData.value.totalAdults,
        totalSeniors: formData.value.totalSeniors,
        totalYoungAdults: formData.value.totalYoungAdults,
        totalTeenagers: formData.value.totalTeenagers,
        totalKidsWithDisabilities: formData.value.totalKidsWithDisabilities,
        totalAdultsWithDisabilities: formData.value.totalAdultsWithDisabilities,
        totalSeniorsWithDisabilities: formData.value.totalSeniorsWithDisabilities,
        totalYoungAdultsWithDisabilities: formData.value.totalYoungAdultsWithDisabilities,
        totalTeenagersWithDisabilities: formData.value.totalTeenagersWithDisabilities,
        reservationDate: formData.value.reservationDate,
        checkInDateId: formData.value.checkInDateId!,
        visitObjectiveId: formData.value.visitObjectiveId!,
        institutionNameId: formData.value.institutionNameId!,
        userModifiedId: getUserModifiedId()
      }
  
      // Validar que los datos requeridos estén presentes
      if (!dataToUse.visitorId || !dataToUse.checkInDateId || !dataToUse.visitObjectiveId || !dataToUse.institutionNameId) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 1'
        setStepError(1, errorMsg)
        return null
      }
  
      if (isCreating.value) return null
  
      setCreating(true)
      clearStepError(1)
  
      try {
        const response = await reservationSummerCourseService.createReservationSummerCourseStep1(dataToUse)
        
        // La respuesta puede ser el ID directamente o un objeto con reservationId
        let reservationId: number
        
        if (typeof response === 'number') {
          // Si la respuesta es directamente un número (ID)
          reservationId = response
        } else if (response && typeof response === 'object') {
          const responseObj = response as any
          if (responseObj.response) {
            // Si la respuesta es un objeto con el campo 'response' (como en el ejemplo)
            reservationId = responseObj.response
          } else if (responseObj.reservationId) {
            // Si la respuesta es un objeto con el campo 'reservationId'
            reservationId = responseObj.reservationId
          } else if (responseObj.id) {
            // Si la respuesta es un objeto con el campo 'id'
            reservationId = responseObj.id
          } else {
            throw new Error('Formato de respuesta del API no reconocido')
          }
        } else {
          throw new Error('Formato de respuesta del API no reconocido')
        }
        
        console.log('🔍 ID de reservación extraído:', reservationId)
        
        // Crear objeto de reservación con los datos del paso 1
        const newReservation: ReservationSummerCourse = {
          id: reservationId,
          visitorId: dataToUse.visitorId,
          totalKids: dataToUse.totalKids,
          totalAdults: dataToUse.totalAdults,
          totalSeniors: dataToUse.totalSeniors,
          totalYoungAdults: dataToUse.totalYoungAdults || 0,
          totalTeenagers: dataToUse.totalTeenagers || 0,
          totalKidsWithDisabilities: dataToUse.totalKidsWithDisabilities,
          totalAdultsWithDisabilities: dataToUse.totalAdultsWithDisabilities,
          totalSeniorsWithDisabilities: dataToUse.totalSeniorsWithDisabilities,
          totalYoungAdultsWithDisabilities: dataToUse.totalYoungAdultsWithDisabilities,
          totalTeenagersWithDisabilities: dataToUse.totalTeenagersWithDisabilities,
          reservationDate: dataToUse.reservationDate,
          checkInDateId: dataToUse.checkInDateId,
          visitObjectiveId: dataToUse.visitObjectiveId,
          institutionNameId: dataToUse.institutionNameId,
          isReservationPersonAlsoResponsible: null,
          isResponsibleNotAssigned: null,
          fullName: null,
          email: null,
          phone: null,
          specialAssistances: null,
          mainEconomicConceptId: null,
          secondaryEconomicConceptId: null,
          userModifiedId: dataToUse.userModifiedId,
          discoveryChannelId: null,
          paymentMethodId: null,
          acknowledgedCivilProtectionDocs: null,
          requiresStreetCrossingAssistance: null,
          confirmsInformationAccuracy: null,
          workShopsIds: [],
          totalPeople: null,
          totalCost: null,
          status: 'step1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
  
        // Actualizar el store
        setCurrentReservation(newReservation)
        setCurrentStep(2)
        addReservation(newReservation)
        
        // Marcar el paso 1 como guardado en el store principal
        updateStepData(1, { saved: true, timestamp: Date.now() })
        
        return newReservation
  
      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al crear reservación')
        throw err
      } finally {
        setCreating(false)
      }
    }
  
    /**
     * Crea el paso 2 de una reservación
     */
    const createReservationStep2 = async (): Promise<ReservationSummerCourse | null> => {
      if (!currentReservation.value) {
        setError('No hay una reservación activa para actualizar')
        return null
      }
  
      if (!isStep2Valid.value) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 2'
        setStepError(2, errorMsg)
        return null
      }
  
      if (isUpdating.value) return null
  
      setUpdating(true)
      clearStepError(2)
  
      try {
        const requestData: UpdateReservationSummerCourseStep2Request = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible!,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned!,
          fullName: formData.value.fullName || null,
          email: formData.value.email || null,
          phone: formData.value.phone || null,
          specialAssistances: formData.value.specialAssistances || [],
          mainEconomicConceptId: formData.value.mainEconomicConceptId || 0,
          secondaryEconomicConceptId: formData.value.secondaryEconomicConceptId || 0,
          userModifiedId: getUserModifiedId()
        }
  
        const response = await reservationSummerCourseService.updateReservationSummerCourseStep2(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            isReservationPersonAlsoResponsible: response.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: response.isResponsibleNotAssigned,
            fullName: response.fullName,
            email: response.email,
            phone: response.phone,
            specialAssistances: response.specialAssistances,
            mainEconomicConceptId: response.mainEconomicConceptId,
            secondaryEconomicConceptId: response.secondaryEconomicConceptId,
            userModifiedId: response.userModifiedId,
            status: 'step2' as const,
            updatedAt: response.updatedAt
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }
  
        setCurrentStep(3)
        return currentReservation.value
  
      } catch (err) {
        setStepError(2, err instanceof Error ? err.message : 'Error al crear paso 2')
        throw err
      } finally {
        setUpdating(false)
      }
    }
  
    /**
     * Actualiza el paso 2 de una reservación
     */
    const updateReservationStep1 = async (requestData: any): Promise<ReservationSummerCourse | null> => {
      console.log('🔍 updateReservationStep1 iniciado')
      console.log('🔍 requestData:', requestData)
      console.log('🔍 currentReservation.value:', currentReservation.value)
      console.log('🔍 currentReservationId.value:', currentReservationId.value)
      
      // Si no hay reservación activa pero sí hay ID, intentar cargarla
      if (!currentReservation.value && currentReservationId.value) {
        //console.log('🔄 Intentando cargar reservación desde ID antes de actualizar paso 1:', currentReservationId.value)
        try {
          await loadStep1(currentReservationId.value)
          if (!currentReservation.value) {
            setError('No se pudo cargar la reservación para actualizar')
            return null
          }
        } catch (error) {
          setError('Error al cargar la reservación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
          return null
        }
      }
      
      // Si aún no hay reservación activa, intentar crear una nueva con los datos proporcionados
      if (!currentReservation.value) {
        console.log('🔄 No hay reservación activa, intentando crear una nueva...')
        try {
          const newReservation = await createReservationStep1(requestData)
          if (newReservation) {
            console.log('✅ Nueva reservación creada exitosamente')
            return newReservation
          } else {
            setError('No se pudo crear una nueva reservación')
            return null
          }
        } catch (error) {
          setError('Error al crear nueva reservación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
          return null
        }
      }

      if (isUpdating.value) return null

      setLoading(true)
      clearAllErrors()

      try {
        // Preparar los datos para la actualización del paso 1
        const updateData = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          ...requestData
        }

        console.log('🔍 Datos para actualizar paso 1:', updateData)
        const response = await reservationSummerCourseService.updateReservationSummerCourseStep1(updateData)
        //console.log('✅ Paso 1 actualizado exitosamente:', response)

        // Actualizar la reservación actual con la respuesta
        if (response && currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            ...response,
            id: currentReservation.value.id,
            status: 'step1' as const
          }
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
       //   console.log('✅ Reservación actualizada en el store')
        }

        return currentReservation.value
      } catch (error) {
        console.error('❌ Error al actualizar paso 1:', error)
        setError('Error al actualizar el paso 1: ' + (error instanceof Error ? error.message : 'Error desconocido'))
        return null
      } finally {
        setLoading(false)
      }
    }

    const updateReservationStep2 = async (): Promise<ReservationSummerCourse | null> => {
      // Si no hay reservación activa pero sí hay ID, intentar cargarla
      if (!currentReservation.value && currentReservationId.value) {
        try {
          await loadStep1(currentReservationId.value)
          if (!currentReservation.value) {
            setError('No se pudo cargar la reservación para actualizar')
            return null
          }
        } catch (error) {
          setError('Error al cargar la reservación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
          return null
        }
      }
      
      if (!currentReservation.value) {
        setError('No hay una reservación activa para actualizar')
        return null
      }
  
      if (!isStep2Valid.value) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 2'
        setStepError(2, errorMsg)
        return null
      }
  
      if (isUpdating.value) return null
  
      setUpdating(true)
      clearStepError(2)
  
      try {
        const requestData: UpdateReservationSummerCourseStep2Request = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          isReservationPersonAlsoResponsible: formData.value.isReservationPersonAlsoResponsible!,
          isResponsibleNotAssigned: formData.value.isResponsibleNotAssigned!,
          fullName: formData.value.fullName || null,
          email: formData.value.email || null,
          phone: formData.value.phone || null,
          specialAssistances: formData.value.specialAssistances || [],
          mainEconomicConceptId: formData.value.mainEconomicConceptId || 0,
          secondaryEconomicConceptId: formData.value.secondaryEconomicConceptId || 0,
          userModifiedId: getUserModifiedId()
        }
  
        const response = await reservationSummerCourseService.updateReservationSummerCourseStep2(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            isReservationPersonAlsoResponsible: response.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: response.isResponsibleNotAssigned,
            fullName: response.fullName,
            email: response.email,
            phone: response.phone,
            specialAssistances: response.specialAssistances,
            mainEconomicConceptId: response.mainEconomicConceptId,
            secondaryEconomicConceptId: response.secondaryEconomicConceptId,
            userModifiedId: response.userModifiedId,
            status: 'step2' as const,
            updatedAt: response.updatedAt
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }
  
        setCurrentStep(3)
        return currentReservation.value
  
      } catch (err) {
        setStepError(2, err instanceof Error ? err.message : 'Error al actualizar paso 2')
        throw err
      } finally {
        setUpdating(false)
      }
    }
  
    /**
     * Actualiza el paso 3 de una reservación
     */
    const updateReservationStep3 = async (): Promise<ReservationSummerCourse | null> => {
      // Si no hay reservación activa pero sí hay ID, intentar cargarla
      if (!currentReservation.value && currentReservationId.value) {
        try {
          await loadStep1(currentReservationId.value)
          if (!currentReservation.value) {
            setError('No se pudo cargar la reservación para actualizar')
            return null
          }
        } catch (error) {
          setError('Error al cargar la reservación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
          return null
        }
      }
      
      if (!currentReservation.value) {
        setError('No hay una reservación activa para actualizar')
        return null
      }

      if (!isStep3Valid.value) {
        const errorMsg = 'Por favor completa todos los campos requeridos del paso 3'
        setStepError(3, errorMsg)
        return null
      }

      if (isUpdating.value) return null

      setUpdating(true)
      clearStepError(3)

      try {
        const requestData: UpdateReservationSummerCourseStep3Request = {
          reservationId: typeof currentReservation.value.id === 'string' ? parseInt(currentReservation.value.id, 10) : currentReservation.value.id,
          discoveryChannelId: formData.value.discoveryChannelId,
          paymentMethodId: formData.value.paymentMethodId,
          acknowledgedCivilProtectionDocs: formData.value.requiresDetailedLocationInformation,
          requiresStreetCrossingAssistance: formData.value.requestsPostVisitInvoice,
          confirmsInformationAccuracy: formData.value.confirmsInformationAccuracy,
          workShopsIds: formData.value.workShopsIds || [],
          userModifiedId: getUserModifiedId()
        }

        const response = await reservationSummerCourseService.updateReservationSummerCourseStep3(requestData)
        
        // Actualizar el objeto de reservación en el store
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            discoveryChannelId: response.discoveryChannelId,
            paymentMethodId: response.paymentMethodId,
            acknowledgedCivilProtectionDocs: response.acknowledgedCivilProtectionDocs,
            requiresStreetCrossingAssistance: response.requiresStreetCrossingAssistance,
            confirmsInformationAccuracy: response.confirmsInformationAccuracy,
            workShopsIds: response.workShopsIds,
            userModifiedId: response.userModifiedId,
            status: 'completed' as const,
            updatedAt: response.updatedAt
          }
          
          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        }

        setCurrentStep(3)
        markAsCompleted()
        return currentReservation.value

      } catch (err) {
        setStepError(3, err instanceof Error ? err.message : 'Error al actualizar paso 3')
        throw err
      } finally {
        setUpdating(false)
      }
    }

    /**
     * Carga solo los datos del paso 1 de una reservación
     */
    const loadStep1 = async (reservationId: number): Promise<any> => {
      if (isLoadingStep1.value) return false

      setStepLoading(1, true)
      clearStepError(1)

      try {
        const response = await reservationSummerCourseService.getReservationSummerCourseStep1(reservationId)
        
     //   console.log('🔍 loadStep1 - Respuesta completa del servidor:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        const step1Data = (response as any).response || response
        
      //  console.log('🔍 loadStep1 - Datos extraídos:', step1Data)
        
        // Actualizar solo los datos del paso 1 en el formulario
        const formDataUpdate = {
          visitorId: step1Data.visitorId,
          attendeeTypeId: step1Data.attendeeTypeId,
          attendingWithChildrenUnder3: step1Data.attendingWithChildrenUnder3,
          totalKids: step1Data.totalKids,
          totalAdults: step1Data.totalAdults,
          totalSeniors: step1Data.totalSeniors,
          totalYoungAdults: step1Data.totalYoungAdults,
          totalTeenagers: step1Data.totalTeenagers,
          totalPeopleWithDisabilities: step1Data.totalPeopleWithDisabilities,
          totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities,
          totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities,
          totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities,
          totalKidsWithDisabilities: step1Data.totalKidsWithDisabilities,
          totalTeenagersWithDisabilities: step1Data.totalTeenagersWithDisabilities,
          totalKidsUnderThree: step1Data.totalKidsUnderThree,
          reservationDate: step1Data.reservationDate,
          checkInDateId: step1Data.checkInDateId,
          visitObjectiveId: step1Data.visitObjectiveId,
          institutionNameId: step1Data.institutionNameId
        }
        
    //    console.log('🔍 loadStep1 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
     //   console.log('🔍 loadStep1 - formData después de actualizar:', formData.value)

        // Actualizar o crear la reservación actual
        if (!currentReservation.value) {
          const newReservation: ReservationSummerCourse = {
            id: reservationId,
            visitorId: step1Data.visitorId,
            totalKids: step1Data.totalKids,
            totalAdults: step1Data.totalAdults,
            totalSeniors: step1Data.totalSeniors,
            totalYoungAdults: step1Data.totalYoungAdults || 0,
            totalTeenagers: step1Data.totalTeenagers || 0,
            totalKidsWithDisabilities: step1Data.totalKidsWithDisabilities,
            totalAdultsWithDisabilities: step1Data.totalAdultsWithDisabilities,
            totalSeniorsWithDisabilities: step1Data.totalSeniorsWithDisabilities,
            totalYoungAdultsWithDisabilities: step1Data.totalYoungAdultsWithDisabilities,
            totalTeenagersWithDisabilities: step1Data.totalTeenagersWithDisabilities,
            reservationDate: step1Data.reservationDate,
            checkInDateId: step1Data.checkInDateId,
            visitObjectiveId: step1Data.visitObjectiveId,
            institutionNameId: step1Data.institutionNameId || 0,
            isReservationPersonAlsoResponsible: null,
            isResponsibleNotAssigned: null,
            fullName: null,
            email: null,
            phone: null,
            specialAssistances: null,
            mainEconomicConceptId: null,
            secondaryEconomicConceptId: null,
            userModifiedId: null,
            discoveryChannelId: null,
            paymentMethodId: null,
            acknowledgedCivilProtectionDocs: null,
            requiresStreetCrossingAssistance: null,
            confirmsInformationAccuracy: null,
            workShopsIds: [],
            totalPeople: null,
            totalCost: null,
            status: 'step1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          setCurrentReservation(newReservation)
          setCurrentReservationId(reservationId)
        }

        setStepLoading(1, false)
        return step1Data

      } catch (err) {
        setStepError(1, err instanceof Error ? err.message : 'Error al cargar paso 1')
        setStepLoading(1, false)
        throw err
      }
    }

    /**
     * Carga solo los datos del paso 2 de una reservación
     */
    const loadStep2 = async (reservationId: number): Promise<any> => {
      if (isLoadingStep2.value) return false

      setStepLoading(2, true)
      clearStepError(2)

      try {
        const response = await reservationSummerCourseService.getReservationSummerCourseStep2(reservationId)
        
//        console.log('🔍 loadStep2 - Respuesta completa del servidor:', response)
        
        // Extraer los datos reales de la respuesta del servidor
        const step2Data = (response as any).response || response
        
//        console.log('🔍 loadStep2 - Datos extraídos:', step2Data)
        
        // Actualizar solo los datos del paso 2 en el formulario
        const formDataUpdate = {
          isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
          fullName: step2Data.fullName,
          email: step2Data.email,
          phone: step2Data.phone,
          specialAssistances: step2Data.specialAssistances,
          mainEconomicConceptId: step2Data.mainEconomicConceptId,
          secondaryEconomicConceptId: step2Data.secondaryEconomicConceptId,
          userModifiedId: step2Data.userModifiedId
        }
        
//        console.log('🔍 loadStep2 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
//        console.log('🔍 loadStep2 - formData después de actualizar:', formData.value)

        // Actualizar o crear la reservación actual con los datos del paso 2
        if (currentReservation.value) {
          // Si ya existe currentReservation, actualizarla
          const updatedReservation = {
            ...currentReservation.value,
            isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
            isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
            fullName: step2Data.fullName,
            email: step2Data.email,
            phone: step2Data.phone,
            specialAssistances: step2Data.specialAssistances,
            mainEconomicConceptId: step2Data.mainEconomicConceptId,
            secondaryEconomicConceptId: step2Data.secondaryEconomicConceptId,
            userModifiedId: step2Data.userModifiedId,
            status: 'step2' as const,
            updatedAt: new Date().toISOString()
          }

          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        } else {
          // Si no existe currentReservation, cargar los datos del paso 1 primero
          console.log('🔄 loadStep2 - currentReservation no existe, cargando paso 1 primero...')
          await loadStep1(reservationId)
          // Después de cargar el paso 1, currentReservation debería existir
          if (currentReservation.value) {
            // Actualizar con los datos del paso 2
            const updatedReservation = {
              ...(currentReservation.value as any),
              isReservationPersonAlsoResponsible: step2Data.isReservationPersonAlsoResponsible,
              isResponsibleNotAssigned: step2Data.isResponsibleNotAssigned,
              fullName: step2Data.fullName,
              email: step2Data.email,
              phone: step2Data.phone,
              specialAssistances: step2Data.specialAssistances,
              mainEconomicConceptId: step2Data.mainEconomicConceptId,
              secondaryEconomicConceptId: step2Data.secondaryEconomicConceptId,
              userModifiedId: step2Data.userModifiedId,
              status: 'step2' as const,
              updatedAt: new Date().toISOString()
            }

            setCurrentReservation(updatedReservation)
            updateReservation(updatedReservation)
          }
        }

        setStepLoading(2, false)
        return step2Data

      } catch (err) {
        setStepError(2, err instanceof Error ? err.message : 'Error al cargar paso 2')
        setStepLoading(2, false)
        throw err
      }
    }

    /**
     * Verifica si una reservación tiene personas con discapacidad
     */
    const checkReservationHasDisability = async (reservationId: number): Promise<boolean> => {
      try {
        const hasDisability = await reservationSummerCourseService.checkReservationHasDisability(reservationId)
        console.log('🔍 Store - Verificación de discapacidad:', { reservationId, hasDisability })
        return hasDisability
      } catch (err) {
        console.error('❌ Store - Error al verificar discapacidad:', err)
        return false
      }
    }

    /**
     * Carga solo los datos del paso 3 de una reservación
     * Incluye el desglose de costos (costBreakdown) del endpoint
     */
    const loadStep3 = async (reservationId: number): Promise<any> => {
      if (isLoadingStep3.value) return false

      setStepLoading(3, true)
      clearStepError(3)

      try {
        const response = await reservationSummerCourseService.getReservationSummerCourseStep3(reservationId)

        console.log('🔍 loadStep3 - Respuesta completa del servidor:', response)

        // Extraer los datos reales de la respuesta del servidor
        const step3Data = (response as any).response || response

        console.log('🔍 loadStep3 - Datos extraídos:', step3Data)
        console.log('🔍 loadStep3 - costBreakdown extraído:', step3Data.costBreakdown)

        // Guardar el desglose de costos en el store
        if (step3Data.costBreakdown) {
          costBreakdown.value = step3Data.costBreakdown
          console.log('✅ loadStep3 - costBreakdown guardado en el store:', costBreakdown.value)
        }

        // Actualizar solo los datos del paso 3 en el formulario
        const formDataUpdate = {
          discoveryChannelId: step3Data.discoveryChannelId,
          paymentMethodId: step3Data.paymentMethodId,
          requiresMediationService: step3Data.requiresMediationService,
          requiresDetailedLocationInformation: step3Data.acknowledgedCivilProtectionDocs,
          requestsPostVisitInvoice: step3Data.requiresStreetCrossingAssistance,
          needsCheckoutProcessInformation: step3Data.needsCheckoutProcessInformation,
          confirmsInformationAccuracy: step3Data.confirmsInformationAccuracy,
          workShopsIds: step3Data.workShopsIds,
          userModifiedId: step3Data.userModifiedId
        }

        console.log('🔍 loadStep3 - Datos que se van a actualizar en formData:', formDataUpdate)
        updateFormData(formDataUpdate)
        console.log('🔍 loadStep3 - formData después de actualizar:', formData.value)

        // Actualizar la reservación actual con los datos del paso 3
        if (currentReservation.value) {
          const updatedReservation = {
            ...currentReservation.value,
            discoveryChannelId: step3Data.discoveryChannelId,
            paymentMethodId: step3Data.paymentMethodId,
            requiresMediationService: step3Data.requiresMediationService,
            requiresDetailedLocationInformation: step3Data.acknowledgedCivilProtectionDocs,
            requestsPostVisitInvoice: step3Data.requiresStreetCrossingAssistance,
            needsCheckoutProcessInformation: step3Data.needsCheckoutProcessInformation,
            confirmsInformationAccuracy: step3Data.confirmsInformationAccuracy,
            workShopsIds: step3Data.workShopsIds,
            userModifiedId: step3Data.userModifiedId,
            status: 'step3' as const,
            updatedAt: new Date().toISOString()
          }

          setCurrentReservation(updatedReservation)
          updateReservation(updatedReservation)
        } else {
          // Si no existe currentReservation, cargar primero el paso 1 para establecer la base
          console.log('🔄 loadStep3 - currentReservation no existe, cargando paso 1 primero...')
          await loadStep1(reservationId)
          
          // Ahora actualizar con los datos del paso 3
          if (currentReservation.value) {
            const updatedReservation = {
              ...(currentReservation.value as any),
              discoveryChannelId: step3Data.discoveryChannelId,
              paymentMethodId: step3Data.paymentMethodId,
              requiresMediationService: step3Data.requiresMediationService,
              requiresDetailedLocationInformation: step3Data.acknowledgedCivilProtectionDocs,
              requestsPostVisitInvoice: step3Data.requiresStreetCrossingAssistance,
              needsCheckoutProcessInformation: step3Data.needsCheckoutProcessInformation,
              confirmsInformationAccuracy: step3Data.confirmsInformationAccuracy,
              workShopsIds: step3Data.workShopsIds,
              userModifiedId: step3Data.userModifiedId,
              status: 'step3' as const,
              updatedAt: new Date().toISOString()
            }

            setCurrentReservation(updatedReservation)
            updateReservation(updatedReservation)
            console.log('✅ loadStep3 - currentReservation establecido con datos del paso 3')
          }
        }

        setStepLoading(3, false)
        return step3Data

      } catch (err) {
        setStepError(3, err instanceof Error ? err.message : 'Error al cargar paso 3')
        setStepLoading(3, false)
        throw err
      }
    }
  
    // ============================================================================
    // RETORNO DEL STORE
    // ============================================================================
  
    return {
      // Estados reactivos
      currentReservation,
      currentReservationId,
      formData,
      reservations,
      currentStep,
      isCompleted,
      costBreakdown,

      // Estados de loading
      isCreating,
      isUpdating,
      isLoading,
      isLoadingStep1,
      isLoadingStep2,
      isLoadingStep3,
      isLoadingAny,

      // Estados de error
      error,
      stepErrors,

      // Computed properties
      totalPeople,
      isStep1Valid,
      isStep2Valid,
      isStep3Valid,
      reservationStatus,
      
      // Operaciones de reservación
      setCurrentReservation,
      setCurrentReservationId,
      updateFormData,
      updateStepData,
      getStepData,
      resetForm,
      clearPersistence,
      loadFromStorage,
      
      // Operaciones de estado
      setCurrentStep,
      nextStep,
      previousStep,
      markAsCompleted,
      
      // Operaciones de loading
      setCreating,
      setUpdating,
      setLoading,
      setStepLoading,
      
      // Operaciones de error
      setError,
      setStepError,
      clearStepError,
      clearAllErrors,
      
      // Operaciones de reservaciones
      addReservation,
      updateReservation,
      removeReservation,
      setReservations,
      
      // Operaciones de consulta
      fetchReservations,
      fetchReservationById,
      fetchReservationsByVisitor,
      checkReservationHasDisability,
      
      // Operaciones de API
      createReservationStep1,
      createReservationStep2,
      updateReservationStep1,
      updateReservationStep2,
      updateReservationStep3,
      loadStep1,
      loadStep2,
      loadStep3
    }
  })
