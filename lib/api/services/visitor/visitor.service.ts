// ============================================================================
// VISITOR SERVICE - Servicio de Gestión de Visitantes
// ============================================================================

import { useApiFetch, useApiPost, useApiPut, useApiDelete } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type {
  Visitor,
  VisitorCompany,
  CreateVisitorRequest,
  UpdateVisitorRequest,
  CreateVisitorCompanyRequest,
  DeleteVisitorCompanyRequest,
  VisitorFilters,
  VisitorCompanyFilters,
  VisitorInstitution,
  VisitorInstitutionFilters,
  DeleteVisitorInstitutionRequest,
  CreateVisitorInstitutionRequest
} from '../../types/visitor'

/**
 * Servicio de gestión de visitantes que maneja CRUD, compañías e instituciones
 * @class VisitorService
 */
export class VisitorService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los visitantes con filtros opcionales
   * @param {VisitorFilters} [filters] - Filtros opcionales para la consulta
   * @returns {Promise<Visitor[]>} Lista de visitantes filtrados
   * @throws {Error} Error si no se pueden cargar los visitantes
   */
  async getAllVisitors(filters?: VisitorFilters): Promise<Visitor[]> {
    const { execute } = useApiFetch<Visitor[]>(
      API_ENDPOINTS.visitor.getAll,
      { immediate: false }
    )
    
    const params = filters ? Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>) : {}
    
    return execute({ query: params })
  }

  /**
   * Obtiene un visitante específico por su ID
   * @param {number} id - ID del visitante a buscar
   * @returns {Promise<{success: boolean; data: Visitor | undefined}>} Resultado de la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async getVisitorById(id: number) {
    const visitors = await this.getAllVisitors()
    const visitor = visitors.find((v: Visitor) => v.id === id)
    return {
      success: !!visitor,
      data: visitor
    }
  }

  /**
   * Obtiene visitantes activos del sistema
   * @returns {Promise<Visitor[]>} Lista de visitantes activos
   * @throws {Error} Error si no se pueden cargar los visitantes activos
   */
  async getActiveVisitors(): Promise<Visitor[]> {
    return this.getAllVisitors({ isActive: true })
  }

  /**
   * Obtiene visitantes por tipo de usuario
   * @param {number} userTypeId - ID del tipo de usuario
   * @returns {Promise<Visitor[]>} Lista de visitantes del tipo especificado
   * @throws {Error} Error si no se pueden cargar los visitantes
   */
  async getVisitorsByUserType(userTypeId: number): Promise<Visitor[]> {
    return this.getAllVisitors({ userTypeId })
  }

  /**
   * Obtiene compañías de visitantes con filtros opcionales
   * @param {object} [filters] - Filtros opcionales
   * @param {number} [filters.id] - ID específico de la compañía
   * @param {number} [filters.visitorId] - ID del visitante
   * @returns {Promise<VisitorCompany[]>} Lista de compañías filtradas
   * @throws {Error} Error si no se pueden cargar las compañías
   */
  async getVisitorCompanies(filters?: { id?: number; visitorId?: number }): Promise<VisitorCompany[]> {

    const { execute } = useApiFetch<any>(
      API_ENDPOINTS.visitor.getAllCompanies,
      { immediate: false }
    )
    
    const params: Record<string, any> = {}
    if (typeof filters?.id === 'number') params.Id = filters.id
    if (typeof filters?.visitorId === 'number') params.VisitorId = filters.visitorId
    
    const result = await execute({ query: params })

    
    // Manejar diferentes estructuras de respuesta
    if (Array.isArray(result)) {
      return result
    } else if (result?.data && Array.isArray(result.data)) {
      return result.data
    } else if (result?.response && Array.isArray(result.response)) {
      return result.response
    } else if (result?.data?.response && Array.isArray(result.data.response)) {
      return result.data.response
    }
    
    console.warn('⚠️ Estructura de respuesta inesperada:', result)
    return []
  }

  /**
   * Obtiene instituciones educativas del visitante
   * @param {VisitorInstitutionFilters} [filters] - Filtros opcionales
   * @param {number} [filters.id] - ID específico de la institución
   * @param {number} [filters.visitorId] - ID del visitante
   * @param {string} [filters.email] - Email del visitante
   * @param {boolean} [filters.enable] - Estado de habilitación (por defecto true)
   * @returns {Promise<{code: number; isValid: boolean; comments: string; response?: VisitorInstitution[]}>} Respuesta con instituciones
   * @throws {Error} Error si no se pueden cargar las instituciones
   */
  async getVisitorInstitutions(filters?: VisitorInstitutionFilters) {
    const { execute } = useApiFetch<{ code: number; isValid: boolean; comments: string; response?: VisitorInstitution[] }>(
      API_ENDPOINTS.visitor.getAllInstitutions,
      { immediate: false }
    )
    
    const params: Record<string, any> = {}
    if (typeof filters?.id === 'number') params.Id = filters.id
    if (typeof filters?.visitorId === 'number') params.VisitorId = filters.visitorId
    if (typeof filters?.email === 'string') params.Email = filters.email
    if (typeof filters?.enable === 'boolean') params.Enable = filters.enable
    // Si enable no está definido, usar true por defecto
    if (filters?.enable === undefined) params.Enable = true
    
    return execute({ query: params })
  }

  // ========================================================================
  // MÉTODOS CRUD - POST (CREACIÓN)
  // ========================================================================

  /**
   * Crea un nuevo visitante en el sistema
   * @param {CreateVisitorRequest} data - Datos del nuevo visitante
   * @returns {Promise<Visitor>} Información del visitante creado
   * @throws {Error} Error si los datos son inválidos
   */
  async createVisitor(data: CreateVisitorRequest): Promise<Visitor> {
    const { execute } = useApiPost<Visitor>(
      API_ENDPOINTS.visitor.create,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Crea una nueva compañía para un visitante
   * @param {CreateVisitorCompanyRequest} data - Datos de la nueva compañía
   * @returns {Promise<VisitorCompany>} Información de la compañía creada
   * @throws {Error} Error si los datos son inválidos
   */
  async createVisitorCompany(data: CreateVisitorCompanyRequest): Promise<VisitorCompany> {
    console.log('🔧 Servicio createVisitorCompany - Datos recibidos:', data)
    console.log('🔧 Endpoint:', API_ENDPOINTS.visitor.createCompany)
    
    const { execute } = useApiPost<VisitorCompany>(
      API_ENDPOINTS.visitor.createCompany,
      { immediate: false }
    )
    
    const result = await execute({ body: data })
    console.log('🔧 Servicio createVisitorCompany - Respuesta:', result)
    
    return result
  }

  // ========================================================================
  // MÉTODOS CRUD - PUT (ACTUALIZACIÓN)
  // ========================================================================

  /**
   * Actualiza un visitante existente
   * @param {UpdateVisitorRequest} data - Nuevos datos del visitante
   * @returns {Promise<Visitor>} Información del visitante actualizado
   * @throws {Error} Error si el visitante no existe o datos inválidos
   */
  async updateVisitor(data: UpdateVisitorRequest): Promise<Visitor> {
    const { execute } = useApiPut<Visitor>(
      API_ENDPOINTS.visitor.update,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS CRUD - DELETE (ELIMINACIÓN)
  // ========================================================================

  /**
   * Elimina un visitante del sistema
   * @param {number} id - ID del visitante a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si el visitante no existe
   */
  async deleteVisitor(id: number): Promise<void> {
    const { execute } = useApiDelete(
      `${API_ENDPOINTS.visitor.delete}?id=${id}`,
      { immediate: false }
    )
    return execute()
  }

  /**
   * Elimina una compañía de visitante
   * @param {DeleteVisitorCompanyRequest} data - Datos de la compañía a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si la compañía no existe
   */
  async deleteVisitorCompany(data: DeleteVisitorCompanyRequest): Promise<void> {
    const { execute } = useApiDelete(
      API_ENDPOINTS.visitor.deleteCompany,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Crea una nueva institución educativa para el visitante
   * @param {CreateVisitorInstitutionRequest} data - Datos de la institución a crear
   * @returns {Promise<{success: boolean; data: VisitorInstitution}>} Resultado de la creación
   * @throws {Error} Error si no se puede crear la institución
   */
  async createVisitorInstitution(data: CreateVisitorInstitutionRequest): Promise<{success: boolean; data: VisitorInstitution}> {
    const { execute } = useApiPost<{success: boolean; data: VisitorInstitution}>(
      API_ENDPOINTS.visitor.addInstitution,
      { immediate: false }
    )
    return execute({ body: data })
  }

  /**
   * Elimina una institución educativa del visitante
   * @param {DeleteVisitorInstitutionRequest} data - Datos de la institución a eliminar
   * @returns {Promise<void>} Confirmación de eliminación
   * @throws {Error} Error si la institución no existe
   */
  async deleteVisitorInstitution(data: DeleteVisitorInstitutionRequest): Promise<void> {
    const { execute } = useApiDelete(
      API_ENDPOINTS.visitor.deleteInstitution,
      { immediate: false }
    )
    return execute({ body: data })
  }

  // ========================================================================
  // MÉTODOS UTILITARIOS
  // ========================================================================

  /**
   * Busca visitantes por nombre o email
   * @param {string} query - Término de búsqueda
   * @param {VisitorFilters} [filters] - Filtros adicionales
   * @returns {Promise<Visitor[]>} Lista de visitantes que coinciden con la búsqueda
   * @throws {Error} Error si no se puede realizar la búsqueda
   */
  async searchVisitors(query: string, filters?: VisitorFilters): Promise<Visitor[]> {
    const searchFilters = { ...filters, search: query }
    return this.getAllVisitors(searchFilters)
  }

  /**
   * Verifica si un email ya está registrado
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} True si el email ya existe, false en caso contrario
   * @throws {Error} Error si no se puede verificar el email
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const visitors = await this.getAllVisitors({ email })
      return visitors.some(visitor => visitor.email === email)
    } catch (error) {
      console.error('Error verificando email:', error)
      return false
    }
  }

  /**
   * Obtiene estadísticas básicas de visitantes
   * @returns {Promise<{total: number; active: number; inactive: number}>} Estadísticas de visitantes
   * @throws {Error} Error si no se pueden obtener las estadísticas
   */
  async getVisitorStats() {
    try {
      const allVisitors = await this.getAllVisitors()
      const activeVisitors = await this.getActiveVisitors()
      
      return {
        total: allVisitors.length || 0,
        active: activeVisitors.length || 0,
        inactive: (allVisitors.length || 0) - (activeVisitors.length || 0)
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0
      }
    }
  }

  /**
   * Obtiene compañías por filtros (pendiente de implementación)
   * @param {VisitorCompanyFilters} filters - Filtros para las compañías
   * @returns {Promise<{success: boolean; data: VisitorCompany[]}>} Resultado temporal
   * @throws {Error} Error si no se puede procesar la solicitud
   */
  async getVisitorCompaniesByFilters(filters: VisitorCompanyFilters) {
    // Implementar cuando se agregue el endpoint correspondiente
    return {
      success: true,
      data: [] as VisitorCompany[]
    }
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de visitantes
 * @type {VisitorService}
 */
export const visitorService = new VisitorService()
