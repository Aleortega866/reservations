import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE INSTITUCIONES
// ============================================================================

export interface Institution {
  id: number
  institutionName: string | null
  userModifiedId: number
  cct?: string
  stateId?: number
  municipalityId?: number
  localityId?: number
  postalCode?: string
  educationalControlTypeId?: number
  educationShiftId?: number
}

// ============================================================================
// INTERFACES DE PETICIÓN
// ============================================================================

export interface CreateInstitutionRequest {
  institutionName: string | null
  userModifiedId: number
}

export interface UpdateInstitutionRequest {
  id: number
  institutionName: string | null
  userModifiedId: number
}

export interface DeleteInstitutionRequest {
  id: number
  userModifiedId: number
}

export interface GetInstitutionRequest {
  id: number
}

export interface GetAllInstitutionCCTRequest {
  id?: number
  institutionName?: string
  cct?: string
  stateId: number // required
  municipalityId?: number
  localityId?: number
  postalCode?: string
  educationalControlTypeId?: number
  educationShiftId?: number
  pageNumber: number // required
  pageSize: number // required
}

// Tipo específico para búsqueda solo por CCT
export interface GetInstitutionByCCTRequest {
  id?: number
  cct: string // required
  pageNumber: number // required
  pageSize: number // required
}

export interface GetAllInstitutionMunicipalityRequest {
  stateId: number
}

export interface GetAllInstitutionLocalityRequest {
  stateId: number
  municipalityId: number
}

export interface GetAllInstitutionsRequest {
  id?: number
  institutionName?: string
}

// ============================================================================
// INTERFACES DE RESPUESTA
// ============================================================================

export interface InstitutionResponse extends ApiResponse<Institution> {}
export interface InstitutionListResponse extends ApiResponse<Institution[]> {}

// ============================================================================
// INTERFACES PARA MUNICIPIOS Y LOCALIDADES
// ============================================================================

export interface Municipality {
  id: number
  name: string
  stateId: number
}

export interface Locality {
  id: number
  name: string
  municipalityId: number
}

export interface MunicipalityResponse extends ApiResponse<Municipality[]> {}
export interface LocalityResponse extends ApiResponse<Locality[]> {}
