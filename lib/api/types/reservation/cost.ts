// ============================================================================
// RESERVATION COST TYPES - Tipos para Gestión de Costos de Reservaciones
// ============================================================================

/**
 * Respuesta del costo total de una reservación
 */
export interface ReservationCostData {
  /** Total de niños menores de 3 años */
  totalKidsUnderThree: number
  /** Total de niños */
  totalKids: number
  /** Total de niños con discapacidad */
  totalKidsWithDisabilities: number
  /** Total de adolescentes */
  totalTeenagers: number
  /** Total de adolescentes con discapacidad */
  totalTeenagersWithDisabilities: number
  /** Total de adultos jóvenes */
  totalYoungAdults: number
  /** Total de adultos jóvenes con discapacidad */
  totalYoungAdultsWithDisabilities: number
  /** Total de adultos */
  totalAdults: number
  /** Total de adultos con discapacidad */
  totalAdultsWithDisabilities: number
  /** Total de adultos mayores */
  totalSeniors: number
  /** Total de adultos mayores con discapacidad */
  totalSeniorsWithDisabilities: number
  /** Total de personas con discapacidad */
  totalDisabilities: number
  /** Total de personas */
  totalPeople: number
  /** Costo total calculado */
  totalCost: number
}

/**
 * Respuesta de la API para obtener el costo de una reservación
 */
export interface ReservationCostResponse {
  /** Código de respuesta HTTP */
  code: number
  /** Indica si la respuesta es válida */
  isValid: boolean
  /** Comentarios adicionales */
  comments: string
  /** Datos del costo de la reservación */
  response: ReservationCostData
  /** Token de autenticación */
  token: string
}
