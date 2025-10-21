import type { ApiResponse } from '../common'

// ============================================================================
// INTERFACES DE MEDIOS (VIDEOS)
// ============================================================================

export interface Video {
  id: string
  title: string
  additionalDescription?: string
  visibleFrom: string
  visibleTo: string
  description?: string
  fileName: string
  fileSize: number
  duration: number
  category: string
  tags: string[]
  isActive: boolean
  uploadedAt: string
  sectionId: number
  showOnce?: boolean
  uploadedBy: string
}

export interface UpdateVideoRequest {
  id: string
  title: string
  description?: string
  additionalDescription?: string
  category?: string
  tags?: string[]
  isActive?: boolean
  fileName: string
  visibleFrom: string
  visibleTo: string
  sectionId?: number
  showOnce?: boolean
}

export interface UploadVideoRequest {
  file: File
  title: string
  description?: string
  additionalDescription?: string
  category: string
  tags?: string[]
  fileName: string
  visibleFrom: string
  visibleTo: string
  showOnce?: boolean
  sectionId?: number
  userModifiedId?: number
  isVisible: boolean
  enable: boolean
}

export interface ReplaceVideoFileRequest {
  id: string
  file: File
  title: string
  description?: string
  additionalDescription?: string
  category?: string
  tags?: string[]
  fileName: string
  visibleFrom: string
  visibleTo: string
  videoFile: File
  userModifiedId?: number
  sectionId?: number
}

export interface DeleteVideoRequest {
  ids: number[]
  confirm: boolean
  userModifiedId: number
}

export interface DuplicateVideoRequest {
  id: string
  newTitle?: string
}

export interface ToggleVisibilityVideoRequest {
  id: string
  isVisible: boolean
  showOnce?: boolean
}

export interface VideoFileResponse {
  success: boolean
  data?: Blob
  error?: string
  url?: string
  fileName?: string
  contentType?: string
}

export interface VideoFilters {
  id?: string
  title?: string
  category?: string
  isActive?: boolean
  uploadedBy?: string
  tags?: string[]
}

export interface VideoSection {
  id: number
  name: string
}

// Tipos de respuesta
export interface VideoResponse extends ApiResponse<Video> {}
export interface VideoListResponse extends ApiResponse<Video[]> {}
export interface VideoSectionListResponse extends ApiResponse<VideoSection[]> {}