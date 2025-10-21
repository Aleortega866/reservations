import { ref, computed } from 'vue'
import { useApiFetch, API_ENDPOINTS } from '@/lib/api/core/useFetch'

// ============================================================================
// TIPOS DE LA API
// ============================================================================

export interface Material {
  materialId: number
  materialName: string
  shortDescription: string
  documentLink: string
  documentFormat: string
  documentSize: string
  duration: string
  suggestedMoment: string
  directedTo: string
  conceptName?: string
  linkedByData?: string
}

export interface EconomicConcept {
  conceptId: number
  conceptName: string
  materials: Material[]
}

export interface AgeGroup {
  groupCode: string
  ageGroupName: string
  primaryEconomicConcepts?: EconomicConcept[]
  secondaryEconomicConcepts?: EconomicConcept[]
  interestTopicConcepts?: EconomicConcept[]
  materials?: Material[] // Estructura legacy
}

export interface AcademicLevel {
  level: string
  levelDescription: string
  grades: {
    academicLevelId: number
    grade: string
    gradeDescription: string
    totalStudents: number
    primaryEconomicConcepts: EconomicConcept[]
    secondaryEconomicConcepts: EconomicConcept[]
    interestTopicConcepts?: EconomicConcept[]
    materials?: Material[]
  }[]
}

export interface MaterialsApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: {
    academicLevels?: AcademicLevel[]
    ageGroups?: AgeGroup[] // Mantener compatibilidad
    reservationId: number
    reservationType: string
  }
  token: string
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export const useMaterials = () => {
  const ageGroups = ref<AgeGroup[]>([])
  const academicLevels = ref<AcademicLevel[]>([])
  const reservationType = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Función para obtener materiales de la API
  const fetchMaterials = async (reservationId: number) => {
    if (!reservationId) {
      error.value = 'ID de reservación es requerido'
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const endpoint = API_ENDPOINTS.reservation.getPostcardMaterialLinks(reservationId)
      const { execute } = useApiFetch<MaterialsApiResponse>(endpoint)
      const response = await execute()
      
      // Verificar si la respuesta es válida
      if (!response.isValid || response.code === 500) {
        error.value = response.comments || 'Error al cargar los materiales'
        ageGroups.value = []
        return
      }
      
      // Verificar si hay datos válidos - manejar tanto academicLevels como ageGroups
      const hasAcademicLevels = response.response?.academicLevels && response.response.academicLevels.length > 0
      const hasAgeGroups = response.response?.ageGroups && response.response.ageGroups.length > 0
      
      if (!hasAcademicLevels && !hasAgeGroups) {
        error.value = 'No hay materiales disponibles para esta reservación'
        ageGroups.value = []
        academicLevels.value = []
        return
      }
      
      // Manejar academicLevels (nueva estructura)
      if (hasAcademicLevels) {
        academicLevels.value = response.response.academicLevels
        ageGroups.value = [] // Limpiar ageGroups si usamos academicLevels
      }
      
      // Manejar ageGroups (estructura anterior)
      if (hasAgeGroups) {
        ageGroups.value = response.response.ageGroups
        academicLevels.value = [] // Limpiar academicLevels si usamos ageGroups
      }
      
      reservationType.value = (response.response.reservationType || 'General').toLowerCase()
    } catch (err) {
      error.value = 'Error al cargar los materiales'
      ageGroups.value = []
      academicLevels.value = []
      console.error('Error fetching materials:', err)
    } finally {
      loading.value = false
    }
  }

  // Función para obtener grupos de edad para componentes
  const getAgeGroupsForComponent = () => {
    return computed(() => {
      return ageGroups.value.map(ageGroup => ({
        ...ageGroup,
        expanded: false // Estado inicial para expansión
      }))
    }).value
  }

  // Función para obtener niveles académicos para componentes
  const getAcademicLevelsForComponent = () => {
    return computed(() => {
      return academicLevels.value.map(level => ({
        ...level,
        grades: level.grades.map(grade => ({
          ...grade,
          expanded: false // Estado inicial para expansión
        }))
      }))
    }).value
  }


  return {
    // Estado
    ageGroups: computed(() => ageGroups.value),
    academicLevels: computed(() => academicLevels.value),
    reservationType: computed(() => reservationType.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Acciones
    fetchMaterials,
    getAgeGroupsForComponent,
    getAcademicLevelsForComponent
  }
}