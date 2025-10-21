import { ref, computed, readonly } from 'vue'
import { useApiFetch, useApiPost, API_ENDPOINTS } from '@/lib/api/core/useFetch'
import { useAuth } from '@/lib/api/composables/auth'
import { useRouter } from 'vue-router'
import type { 
  AttendanceReservation, 
  AddAttendanceReservationRequest, 
  AttendanceFilters 
} from '@/lib/api/types/attendance'

// Tipo para la respuesta de la API de reservaciones
interface ReservationsApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: AttendanceReservation[]
  token: string
}
import { useToast } from '../ui/useToast'
import { useErrorHandler } from '../ui/useErrorHandler'

// ============================================================================
// TIPOS E INTERFACES PARA LÓGICA DE NEGOCIO
// ============================================================================

export interface ReservationFormData {
  // Campos básicos
  name: string
  email: string
  phone: string
  participants: number
  date: string
  time: string
  school: string
  grade: string
  purpose: string
  specialNeeds: string
  notes: string
  
  // Campos específicos del paso 1
  totalAttendees: number
  hasUnder3: 'yes' | 'no'
  minors: number
  children: number
  adults: number
  seniors: number
  hasDisability: 'yes' | 'no'
  
  // Campos adicionales del paso 3
  source: string
  preferences: string
  comments: string
}

export interface BusinessReservationData {
  company: string
  position: string
  industry: string
  objectives: string
  participants: number
  samePersonResponsible: 'yes' | 'no'
  representativeName: string
  representativePhone: string
  averageAge: string
  mainConcepts: string[]
  secondaryConcepts: string[]
  municipality: string
  specialNeeds: string
}

export interface SummerReservationData {
  program: string
  ageGroup: string
  duration: string
  activities: string
  participants: number
  samePersonResponsible: 'yes' | 'no'
  representativeName: string
  representativeEmail: string
  representativePhone: string
  hasSpecialNeeds: 'yes' | 'no'
  municipality: string
  specialNeeds: string
}

export interface SchoolReservationData {
  mainConcepts: string[]
  secondaryConcepts: string[]
  samePersonResponsible: boolean
  representativeName: string
  representativeEmail: string
  representativePhone: string
  municipality: string
  specialNeeds: string
}

// ============================================================================
// COMPOSABLE UNIFICADO DE RESERVACIONES
// ============================================================================

