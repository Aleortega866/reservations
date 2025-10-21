import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE COSTOS Y PRECIOS DE TICKETS
// ============================================================================

export interface Cost {
  id: number
  cost: string | null
  amount: number
  effectiveDate: string // RFC 3339 format
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isArchived?: boolean
}

export interface CreateCostRequest {
  cost: string | null
  amount: number
  effectiveDate: string // RFC 3339 format
  userModifiedId: number
}

export interface UpdateCostRequest {
  id: number
  cost: string | null
  amount: number
  effectiveDate: string // RFC 3339 format
  userModifiedId: number
}

export interface ArchiveCostRequest {
  id: number
  cost: string | null
  amount: number
  effectiveDate: string // RFC 3339 format
  userModifiedId: number
}

export interface DeleteCostRequest {
  id: number
  userModifiedId: number
}

export interface TicketPrice {
  id: number
  visitorType: number
  price: number
  userModifiedId: number
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface UpdateTicketPriceRequest {
  id: number
  visitorType: number
  price: number
  userModifiedId: number
}

export interface CostFilters {
  isArchived?: boolean
  effectiveDateFrom?: string
  effectiveDateTo?: string
  amountMin?: number
  amountMax?: number
}

export interface TicketPriceFilters {
  visitorType?: number
  isActive?: boolean
  priceMin?: number
  priceMax?: number
}

// Tipos de respuesta
export interface CostResponse extends ApiResponse<Cost> {}
export interface CostListResponse extends ApiResponse<Cost[]> {}
export interface TicketPriceResponse extends ApiResponse<TicketPrice> {}
export interface TicketPriceListResponse extends ApiResponse<TicketPrice[]> {}