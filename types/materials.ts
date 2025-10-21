// ============================================================================
// TIPOS PARA MATERIALES DIDÁCTICOS - NUEVA ESTRUCTURA API
// ============================================================================

export interface Material {
  id: number
  materialName: string
  shortDescription: string
  directedTo: string
  consultationTime: string
  documentSize: number
  documentFormat: string
  documentLink: string
  thumbnailUrl?: string
  linkedByData?: string
  durationMinutes?: number
}

export interface EconomicConcept {
  conceptId: number
  conceptName: string
  linkedExhibitionsCount: number
  materials: Material[]
}

export interface AgeGroup {
  groupCode: string
  ageGroupName: string
  minAge: number
  maxAge: number
  totalPeople: number
  primaryEconomicConcepts?: EconomicConcept[]
  secondaryEconomicConcepts?: EconomicConcept[]
  interestTopicConcepts?: EconomicConcept[]
}

export interface MaterialsApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: {
    reservationId: number
    ageGroups: AgeGroup[]
  }
  token: string
}

// Tipos para el componente (estructura interna)
export interface AgeGroupForComponent {
  id: string
  name: string
  expanded: boolean
  materials: Material[]
  totalPeople: number
  groupCode: string
  ageGroupName: string
  primaryEconomicConcepts?: EconomicConcept[]
  secondaryEconomicConcepts?: EconomicConcept[]
  interestTopicConcepts?: EconomicConcept[]
}

export interface MaterialForComponent extends Material {
  conceptName?: string
  isPrimary?: boolean
}


