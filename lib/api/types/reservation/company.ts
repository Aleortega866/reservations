// ============================================================================
// TIPOS E INTERFACES PARA RESERVACIONES EMPRESARIALES
// ============================================================================

import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES PARA PASO 1 - INFORMACIÓN BÁSICA
// ============================================================================

export interface CreateReservationCompanyStep1Request {
  visitorId: number
  companyId: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  reservationDate: string // ISO 8601 date-time format
  checkInDateId: number
  visitObjectiveId: number
}

export interface UpdateReservationCompanyStep1Request {
  reservationId: number
  companyId: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  reservationDate: string // ISO 8601 date-time format
  checkInDateId: number
  visitObjectiveId: number
}

export interface ReservationCompanyStep1Response {
  reservationId: number
  visitorId: number
  companyId: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  reservationDate: string
  checkInDateId: number
  visitObjectiveId: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA PASO 2 - INFORMACIÓN DEL RESPONSABLE
// ============================================================================

export interface UpdateReservationCompanyStep2Request {
  reservationId: number
  mainEconomicConceptId: number | null
  secondaryEconomicConceptId: number | null
  isReservationPersonAlsoResponsible: boolean | null
  isResponsibleNotAssigned: boolean | null
  fullName: string | null
  email: string | null
  phone: string | null
  positionTypeIds: number[] | null
  ageRangeIds: number[] | null
  specialAssistanceIds: number[] | null
}

export interface ReservationCompanyStep2Response {
  reservationId: number
  mainEconomicConceptId: number | null
  secondaryEconomicConceptId: number | null
  isReservationPersonAlsoResponsible: boolean | null
  isResponsibleNotAssigned: boolean | null
  fullName: string | null
  email: string | null
  phone: string | null
  positionTypeIds: number[] | null
  ageRangeIds: number[] | null
  specialAssistanceIds: number[] | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA PASO 3 - INFORMACIÓN ADICIONAL Y PAGO
// ============================================================================

/**
 * Interfaz para el desglose de costos devuelto por el endpoint getStep3
 */
export interface CostBreakdown {
  totalPeople: number
  totalCost: number
  totalKidsUnderThree: number
  totalKids: number
  totalTeenagers: number
  totalYoungAdults: number
  totalAdults: number
  totalSeniors: number
  totalKidsWithDisabilities: number
  totalTeenagersWithDisabilities: number
  totalYoungAdultsWithDisabilities: number
  totalAdultsWithDisabilities: number
  totalSeniorsWithDisabilities: number
  totalDisabilities: number
  costKids: number
  costAdults: number
  costSeniors: number
  costDisability: number
  costKidsTotal: number
  costTeenagersTotal: number
  costYoungAdultsTotal: number
  costAdultsTotal: number
  costSeniorsTotal: number
  costDisabilitiesTotal: number
}

export interface UpdateReservationCompanyStep3Request {
  reservationId: number
  discoveryChannelId: number | null
  paymentMethodId: number | null
  requiresMediationService: boolean | null
  requiresDetailedLocationInformation: boolean | null
  requestsPostVisitInvoice: boolean | null
  needsCheckoutProcessInformation: boolean | null
  confirmsInformationAccuracy: boolean | null
 // totalPeople: number | null
  //totalCost: number | null
  // Campos adicionales del formulario
  parkingInfo: boolean | null
  invoice: boolean | null
  providerInfo: boolean | null
  documents: Array<{
    name: string
    file: File
    url: string
    size: number
  }> | null
}

export interface ReservationCompanyStep3Response {
  reservationId: number
  discoveryChannelId: number | null
  paymentMethodId: number | null
  requiresMediationService: boolean | null
  requiresDetailedLocationInformation: boolean | null
  requestsPostVisitInvoice: boolean | null
  needsCheckoutProcessInformation: boolean | null
  confirmsInformationAccuracy: boolean | null
  costBreakdown: CostBreakdown
  // Campos adicionales del formulario
  parkingInfo: boolean | null
  invoice: boolean | null
  providerInfo: boolean | null
  documents: Array<{
    name: string
    file: File
    url: string
    size: number
  }> | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES COMPLETAS DE RESERVACIÓN EMPRESARIAL
// ============================================================================

export interface ReservationCompany {
  id: number | string
  visitorId: number
  companyId: number
  
