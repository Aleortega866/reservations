// ============================================================================
// TIPOS E INTERFACES PARA RESERVACIONES DE CURSOS DE VERANO
// ============================================================================

import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES PARA PASO 1 - INFORMACIÓN BÁSICA
// Mapea exactamente al comando ReservationSummerCourseStep1CreateCmd del backend
// ============================================================================

export interface CreateReservationSummerCourseStep1Request {
  visitorId: number
  visitObjectiveId: number
  totalKids: number
  totalKidsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalTeenagers: number
  totalTeenagersWithDisabilities: number
  reservationDate: string // ISO 8601 date-time format
  checkInDateId: number
  userModifiedId: number
  institutionNameId: number
}

export interface ReservationSummerCourseStep1Response {
  reservationId: number
  visitorId: number
  visitObjectiveId: number
  totalKids: number
  totalKidsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalTeenagers: number
  totalTeenagersWithDisabilities: number
  reservationDate: string
  checkInDateId: number
  userModifiedId: number
  institutionNameId: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA PASO 2 - DETALLES DE LA RESERVACIÓN
// ============================================================================

export interface CreateReservationSummerCourseStep2Request {
  reservationId: number
  isReservationPersonAlsoResponsible: boolean
  isResponsibleNotAssigned: boolean
  fullName: string | null
  email: string | null
  phone: string | null
  specialAssistances: number[]
  userModifiedId: number
  secondaryEconomicConceptId: number
  mainEconomicConceptId: number
}

export interface UpdateReservationSummerCourseStep1Request {
  reservationId: number
  visitorId: number
  visitObjectiveId: number
  totalKids: number
  totalKidsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalTeenagers: number
  totalTeenagersWithDisabilities: number
  reservationDate: string // ISO 8601 date-time format
  checkInDateId: number
  userModifiedId: number
  institutionNameId: number
}

export interface UpdateReservationSummerCourseStep2Request {
  reservationId: number
  isReservationPersonAlsoResponsible: boolean
  isResponsibleNotAssigned: boolean
  fullName: string | null
  email: string | null
  phone: string | null
  specialAssistances: number[]
  userModifiedId: number
  secondaryEconomicConceptId: number
  mainEconomicConceptId: number
}

export interface ReservationSummerCourseStep2Response {
  reservationId: number
  isReservationPersonAlsoResponsible: boolean
  isResponsibleNotAssigned: boolean
  fullName: string | null
  email: string | null
  phone: string | null
  specialAssistances: number[]
  userModifiedId: number
  secondaryEconomicConceptId: number
  mainEconomicConceptId: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA PASO 3 - INFORMACIÓN DE PAGO
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

export interface UpdateReservationSummerCourseStep3Request {
  reservationId: number
  discoveryChannelId: number | null
  paymentMethodId: number | null
  acknowledgedCivilProtectionDocs: boolean | null
  requiresStreetCrossingAssistance: boolean | null
  confirmsInformationAccuracy: boolean | null
  workShopsIds: number[]
  userModifiedId: number
}

export interface ReservationSummerCourseStep3Response {
  reservationId: number
  discoveryChannelId: number | null
  paymentMethodId: number | null
  acknowledgedCivilProtectionDocs: boolean | null
  requiresStreetCrossingAssistance: boolean | null
  confirmsInformationAccuracy: boolean | null
  workShopsIds: number[]
  costBreakdown: CostBreakdown
  userModifiedId: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES COMPLETAS DE RESERVACIÓN DE CURSO DE VERANO
// ============================================================================

export interface ReservationSummerCourse {
  id: number | string
  visitorId: number
  visitObjectiveId: number
  totalKids: number
  totalKidsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalTeenagers: number
  totalTeenagersWithDisabilities: number
  reservationDate: string
  checkInDateId: number
  institutionNameId: number

  // Paso 2 - Detalles de la reservación
  isReservationPersonAlsoResponsible: boolean | null
  isResponsibleNotAssigned: boolean | null
  fullName: string | null
  email: string | null
  phone: string | null
  specialAssistances: number[] | null
  mainEconomicConceptId: number | null
  secondaryEconomicConceptId: number | null
  userModifiedId: number | null

  // Paso 3 - Información de pago
  discoveryChannelId: number | null
  paymentMethodId: number | null
  acknowledgedCivilProtectionDocs: boolean | null
  requiresStreetCrossingAssistance: boolean | null
  confirmsInformationAccuracy: boolean | null
  workShopsIds: number[] | null
  totalPeople: number | null
  totalCost: number | null

  // Metadatos
  status: 'draft' | 'step1' | 'step2' | 'step3' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA FORMULARIOS DE UI
// ============================================================================

export interface ReservationSummerCourseFormData {
  // Paso 1 (mapea al comando ReservationSummerCourseStep1CreateCmd)
  visitorId: number | null
  visitObjectiveId: number | null
  totalKids: number
  totalKidsWithDisabilities: number
  totalAdults: number
  totalAdultsWithDisabilities: number
  totalSeniors: number
  totalSeniorsWithDisabilities: number
  totalYoungAdults: number
  totalYoungAdultsWithDisabilities: number
  totalTeenagers: number
  totalTeenagersWithDisabilities: number
  reservationDate: string
  checkInDateId: number | null
  institutionNameId: number | null
  userModifiedId: number | null

  // Paso 2
  isReservationPersonAlsoResponsible: boolean | null
  isResponsibleNotAssigned: boolean | null
  fullName: string
  email: string
  phone: string
  specialAssistances: number[]
  mainEconomicConceptId: number | null
  secondaryEconomicConceptId: number | null

  // Paso 3
  discoveryChannelId: number | null
  paymentMethodId: number | null
  requiresDetailedLocationInformation: boolean | null
  requestsPostVisitInvoice: boolean | null
  confirmsInformationAccuracy: boolean | null
  workShopsIds: number[]
  totalPeople: number | null
  totalCost: number | null
}

// ============================================================================
// TIPOS DE RESPUESTA DE API
// ============================================================================

export interface ReservationSummerCourseStep1ApiResponse extends ApiResponse<ReservationSummerCourseStep1Response> {}
export interface ReservationSummerCourseStep2ApiResponse extends ApiResponse<ReservationSummerCourseStep2Response> {}
export interface ReservationSummerCourseStep3ApiResponse extends ApiResponse<ReservationSummerCourseStep3Response> {}
export interface ReservationSummerCourseApiResponse extends ApiResponse<ReservationSummerCourse> {}

// ============================================================================
// INTERFACES PARA CONSULTAS
// ============================================================================

export interface ReservationSummerCourseFilters {
  id?: number
  visitorId?: number
  institutionNameId?: number
  folio?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  attendeeTypeId?: number
  visitObjectiveId?: number
}

export interface ReservationSummerCourseGetAllDto {
  id: number
  visitorId: number
  institutionNameId: number
  attendeeTypeId: number
  totalPeople: number
  reservationDate: string
  status: string
  folio?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTERFACES PARA ESTADÍSTICAS Y REPORTES
// ============================================================================

export interface ReservationSummerCourseStats {
  totalReservations: number
  totalPeople: number
  totalKids: number
  totalAdults: number
  averageGroupSize: number
  mostPopularAttendeeType: string
  mostPopularVisitObjective: string
  reservationsByMonth: Array<{
    month: string
    count: number
    totalPeople: number
    totalKids: number
    totalAdults: number
  }>
}
