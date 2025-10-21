
import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE CATÁLOGOS
// ============================================================================

export interface Municipality {
  id: number
  municipality: string
  
}

export interface GetAllMunicipalitiesRequest {
  /** ID del municipio (integer, int32) */
  id?: number
  /** Nombre del municipio (string) */
  municipality?: string
}

// Tipos de respuesta
export interface MunicipalityResponse extends ApiResponse<Municipality> {}
export interface MunicipalityListResponse extends ApiResponse<Municipality[]> {}