  // Paso 1 - Información básica
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  reservationDate: string
  checkInDateId: number
  visitObjectiveId: number
  
  // Paso 2 - Información del responsable
  mainEconomicConceptId: number | null
  secondaryEconomicConceptId: number | null
  isReservationPersonAlsoResponsible: boolean | null
  isResponsibleNotAssigned: boolean | null
  fullName: string | null
  email: string | null
  phone: string | null
  positionTypeIds: number[] | null
  ageRangeIds: number[] | null
  specialAssistanceIds: number[] | null
  
  // Paso 3 - Información adicional y pago
  discoveryChannelId: number | null
  paymentMethodId: number | null
  requiresMediationService: boolean | null
  requiresDetailedLocationInformation: boolean | null
  requestsPostVisitInvoice: boolean | null
  needsCheckoutProcessInformation: boolean | null
  confirmsInformationAccuracy: boolean | null
  totalPeople: number | null
  totalCost: number | null
  // Campos adicionales del formulario
  parkingInfo: boolean | null
  invoice: boolean | null
  providerInfo: boolean | null
  documents: Array<{
    name: string
    file: File
    url: string
    size: number
  }> | null
  
  // Metadatos
  status: 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA FORMULARIOS DE UI
// ============================================================================

export interface ReservationCompanyFormData {
  // Paso 1
  visitorId: number | null
  companyId: number | null
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  reservationDate: string
  checkInDateId: number | null
  visitObjectiveId: number | null
  
  // Paso 2
  mainEconomicConceptId: number | null
  secondaryEconomicConceptId: number | null
  isReservationPersonAlsoResponsible: boolean | null
  isResponsibleNotAssigned: boolean | null
  fullName: string
  email: string
  phone: string
  positionTypeIds: number[]
  ageRangeIds: number[]
  specialAssistanceIds: number[]
  
  // Paso 3
  discoveryChannelId: number | null
  paymentMethodId: number | null
  requiresMediationService: boolean | null
  requiresDetailedLocationInformation: boolean | null
  requestsPostVisitInvoice: boolean | null
  needsCheckoutProcessInformation: boolean | null
  confirmsInformationAccuracy: boolean | null
  totalPeople: number | null
  totalCost: number | null
  // Campos adicionales del formulario
  parkingInfo: boolean | null
  invoice: boolean | null
  providerInfo: boolean | null
  documents: Array<{
    name: string
    file: File
    url: string
    size: number
  }> | null
}

// ============================================================================
// TIPOS DE RESPUESTA DE API
// ============================================================================

export interface ReservationCompanyStep1ApiResponse extends ApiResponse<ReservationCompanyStep1Response> {}
export interface ReservationCompanyStep2ApiResponse extends ApiResponse<ReservationCompanyStep2Response> {}
export interface ReservationCompanyStep3ApiResponse extends ApiResponse<ReservationCompanyStep3Response> {}
export interface ReservationCompanyApiResponse extends ApiResponse<ReservationCompany> {}

// ============================================================================
// INTERFACES PARA FILTROS Y BÚSQUEDAS
// ============================================================================

export interface ReservationCompanyFilters {
  visitorId?: number
  companyId?: number
  status?: string
  dateFrom?: string
  dateTo?: string
  visitObjectiveId?: number
  mainEconomicConceptId?: number
  secondaryEconomicConceptId?: number
}

// ============================================================================
// INTERFACES PARA ESTADÍSTICAS Y REPORTES
// ============================================================================

export interface ReservationCompanyStats {
  totalReservations: number
  totalPeople: number
  totalCost: number
  averageGroupSize: number
  mostPopularVisitObjective: string
  mostPopularEconomicConcept: string
  reservationsByMonth: Array<{
    month: string
    count: number
    totalPeople: number
    totalCost: number
  }>
}
