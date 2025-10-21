import type { ApiResponse } from '../common'

// Entidades y DTOs para DocumentRequest
export interface DocumentRequestListItem {
  id: number
  title: string
  enable: boolean
}

export type DocumentFormatType = 1 | 2 | 3 | 4 // 1=Pdf, 2=Png, 3=Jpeg, 4=Gif

export interface DocumentRequest {
  id: number
  title: string
  enable: boolean
  formTypeIds: number[]
  formats: DocumentFormatType[]
}

export interface CreateDocumentRequest {
  title: string
  formTypeIds: number[]
  formats: DocumentFormatType[]
  userModifiedId: number
}

export interface UpdateDocumentRequest {
  id: number
  title: string
  formTypeIds: number[]
  formats: DocumentFormatType[]
  userModifiedId: number
}

export interface EnableDisableDocumentRequestParams {
  id: number
  userModifiedId: number
}

// Respuestas tipadas con ApiResponse
export interface GetAllDocumentRequestsResponse extends ApiResponse<DocumentRequestListItem[]> {}
export interface GetDocumentRequestResponse extends ApiResponse<DocumentRequest> {}
export interface CreateDocumentRequestResponse extends ApiResponse<number> {}
export interface UpdateDocumentRequestResponse extends ApiResponse<number> {}
export interface EnableDisableDeleteResponse extends ApiResponse<number> {}

