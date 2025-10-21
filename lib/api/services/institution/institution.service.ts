// ============================================================================
// INSTITUTION SERVICE - Servicio de Gestión de Instituciones
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { 
  Institution, 
  CreateInstitutionRequest, 
  UpdateInstitutionRequest, 
  DeleteInstitutionRequest,
  GetInstitutionRequest,
  GetAllInstitutionCCTRequest,
  GetInstitutionByCCTRequest,
  GetAllInstitutionMunicipalityRequest,
  GetAllInstitutionLocalityRequest,
  GetAllInstitutionsRequest,
  Municipality,
  Locality
} from '../../types/institution'

/**
 * Servicio de gestión de instituciones educativas
 * @class InstitutionService
 */
export class InstitutionService {
  
  // ========================================================================
  // MÉTODOS CRUD BÁSICOS
  // ========================================================================

  /**
   * Crea una nueva institución
   * @param {CreateInstitutionRequest} data - Datos de la institución a crear
   * @returns {Promise<Institution>} Institución creada
   * @throws {Error} Error si no se puede crear la institución
   */
  async createInstitution(data: CreateInstitutionRequest): Promise<Institution> {
    const { execute } = useApiPost<{ response: Institution }>(
      API_ENDPOINTS.institution.create
    )
    
    const result = await execute({ body: data })
    return result.response
  }

  /**
   * Actualiza una institución existente
   * @param {UpdateInstitutionRequest} data - Datos de la institución a actualizar
   * @returns {Promise<Institution>} Institución actualizada
   * @throws {Error} Error si no se puede actualizar la institución
   */
  async updateInstitution(data: UpdateInstitutionRequest): Promise<Institution> {
    const { execute } = useApiPut<{ response: Institution }>(
      API_ENDPOINTS.institution.update
    )
    
    const result = await execute({ body: data })
    return result.response
  }

  /**
   * Elimina una institución
   * @param {DeleteInstitutionRequest} data - Datos para eliminar la institución
   * @returns {Promise<boolean>} True si se eliminó correctamente
   * @throws {Error} Error si no se puede eliminar la institución
   */
  async deleteInstitution(data: DeleteInstitutionRequest): Promise<boolean> {
    const { execute } = useApiDelete<{ response: boolean }>(
      API_ENDPOINTS.institution.delete
    )
    
    const result = await execute({ body: data })
    return result.response
  }

