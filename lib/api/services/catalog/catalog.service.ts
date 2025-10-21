// ============================================================================
// CATALOG SERVICE - Servicio de Gestión de Catálogos
// ============================================================================

import { useApiFetch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { Catalog, GetAllCatalogsPublicRequest, GetAllCatalogsRequest } from '../../types'

/**
 * Servicio de gestión de catálogos que maneja consultas públicas y privadas
 * @class CatalogService
 */
export class CatalogService {
  
  // ========================================================================
  // MÉTODOS DE CONSULTA PÚBLICA
  // ========================================================================

  /**
   * Obtiene todos los catálogos públicos (sin autenticación requerida)
   * @param {GetAllCatalogsPublicRequest} [params] - Parámetros de consulta opcionales
   * @param {number} [params.id] - ID específico del catálogo
   * @param {string} [params.tableName] - Nombre de la tabla del catálogo
   * @param {string} [params.value] - Valor específico a buscar
   * @returns {Promise<Catalog[]>} Lista de catálogos públicos filtrados
   * @throws {Error} Error si no se pueden cargar los catálogos públicos
   */
  async getAllCatalogsPublic(params?: GetAllCatalogsPublicRequest): Promise<Catalog[]> {
    const { execute } = useApiFetch<{ response: Catalog[] }>(
      API_ENDPOINTS.catalog.getAllPublic, 
      { immediate: false }
    )
    
    const query: Record<string, any> = {}
    
    if (params?.id !== undefined) {
      query.Id = params.id
    }
    
    if (params?.tableName) {
      query.TableName = params.tableName
    }
    
    if (params?.value) {
      query.Value = params.value
    }

    if (params?.lstValues) {
      query.lstValues = params.lstValues
    }

    const result = await execute({ query })
    return result.response || []
  }

  // ========================================================================
  // MÉTODOS DE CONSULTA PRIVADA (REQUIEREN AUTENTICACIÓN)
  // ========================================================================

  /**
   * Obtiene todos los catálogos (requiere autenticación)
   * @param {GetAllCatalogsRequest} [params] - Parámetros de consulta opcionales
   * @param {number} [params.id] - ID específico del catálogo
   * @param {string} [params.tableName] - Nombre de la tabla del catálogo
   * @param {string} [params.value] - Valor específico a buscar
   * @returns {Promise<Catalog[]>} Lista de catálogos filtrados
   * @throws {Error} Error si no se pueden cargar los catálogos
   */
  async getAllCatalogs(params?: GetAllCatalogsRequest): Promise<Catalog[]> {
    const { execute } = useApiFetch<{ response: Catalog[] }>(
      API_ENDPOINTS.catalog.getAll, 
      { immediate: false }
    )
    
    const query: Record<string, any> = {}
    
    if (params?.id !== undefined) {
      query.Id = params.id
    }
    
    if (params?.tableName) {
      query.TableName = params.tableName
    }
    
    if (params?.value) {
      query.Value = params.value
    }

    if (params?.lstValues) {
      query.lstValues = params.lstValues
    }


    const result = await execute({ query })
    return result.response || []
  }
}

// ============================================================================
// INSTANCIA EXPORTADA
// ============================================================================

/**
 * Instancia singleton del servicio de catálogos
 * @type {CatalogService}
 */
export const catalogService = new CatalogService() 