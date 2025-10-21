// ============================================================================
// MUNICIPALITY SERVICE - Servicio de Gestión de Municipios
// ============================================================================

import { useApiFetch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { Municipality, GetAllMunicipalitiesRequest } from '../../types/municipality'

/**
 * Servicio de gestión de municipios
 * @class MunicipalityService
 */
export class MunicipalityService {
  
  // ========================================================================
  // MÉTODOS DE CONSULTA
  // ========================================================================

  /**
   * Obtiene todos los municipios con filtros opcionales
   * @param {GetAllMunicipalitiesRequest} [params] - Parámetros de consulta opcionales
   * @param {number} [params.id] - ID específico del municipio (integer, int32)
   * @param {string} [params.municipality] - Nombre del municipio a buscar
   * @returns {Promise<Municipality[]>} Lista de municipios filtrados
   * @throws {Error} Error si no se pueden cargar los municipios
   */
  async getAllMunicipalities(params?: GetAllMunicipalitiesRequest): Promise<Municipality[]> {
    const { execute } = useApiFetch<{ response: Municipality[] }>(
      API_ENDPOINTS.municipality.getAll, 
      { immediate: false }
    )
    
    const query: Record<string, any> = {}
    
    // Parámetro Id (integer, int32)
    if (params?.id !== undefined) {
      query.Id = params.id
    }
    
    // Parámetro Municipality (string)
    if (params?.municipality) {
      query.Municipality = params.municipality
    }

    const result = await execute({ query })
    return result.response || []
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de municipios
 * @type {MunicipalityService}
 */
export const municipalityService = new MunicipalityService() 