/**
 * Representa un código postal
 */
export interface PostalCode {
  /** ID único del código postal */
  id: number
  /** Código postal */
  postalCode: string
  /** Municipio */
  municipality: string
  /** Estado */
  state?: string
  /** Ciudad */
  city?: string
  /** Colonia */
  neighborhood?: string
}

/**
 * Parámetros para obtener códigos postales
 */
export interface GetAllPostalCodesRequest {
  /** ID del código postal (opcional) */
  id?: number
  /** Código postal para filtrar (opcional) */
  postalCode?: string
  /** Municipio para filtrar (opcional) */
  municipality?: string
}
