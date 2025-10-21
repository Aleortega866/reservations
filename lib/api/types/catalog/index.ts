import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE CATÁLOGOS
// ============================================================================

export interface Catalog {
  id: number
  tableName: string
  value: string
  description?: string
  enable: boolean
  userModified: string
}

export interface GetAllCatalogsPublicRequest {
  id?: number
  tableName?: string
  value?: string,
  lstValues?: string
}

export interface GetAllCatalogsRequest {
  id?: number
  tableName?: string
  value?: string,
  lstValues?: string
}

// Tipos de respuesta
export interface CatalogResponse extends ApiResponse<Catalog> {}
export interface CatalogListResponse extends ApiResponse<Catalog[]> {}