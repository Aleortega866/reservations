// ============================================================================
// CONFIGURACIÓN DE TIPOS DE DOCUMENTOS ACEPTADOS
// ============================================================================

/**
 * Tipos de archivo permitidos para documentos de reservación
 * Esta configuración se usa tanto en el frontend como en el backend
 */
export const ALLOWED_DOCUMENT_TYPES = {
  // Extensiones de archivo (para el input HTML y validación frontend)
  extensions: [
    '.pdf',
    // '.doc',
    // '.docx',
    // '.jpg',
    // '.jpeg',
    // '.png',
    // '.gif',
    // '.bmp',
    // '.tiff',
    // '.tif'
  ],
  
  // MIME types (para validación backend)
  mimeTypes: [
    'application/pdf',           // PDF
    // 'application/msword',        // DOC
    // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    // 'image/jpeg',               // JPG, JPEG
    // 'image/jpg',                // JPG
    // 'image/png',                // PNG
    // 'image/gif',                // GIF
    // 'image/bmp',                // BMP
    // 'image/tiff',               // TIFF
    // 'image/tif'                 // TIF
  ]
} as const;

/**
 * Función para validar si una extensión es permitida
 * @param fileName - Nombre del archivo
 * @returns true si la extensión es permitida
 */
export const isValidFileExtension = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_DOCUMENT_TYPES.extensions.includes(extension as any);
};

/**
 * Función para validar si un MIME type es permitido
 * @param mimeType - MIME type del archivo
 * @returns true si el MIME type es permitido
 */
export const isValidMimeType = (mimeType: string): boolean => {
  return ALLOWED_DOCUMENT_TYPES.mimeTypes.includes(mimeType as any);
};

/**
 * Función para obtener la lista de extensiones como string para el input HTML
 * @returns string con las extensiones separadas por comas
 */
export const getAcceptedFileTypes = (): string => {
  return ALLOWED_DOCUMENT_TYPES.extensions.join(',');
};

/**
 * Función para obtener la lista de tipos permitidos para mostrar al usuario
 * @returns string con los tipos permitidos en mayúsculas
 */
export const getFormattedAllowedTypes = (): string => {
  return ALLOWED_DOCUMENT_TYPES.extensions.join(', ').toUpperCase();
};
