import type { ApiResponse } from '../common'

// Tipos base
export interface LinkingCode {
  id: number
  code: string
  name: string
  ticketPrice: number
  maxTickets: number | null
  startDate: string
  endDate: string
  description: string | null
  messageUser: string | null
  messageAdmin: string | null
  status: string
  enable: boolean
  userModifiedId: number
  dateModified: string
}

export interface Promotion {
  id: string
  name: string
  ticketPrice: number
  maxTickets: number
  currentTickets: number
  startDate: string
  endDate: string
  description: string
  messageUser: string
  messageAdmin: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos para requests
export interface CreateLinkingCodeRequest {
  name: string | null
  ticketPrice: number
  maxTickets: number | null
  startDate: string
  endDate: string | null
  description: string | null
  messageUser: string | null
  messageAdmin: string | null
  userModifiedId: number
}

export interface UpdateLinkingCodeRequest extends Partial<CreateLinkingCodeRequest> {
  id: string
}

export interface UpdatePromotionRequest extends Partial<CreateLinkingCodeRequest> {
  id: string
}

export interface DeleteLinkingCodeRequest {
  id: number
  userModifiedId: number
}

export interface ActivateLinkingCodeRequest {
  id: number
  enable: boolean
  userModifiedId: number
}

export interface ArchivePromotionRequest {
  id: string
}

// Tipos para responses
export interface LinkingCodeResponse extends ApiResponse<LinkingCode> {}
export interface LinkingCodesResponse extends ApiResponse<LinkingCode[]> {}
export interface PromotionResponse extends ApiResponse<Promotion> {}
export interface PromotionsResponse extends ApiResponse<Promotion[]> {}