export function useReservation() {
  // ============================================================================
  // COMPOSABLES Y SERVICIOS BASE
  // ============================================================================
  
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const { getErrorMessage } = useErrorHandler()
  const router = useRouter()

  // ============================================================================
  // COMPOSABLES DE API INTEGRADOS
  // ============================================================================

  // Composable para obtener todas las reservaciones
  const getAllReservationsComposable = useApiFetch<ReservationsApiResponse>(API_ENDPOINTS.reservation.getAllReservations, {
    immediate: false
  })

  // Composable para crear reservación
  const createReservationComposable = useApiPost<AttendanceReservation>(API_ENDPOINTS.reservation.create, {
    immediate: false
  })

  // Composable para obtener escuelas
  const getSchoolsComposable = useApiFetch(API_ENDPOINTS.reservation.getSchools, {
    immediate: false
  })

  // ============================================================================
  // ESTADOS REACTIVOS DE LÓGICA DE NEGOCIO
  // ============================================================================

  // Estados de UI y navegación
  const materialTab = ref('didactic')
  const reservationType = ref('')
  
  // Estados de loading granulares
  const isCreating = ref(false)
  const isLoadingSchools = ref(false)

  // Datos del formulario principal
  const reservationData = ref<ReservationFormData>({
    // Campos básicos
    name: '',
    email: '',
    phone: '',
    participants: 1,
    date: '',
    time: '',
    school: '',
    grade: '',
    purpose: '',
    specialNeeds: '',
    notes: '',
    
    // Campos específicos del paso 1
    totalAttendees: 1,
    hasUnder3: 'no',
    minors: 0,
    children: 0,
    adults: 1,
    seniors: 0,
    hasDisability: 'no',
    
    // Campos adicionales del paso 3
    source: '',
    preferences: '',
    comments: ''
  })

  // Datos específicos por tipo de reservación
  const businessData = ref<BusinessReservationData>({
    company: '',
    position: '',
    industry: '',
    objectives: '',
    participants: 1,
    samePersonResponsible: 'yes',
    representativeName: '',
    representativePhone: '',
    averageAge: '',
    mainConcepts: [],
    secondaryConcepts: [],
    municipality: '',
    specialNeeds: ''
  })

  const summerData = ref<SummerReservationData>({
    program: '',
    ageGroup: '',
    duration: '',
    activities: '',
    participants: 1,
    samePersonResponsible: 'yes',
    representativeName: '',
    representativeEmail: '',
    representativePhone: '',
    hasSpecialNeeds: 'no',
    municipality: '',
    specialNeeds: ''
  })

  const schoolData = ref<SchoolReservationData>({
    mainConcepts: [],
    secondaryConcepts: [],
    samePersonResponsible: true,
    representativeName: '',
    representativeEmail: '',
    representativePhone: '',
    municipality: '',
    specialNeeds: ''
  })

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  // Estados de loading consolidados
  const isLoading = computed(() => 
    getAllReservationsComposable.pending.value || 
    createReservationComposable.pending.value || 
    getSchoolsComposable.pending.value ||
    isCreating.value ||
    isLoadingSchools.value
  )

  // Estados de error consolidados  
  const error = computed(() => 
    getAllReservationsComposable.error.value || 
    createReservationComposable.error.value || 
    getSchoolsComposable.error.value
  )

  // Datos reactivos de la API
  const reservations = computed(() => {
    const apiData = getAllReservationsComposable.data.value
    const reservationsList = apiData?.response || []
    
    // Filtrar reservaciones canceladas
    const filteredReservations = reservationsList.filter(reservation => 
      reservation.status !== 'Cancelada'
    )
    
    console.log('🔍 Reservations computed:', { 
      apiData, 
      originalList: reservationsList, 
      filteredList: filteredReservations,
      cancelledCount: reservationsList.length - filteredReservations.length
    })
    
    return filteredReservations
  })
  const schools = readonly(getSchoolsComposable.data)

  // Computed para verificar si hay reservaciones
  const hasReservations = computed(() => {
    const hasRes = Boolean(reservations.value && reservations.value.length > 0)
    console.log('🔍 HasReservations computed:', { reservations: reservations.value, hasRes })
    return hasRes
  })

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Obtiene el ID del usuario autenticado para operaciones
   */
  const getUserModifiedId = (): string => {
    if (!user.value?.userId) {
      throw new Error('Usuario no autenticado')
    }
    return user.value.userId.toString()
  }

  /**
   * Maneja errores de forma consistente
   */
  const handleError = (err: any, operation: string) => {
    console.error(`Error en ${operation}:`, err)
    const errorMessage = getErrorMessage(err)
    showError('Error', errorMessage || `No se pudo ${operation}`)
    throw err
  }

  /**
   * Transforma datos del formulario a formato de API
   */
  const transformToApiRequest = (data: ReservationFormData): AddAttendanceReservationRequest => {
    return {
      userId: getUserModifiedId(),
      reservationId: `temp-reservation-${Date.now()}`, // Temporal hasta obtener ID real
      visitDate: data.date,
      timeSlot: data.time,
      notes: data.purpose || data.preferences || data.comments || ''
    }
  }

  // ============================================================================
  // OPERACIONES DE API CON AUTENTICACIÓN AUTOMÁTICA
  // ============================================================================

  /**
   * Obtiene todas las reservaciones con filtros opcionales
   */
  const getAllReservations = async (filters?: AttendanceFilters | Record<string, any>) => {
    try {
      await getAllReservationsComposable.execute({ query: filters || {} })
      const apiResponse = getAllReservationsComposable.data.value
      // Extraer el campo response de la respuesta de la API
      return apiResponse?.response || []
    } catch (err) {
      handleError(err, 'cargar reservaciones')
      return []
    }
  }

  /**
   * Crea una nueva reservación con autenticación automática
   */
  const createReservation = async (reservationData: AddAttendanceReservationRequest) => {
    if (isCreating.value) return null
    
    isCreating.value = true
    try {
      await createReservationComposable.execute({ body: reservationData })
      
      if (createReservationComposable.data.value) {
        showSuccess('Éxito', 'Reservación creada correctamente')
        return createReservationComposable.data.value
      }
      return null
    } catch (err) {
      handleError(err, 'crear reservación')
      return null
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Obtiene la lista de escuelas disponibles
   */
  const getSchools = async () => {
    if (isLoadingSchools.value) return schools.value

    isLoadingSchools.value = true
    try {
      await getSchoolsComposable.execute({ query: { TableName: 'Schools' } })
      return getSchoolsComposable.data.value
    } catch (err) {
      handleError(err, 'cargar escuelas')
      return []
    } finally {
      isLoadingSchools.value = false
    }
  }

  // ============================================================================
  // LÓGICA DE NEGOCIO Y GESTIÓN DE FORMULARIOS
  // ============================================================================


  /**
   * Inicia el proceso de nueva reservación
   */
  const startNewReservation = () => {
    resetReservationData()
    // La navegación se maneja en el componente padre
  }

  /**
   * Selecciona el tipo de reservación
   */
  const selectReservationType = (type: string) => {
    reservationType.value = type
    // La navegación la maneja el componente padre
  }

  /**
   * Mapea los códigos de tipo de reservación de la API a los tipos del frontend
   */
  const mapReservationTypeCode = (code: string): string => {
    const typeMapping: Record<string, string> = {
      'VE': 'empresarial',
      'GE': 'general', 
      'VES': 'escolar',
      'CV': 'curso-verano',
      // Mapeos adicionales para códigos que pueden venir de la persistencia
      'vg': 'general',  // Código abreviado para general
      'VG': 'general',  // Código abreviado para general
      'em': 'empresarial',  // Código abreviado para empresarial
      'ves': 'escolar',  // Código abreviado para escolar
      'cv': 'curso-verano',  // Código abreviado para curso-verano
      'vcv': 'curso-verano',  // Variante de curso-verano
    }
    
    return typeMapping[code] || code.toLowerCase()
  }

  /**
   * Ver detalles de una reservación específica
   */
  const viewReservationDetails = (reservation: any) => {
    console.log('🔍 Ver detalles de reservación:', reservation)
    console.log('🔍 reservation.reservationType:', reservation.reservationType)
    
    // Mapear el tipo de reservación de la API al tipo del frontend
    const mappedType = mapReservationTypeCode(reservation.reservationType)
    console.log('🔍 mappedType:', mappedType)
    
    // Establecer datos en el store ANTES de navegar para evitar problemas de timing
    // Importar el store dinámicamente para evitar problemas de SSR
    import('@/stores/reservation-form').then(({ useReservationFormStore }) => {
      const reservationFormStore = useReservationFormStore()
      
      // Establecer el ID y tipo de la reservación en el store
      reservationFormStore.setReservationId(Number(reservation.id))
      reservationFormStore.setAttendeeType(mappedType)
      
      console.log('✅ Datos establecidos en store ANTES de navegar:', { 
        id: reservation.id, 
        type: mappedType,
        originalType: reservation.reservationType
      })
      
      // Verificar que se estableció correctamente
      console.log('✅ Verificación - selectedAttendeeType en store:', reservationFormStore.selectedAttendeeType)
      
      // Navegar al formulario de reservación DESPUÉS de establecer los datos
      const route = `/reservations/formulario-reservacion?step=1`
      router.push(route)
    })
  }

  /**
   * Completa el proceso de reservación
   */
  const completeReservation = async (finalData?: any) => {
    try {
      // Crear el payload usando los datos del formulario
      const apiData = finalData || transformToApiRequest(reservationData.value)
      
      const result = await createReservation(apiData)
      
      if (result) {
        // Resetear el formulario
        resetReservationData()
        
        // Recargar las reservaciones si es necesario
        await getAllReservations()
        
        return result
      }
      return null
    } catch (error) {
      console.error('Error al completar la reservación:', error)
      return null
    }
  }

  /**
   * Resetea todos los datos del formulario
   */
  const resetReservationData = () => {
    reservationData.value = {
      name: '',
      email: '',
      phone: '',
      participants: 1,
      date: '',
      time: '',
      school: '',
      grade: '',
      purpose: '',
      specialNeeds: '',
      notes: '',
      totalAttendees: 1,
      hasUnder3: 'no',
      minors: 0,
      children: 0,
      adults: 1,
      seniors: 0,
      hasDisability: 'no',
      source: '',
      preferences: '',
      comments: ''
    }
    
    businessData.value = {
      company: '',
      position: '',
      industry: '',
      objectives: '',
      participants: 1,
      samePersonResponsible: 'yes',
      representativeName: '',
      representativePhone: '',
      averageAge: '',
      mainConcepts: [],
      secondaryConcepts: [],
      municipality: '',
      specialNeeds: ''
    }
    
    summerData.value = {
      program: '',
      ageGroup: '',
      duration: '',
      activities: '',
      participants: 1,
      samePersonResponsible: 'yes',
      representativeName: '',
      representativeEmail: '',
      representativePhone: '',
      hasSpecialNeeds: 'no',
      municipality: '',
      specialNeeds: ''
    }
    
    schoolData.value = {
      mainConcepts: [],
      secondaryConcepts: [],
      samePersonResponsible: true,
      representativeName: '',
      representativeEmail: '',
      representativePhone: '',
      municipality: '',
      specialNeeds: ''
    }
    
    reservationType.value = ''
  }


  /**
   * Carga las reservaciones del usuario actual
   */
  const loadReservations = async () => {
    try {
      // Obtener el ID del usuario logueado
      const userId = user.value?.userId
      if (!userId) {
        console.error('Usuario no autenticado')
        return
      }

      console.log('🔄 Cargando reservaciones para usuario:', userId)
      
      // Llamar a getAllReservations solo con VisitorId
      const result = await getAllReservations({ 
        VisitorId: parseInt(userId)
      })
      
      console.log('✅ Reservaciones cargadas:', result)
    } catch (error) {
      console.error('Error al cargar reservaciones:', error)
    }
  }

  /**
   * Busca una reservación específica por ID
   */
  const getReservationById = async (reservationId: number) => {
    try {
      // Obtener el ID del usuario logueado
      const userId = user.value?.userId
      if (!userId) {
        console.error('Usuario no autenticado')
        return
      }

      // Llamar a getAllReservations con Id, VisitorId y ReservationId
      await getAllReservations({ 
        Id: parseInt(userId),
        VisitorId: parseInt(userId),
        ReservationId: reservationId
      })
    } catch (error) {
      console.error('Error al cargar reservación específica:', error)
    }
  }

  /**
   * Carga la lista de escuelas disponibles
   */
  const loadSchools = async () => {
    try {
      await getSchools()
    } catch (error) {
      console.error('Error al cargar escuelas:', error)
    }
  }

  // ============================================================================
  // RETORNO DEL COMPOSABLE UNIFICADO
  // ============================================================================

  return {
    // Estados reactivos de UI
    materialTab: readonly(materialTab),
    reservationType: readonly(reservationType),
    
    // Estados de loading granulares
    isLoading: readonly(isLoading),
    isCreating: readonly(isCreating),
    isLoadingSchools: readonly(isLoadingSchools),
    error: readonly(error),
    
    // Datos del formulario
    reservationData: readonly(reservationData),
    businessData,
    summerData,
    schoolData,
    
    // Datos de la API
    reservations,
    schools,
    hasReservations,

    // Operaciones de API con autenticación automática
    getAllReservations,
    createReservation,
    getSchools,
    loadReservations,
    loadSchools,
    getReservationById,

    // Lógica de negocio del formulario
    startNewReservation,
    selectReservationType,
    viewReservationDetails,
    mapReservationTypeCode,
    completeReservation,
    resetReservationData
  }
}