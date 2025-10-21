// ============================================================================
// USE INSTITUTIONS COMPOSABLE - Gestión de Instituciones en Vue
// ============================================================================

import { ref, computed, readonly } from 'vue'
import { institutionService } from '~/lib/api/services'
import type { 
  Institution, 
  CreateInstitutionRequest, 
  UpdateInstitutionRequest, 
  DeleteInstitutionRequest,
  GetAllInstitutionCCTRequest,
  GetAllInstitutionMunicipalityRequest,
  GetAllInstitutionLocalityRequest,
  Municipality,
  Locality
} from '~/lib/api/types'

/**
 * Composable para la gestión de instituciones educativas
 * Proporciona métodos reactivos para interactuar con el servicio de instituciones
 */
export function useInstitutions() {
  // ========================================================================
  // ESTADOS REACTIVOS
  // ========================================================================
  
  const institutions = ref<Institution[]>([])
  const municipalities = ref<Municipality[]>([])
  const localities = ref<Locality[]>([])
  const currentInstitution = ref<Institution | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========================================================================
  // COMPUTED PROPERTIES
  // ========================================================================
  
  const hasInstitutions = computed(() => institutions.value.length > 0)
  const hasMunicipalities = computed(() => municipalities.value.length > 0)
  const hasLocalities = computed(() => localities.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // ========================================================================
  // MÉTODOS CRUD
  // ========================================================================
  
  /**
   * Crea una nueva institución
   */
  const createInstitution = async (data: CreateInstitutionRequest): Promise<Institution | null> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.createInstitution(data)
      institutions.value.push(result)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear la institución'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una institución existente
   */
  const updateInstitution = async (data: UpdateInstitutionRequest): Promise<Institution | null> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.updateInstitution(data)
      const index = institutions.value.findIndex(inst => inst.id === data.id)
      if (index !== -1) {
        institutions.value[index] = result
      }
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la institución'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una institución
   */
  const deleteInstitution = async (data: DeleteInstitutionRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.deleteInstitution(data)
      if (result) {
        institutions.value = institutions.value.filter(inst => inst.id !== data.id)
      }
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar la institución'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene una institución por ID
   */
  const getInstitution = async (id: number): Promise<Institution | null> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.getInstitution({ id })
      currentInstitution.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener la institución'
      return null
    } finally {
      loading.value = false
    }
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA
  // ========================================================================
  
  /**
   * Obtiene instituciones con filtros CCT
   */
  const getAllInstitutionCCT = async (params: GetAllInstitutionCCTRequest): Promise<Institution[]> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.getAllInstitutionCCT(params)
      institutions.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener las instituciones'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene instituciones SOLO por CCT (sin filtros adicionales)
   */
  const getInstitutionByCCT = async (params: { cct: string; pageNumber?: number; pageSize?: number; id?: number }): Promise<Institution[]> => {
    loading.value = true
    error.value = null
    
    try {
      const searchParams = {
        cct: params.cct,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        id: params.id
      }
      
      const result = await institutionService.getInstitutionByCCT(searchParams)
      institutions.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener la institución por CCT'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene todas las instituciones
   */
  const getAllInstitutions = async (params?: { id?: number; institutionName?: string }): Promise<Institution[]> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.getAllInstitutions(params)
      institutions.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener las instituciones'
      return []
    } finally {
      loading.value = false
    }
  }

  // ========================================================================
  // MÉTODOS DE CATÁLOGOS GEOGRÁFICOS
  // ========================================================================
  
  /**
   * Obtiene municipios por estado
   */
  const getMunicipalities = async (stateId: number): Promise<Municipality[]> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.getAllMunicipalities({ stateId })
      municipalities.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener los municipios'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene localidades por municipio
   */
  const getLocalities = async (stateId: number, municipalityId: number): Promise<Locality[]> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await institutionService.getAllLocalities({ stateId, municipalityId })
      localities.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener las localidades'
      return []
    } finally {
      loading.value = false
    }
  }

  // ========================================================================
  // MÉTODOS DE UTILIDAD
  // ========================================================================
  
  /**
   * Limpia el error actual
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Limpia todos los estados
   */
  const reset = () => {
    institutions.value = []
    municipalities.value = []
    localities.value = []
    currentInstitution.value = null
    loading.value = false
    error.value = null
  }

  // ========================================================================
  // RETORNO DEL COMPOSABLE
  // ========================================================================
  
  return {
    // Estados reactivos
    institutions: readonly(institutions),
    municipalities: readonly(municipalities),
    localities: readonly(localities),
    currentInstitution: readonly(currentInstitution),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed properties
    hasInstitutions,
    hasMunicipalities,
    hasLocalities,
    isLoading,
    hasError,
    
    // Métodos CRUD
    createInstitution,
    updateInstitution,
    deleteInstitution,
    getInstitution,
    
    // Métodos de consulta
    getAllInstitutionCCT,
    getInstitutionByCCT,
    getAllInstitutions,
    
    // Métodos de catálogos
    getMunicipalities,
    getLocalities,
    
    // Métodos de utilidad
    clearError,
    reset
  }
}
