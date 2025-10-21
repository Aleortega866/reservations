// ============================================================================
// TIPOS PARA EL SERVICIO DE VISITOR
// ============================================================================

// Entidades principales
export interface Visitor {
  id: number
  name: string
  email: string
  phone?: string
  userTypeId: number
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface VisitorCompany {
  id: number
  visitorId: number
  companyName: string | null
  industryTypeId: number
  postalCodeId: number
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

// Requests para operaciones CRUD
export interface CreateVisitorRequest {
  name: string
  email: string
  phone?: string
  userTypeId: number
  userModifiedId: number
}

export interface UpdateVisitorRequest {
  id: number
  name: string
  email: string
  phone?: string
  userTypeId: number
  userModifiedId: number
}

export interface CreateVisitorCompanyRequest {
  visitorId: number
  companyName: string | null
  industryTypeId: number
  postalCodeId: number
  userModifiedId: number
}

export interface DeleteVisitorCompanyRequest {
  id: number
  userModifiedId: number
}

// Filtros para búsquedas
export interface VisitorFilters {
  name?: string
  email?: string
  userTypeId?: number
  isActive?: boolean
  search?: string
}

export interface VisitorCompanyFilters {
  visitorId?: number
  industryTypeId?: number
  postalCodeId?: number
  isActive?: boolean
}

// Respuestas de API
export interface VisitorResponse {
  success: boolean
  data: Visitor
  message?: string
}

export interface VisitorCompanyResponse {
  success: boolean
  data: VisitorCompany
  message?: string
}

export interface VisitorsListResponse {
  success: boolean
  data: Visitor[]
  total: number
  message?: string
}

export interface VisitorCompaniesListResponse {
  success: boolean
  data: VisitorCompany[]
  total: number
  message?: string
}

// Instituciones educativas del visitante
export interface VisitorInstitution {
  id: number
  visitorId: number
  institutionName: string
  isSepRegistered: boolean
  userModifiedId?: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface VisitorInstitutionFilters {
  id?: number
  visitorId?: number
  email?: string
  enable?: boolean
}

export interface GetAllVisitorInstitutionsResponse {
  code: number
  isValid: boolean
  comments: string
  response: VisitorInstitution[]
}

export interface DeleteVisitorInstitutionRequest {
  id: number
  userModifiedId: number
}

export interface CreateVisitorInstitutionRequest {
  visitorId: number
  institutionId: number
  institutionName: string | null
  isSepRegistered: boolean
  educationControlId: number
  municipalityId: number
  postalCodeId: number
  userModifiedId: number
}