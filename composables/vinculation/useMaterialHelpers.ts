import { computed } from 'vue'

export const useMaterialHelpers = () => {
  // Función para obtener el icono según la extensión
  const getThumbnailIcon = (material: any) => {
    const extension = (material.documentFormat || material.fileExtension || 'pdf').toLowerCase()
    const iconMap: Record<string, string> = {
      pdf: 'lucide:file-text',
      doc: 'lucide:file-text',
      docx: 'lucide:file-text',
      xls: 'lucide:file-spreadsheet',
      xlsx: 'lucide:file-spreadsheet',
      ppt: 'lucide:file-sliders',
      pptx: 'lucide:file-sliders',
      jpg: 'lucide:image',
      jpeg: 'lucide:image',
      png: 'lucide:image',
      gif: 'lucide:image',
      mp4: 'lucide:video',
      avi: 'lucide:video',
      mov: 'lucide:video',
      zip: 'lucide:archive',
      rar: 'lucide:archive',
    }
    return iconMap[extension] || 'lucide:file'
  }

  // Función para contar tipos de material
  const getMaterialTypesCount = (material: any) => {
    // Lógica simplificada - retorna 1 por defecto
    return 1
  }

  // Función para obtener información del material de forma unificada
  const getMaterialInfo = (material: any) => {
    return {
      name: material.materialName || material.fileName || 'Material sin nombre',
      description: material.shortDescription || material.description || 'Sin descripción',
      format: material.documentFormat || material.fileExtension || 'pdf',
      size: material.documentSize ? `${(material.documentSize / (1024 * 1024)).toFixed(2)} MB` : 'No especificado',
      duration: material.durationMinutes ? `${material.durationMinutes} min` : '30 min',
      moment: material.consultationTime?.toLowerCase() || 'antes de la visita',
      directedTo: material.directedTo || 'Usuario',
      link: material.documentLink || material.url,
      thumbnailIcon: getThumbnailIcon(material),
      typesCount: getMaterialTypesCount(material)
    }
  }

  // Función para obtener conceptos del material
  const getMaterialConcepts = (material: any) => {
    return material.linkedByData || 
           material.conceptName || 
           'Tema de interés, campo formativo, eje articulador o concepto económico'
  }

  // Función para obtener thumbnails
  const getMaterialThumbnails = (material: any) => {
    return [1] // Simplificado - siempre retorna 1 miniatura
  }

  // Función para descargar material
  const downloadMaterial = async (material: any) => {
    const materialId = material.materialId || material.id
    const link = material.documentLink || material.url

    if (materialId) {
      try {
        // Aquí iría la llamada al endpoint de descarga
        console.log(`Descargando PDF para material ID: ${materialId}`)
        // Implementar descarga por endpoint
      } catch (error) {
        console.warn('Error en endpoint, usando fallback:', error)
        fallbackDownload(material)
      }
    } else if (link) {
      fallbackDownload(material)
    } else {
      console.warn('No se encontró enlace de descarga para el material:', material)
    }
  }

  // Función de respaldo para descarga directa
  const fallbackDownload = (material: any) => {
    const link = material.documentLink || material.url
    if (link) {
      const downloadLink = document.createElement('a')
      downloadLink.href = link
      downloadLink.download = material.materialName || material.fileName || 'material-mide.pdf'
      downloadLink.target = '_blank'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  // Función para ver material
  const viewMaterial = (material: any) => {
    const link = material.documentLink || material.url
    if (link) {
      window.open(link, '_blank')
    }
  }

  // Función para obtener descripción del material
  const getMaterialDescription = (material: any) => {
    const info = getMaterialInfo(material)
    return info.description
  }

  return {
    getMaterialInfo,
    getThumbnailIcon,
    getMaterialTypesCount,
    getMaterialConcepts,
    getMaterialThumbnails,
    getMaterialDescription,
    downloadMaterial,
    viewMaterial
  }
}