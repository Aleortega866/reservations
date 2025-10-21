// ============================================================================
// TIPOS PARA EL MENÚ DE VISITA
// ============================================================================

export interface VisitMenuExhibition {
  conceptoEconomicoExhibicion: string
  exhibicion: string
  ubicacion: string
  piso: string
  contenidos: string
  procesoAprendizaje: string
  enlace: string
}

export interface VisitMenuApiResponse {
  code: number
  isValid: boolean
  comments: string
  response: VisitMenuExhibition[]
  token: string
}

export interface VisitMenuFloor {
  id: string
  name: string
  expanded: boolean
  exhibitions: VisitMenuExhibitionItem[]
}

export interface VisitMenuExhibitionItem {
  id: string
  name: string
  expanded: boolean
  conceptoEconomicoExhibicion: string
  ubicacion: string
  contenidos: string
  procesoAprendizaje: string
  enlace: string
  // Thumbnails dinámicos basados en enlaces
  thumbnails: VisitMenuThumbnail[]
}

export interface VisitMenuThumbnail {
  id: string
  type: string
  name: string
  content: string
  enlace: string
  expanded: boolean
}

export interface VisitMenuSection {
  id: string
  name: string
  expanded: boolean
  description: string
  content: string
  learningObjective: string
  activities: string[]
}
