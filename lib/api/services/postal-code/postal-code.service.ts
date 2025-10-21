// ============================================================================
// POSTAL CODE SERVICE - Servicio de Gestión de Códigos Postales
// ============================================================================

import { useApiFetch } from '../../core/useFetch'
import { API_ENDPOINTS } from '../../core/config'
import type { PostalCode, GetAllPostalCodesRequest } from '../../types/postal-code'

/**
 * Servicio de gestión de códigos postales que maneja consultas de ubicaciones
 * @class PostalCodeService
 */
export class PostalCodeService {
  
  // ========================================================================
  // MÉTODOS CRUD - GET (CONSULTAS)
  // ========================================================================

  /**
   * Obtiene todos los códigos postales con filtros opcionales
   * @param {GetAllPostalCodesRequest} [params] - Parámetros de consulta opcionales
   * @param {number} [params.id] - ID específico del código postal
   * @param {string} [params.postalCode] - Código postal específico
   * @param {string} [params.municipality] - Municipio específico
   * @returns {Promise<PostalCode[]>} Lista de códigos postales filtrados
   * @throws {Error} Error si no se pueden cargar los códigos postales
   */
  async getAllPostalCodes(params?: GetAllPostalCodesRequest): Promise<PostalCode[]> {
    const { execute } = useApiFetch<{ response: PostalCode[] }>(
      API_ENDPOINTS.postalCode.getAll, 
      { immediate: false }
    )
    
    const query: Record<string, any> = {}
    
    if (params?.id !== undefined) {
      query.Id = params.id
    }
    
    if (params?.postalCode) {
      query.PostalCode = params.postalCode
    }
    
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
 * Instancia singleton del servicio de códigos postales
 * @type {PostalCodeService}
 */
export const postalCodeService = new PostalCodeService()