  /**
   * Obtiene una institución por su ID
   * @param {GetInstitutionRequest} params - Parámetros de consulta
   * @returns {Promise<Institution>} Institución encontrada
   * @throws {Error} Error si no se puede obtener la institución
   */
  async getInstitution(params: GetInstitutionRequest): Promise<Institution> {
    const { execute } = useApiFetch<{ response: Institution }>(
      API_ENDPOINTS.institution.getById,
      { immediate: false }
    )
    
    const result = await execute({ query: { Id: params.id } })
    return result.response
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA AVANZADA
  // ========================================================================

  /**
   * Obtiene instituciones con filtros CCT (Centro de Control y Trabajo)
   * @param {GetAllInstitutionCCTRequest} params - Parámetros de filtrado y paginación
   * @returns {Promise<Institution[]>} Lista de instituciones filtradas
   * @throws {Error} Error si no se pueden obtener las instituciones
   */
  async getAllInstitutionCCTFilter(params: GetAllInstitutionCCTRequest): Promise<Institution[]> {
    const { execute } = useApiFetch<{ response: Institution[] }>(
      API_ENDPOINTS.institution.getAllCCTFilter,
      { immediate: false }
    )
    
    const query: Record<string, any> = {
      StateId: params.stateId,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize
    }
    
    // Agregar filtros opcionales
    if (params.id !== undefined) {
      query.Id = params.id
    }
    
    if (params.institutionName) {
      query.InstitutionName = params.institutionName
    }
    
    if (params.cct) {
      query.CCT = params.cct
    }
    
    if (params.municipalityId !== undefined) {
      query.MunicipalityId = params.municipalityId
    }
    
    if (params.localityId !== undefined) {
      query.LocalityId = params.localityId
    }
    
    if (params.postalCode) {
      query.PostalCode = params.postalCode
    }
    
    if (params.educationalControlTypeId !== undefined) {
      query.EducationaControlTypeId = params.educationalControlTypeId
    }
    
    if (params.educationShiftId !== undefined) {
      query.EducationShiftId = params.educationShiftId
    }

    const result = await execute({ query })
    return result.response || []
  }


  /**
   * Obtiene instituciones solo por CCT (Centro de Control y Trabajo)
   * @param {GetAllInstitutionCCTRequest} params - Parámetros de búsqueda por CCT
   * @returns {Promise<Institution[]>} Lista de instituciones encontradas
   * @throws {Error} Error si no se pueden obtener las instituciones
   */
  async getAllInstitutionCCT(params: GetAllInstitutionCCTRequest): Promise<Institution[]> {
    const { execute } = useApiFetch<{ response: Institution[] }>(
      API_ENDPOINTS.institution.getAllCCTFilter,
      { immediate: false }
    )
    
    const query: Record<string, any> = {
      StateId: params.stateId,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize
    }
    
    // Agregar filtros opcionales
    if (params.id !== undefined) {
      query.Id = params.id
    }
    
    if (params.institutionName) {
      query.InstitutionName = params.institutionName
    }
    
    if (params.cct) {
      query.CCT = params.cct
    }
    
    if (params.municipalityId !== undefined) {
      query.MunicipalityId = params.municipalityId
    }
    
    if (params.localityId !== undefined) {
      query.LocalityId = params.localityId
    }
    
    if (params.postalCode) {
      query.PostalCode = params.postalCode
    }
    
    if (params.educationalControlTypeId !== undefined) {
      query.EducationaControlTypeId = params.educationalControlTypeId
    }
    
    if (params.educationShiftId !== undefined) {
      query.EducationShiftId = params.educationShiftId
    }

    const result = await execute({ query })
    return result.response || []
  }

  /**
   * Obtiene instituciones SOLO por CCT usando el endpoint específico
   * @param {GetInstitutionByCCTRequest} params - Parámetros de búsqueda por CCT
   * @returns {Promise<Institution[]>} Lista de instituciones encontradas
   * @throws {Error} Error si no se pueden obtener las instituciones
   */
  async getInstitutionByCCT(params: GetInstitutionByCCTRequest): Promise<Institution[]> {
    const { execute } = useApiFetch<{ response: Institution[] }>(
      API_ENDPOINTS.institution.getAllCCT,
      { immediate: false }
    )
    
    const query: Record<string, any> = {
      CCT: params.cct,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize
    }
    
    // Agregar ID opcional si está presente
    if (params.id !== undefined) {
      query.Id = params.id
    }

    const result = await execute({ query })
    return result.response || []
  }

  /**
   * Obtiene todas las instituciones con filtros básicos
   * @param {GetAllInstitutionsRequest} [params] - Parámetros de filtrado opcionales
   * @returns {Promise<Institution[]>} Lista de instituciones
   * @throws {Error} Error si no se pueden obtener las instituciones
   */
  async getAllInstitutions(params?: GetAllInstitutionsRequest): Promise<Institution[]> {
    const { execute } = useApiFetch<{ response: Institution[] }>(
      API_ENDPOINTS.institution.getAll,
      { immediate: false }
    )
    
    const query: Record<string, any> = {}
    
    if (params?.id !== undefined) {
      query.Id = params.id
    }
    
    if (params?.institutionName) {
      query.institutionName = params.institutionName
    }

    const result = await execute({ query })
    return result.response || []
  }

  // ========================================================================
  // MÉTODOS DE CATÁLOGOS GEOGRÁFICOS
  // ========================================================================

  /**
   * Obtiene los municipios disponibles por estado
   * @param {GetAllInstitutionMunicipalityRequest} params - Parámetros de consulta
   * @returns {Promise<Municipality[]>} Lista de municipios
   * @throws {Error} Error si no se pueden obtener los municipios
   */
  async getAllMunicipalities(params: GetAllInstitutionMunicipalityRequest): Promise<Municipality[]> {
    const { execute } = useApiFetch<{ response: Municipality[] }>(
      API_ENDPOINTS.institution.getAllMunicipalities,
      { immediate: false }
    )
    
    const result = await execute({ query: { StateId: params.stateId } })
    return result.response || []
  }

  /**
   * Obtiene las localidades disponibles por municipio
   * @param {GetAllInstitutionLocalityRequest} params - Parámetros de consulta
   * @returns {Promise<Locality[]>} Lista de localidades
   * @throws {Error} Error si no se pueden obtener las localidades
   */
  async getAllLocalities(params: GetAllInstitutionLocalityRequest): Promise<Locality[]> {
    const { execute } = useApiFetch<{ response: Locality[] }>(
      API_ENDPOINTS.institution.getAllLocalities,
      { immediate: false }
    )
    
    const result = await execute({ query: { StateId: params.stateId, MunicipalityId: params.municipalityId } })
    return result.response || []
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de instituciones
 * @type {InstitutionService}
 */
export const institutionService = new InstitutionService()
