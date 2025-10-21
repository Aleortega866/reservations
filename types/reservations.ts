export interface Document {
  id: string
  name: string
  checked: boolean
  file?: File // Archivo opcional para documentos subidos
}

export interface Reservation {
  id: string
  title: string
  description: string
  type: 'general' | 'escolar' | 'empresarial' | 'curso-verano'
  documents: Document[]
}

export interface ReservationDetails {
  id: string
  date: string
  time: string
  location: string
  participants: number
  status: 'pending' | 'confirmed' | 'cancelled'
} 