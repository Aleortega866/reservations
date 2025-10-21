import { ref, computed } from 'vue'
import JSZip from 'jszip'

export interface DownloadItem {
  url: string
  name: string
  exhibition: string
  floor: string
  type: string
  status: 'pending' | 'downloading' | 'completed' | 'error'
}

export const useVisitMenuDownload = () => {
  const isDownloading = ref(false)
  const downloadQueue = ref<DownloadItem[]>([])
  const currentDownload = ref<{ name: string; materialId: string | null } | null>(null)

  // Computed properties para el gestor de descargas
  const totalFiles = computed(() => downloadQueue.value.length)
  const completedCount = computed(() => 
    downloadQueue.value.filter(file => file.status === 'completed').length
  )
  const pendingCount = computed(() => 
    downloadQueue.value.filter(file => file.status === 'pending').length
  )
  const errorCount = computed(() => 
    downloadQueue.value.filter(file => file.status === 'error').length
  )

  // Función para recopilar enlaces de descarga del menú
  const collectDownloadLinks = (menuData: any[]): DownloadItem[] => {
    const downloadLinks: DownloadItem[] = []
    
    menuData.forEach((floor) => {
      floor.exhibitions.forEach((exhibition: any) => {
        if (exhibition.thumbnails && exhibition.thumbnails.length > 0) {
          exhibition.thumbnails.forEach((thumbnail: any) => {
            if (thumbnail.enlace) {
              downloadLinks.push({
                url: thumbnail.enlace,
                name: `${exhibition.name} - ${thumbnail.name}`,
                exhibition: exhibition.name,
                floor: floor.name,
                type: thumbnail.type,
                status: 'pending'
              })
            }
          })
        }
      })
    })
    
    return downloadLinks
  }

  // Función para manejar la descarga del menú de visita
  const handleDownload = async (menuData: any[]) => {
    console.log("=== INICIANDO DESCARGA DEL MENÚ DE VISITA ===")
    
    if (!menuData || menuData.length === 0) {
      console.warn("❌ No hay datos del menú de visita para descargar")
      return
    }

    // Recopilar todos los enlaces de descarga disponibles
    const downloadLinks = collectDownloadLinks(menuData)
    
    console.log(`📊 Total de enlaces encontrados: ${downloadLinks.length}`)

    if (downloadLinks.length === 0) {
      console.warn("❌ No se encontraron enlaces de descarga en el menú de visita")
      alert("No se encontraron enlaces de descarga en el menú de visita. Verifica que las exhibiciones tengan recursos disponibles.")
      return
    }

    // Iniciar descarga con progreso
    await startDownloadWithProgress(downloadLinks)
  }

  // Función para iniciar descarga con progreso
  const startDownloadWithProgress = async (downloadLinks: DownloadItem[]) => {
    console.log("🚀 Iniciando proceso de descarga...")
    isDownloading.value = true
    downloadQueue.value = [...downloadLinks]
    
    try {
      // Verificar que JSZip esté disponible
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip no está disponible. Verifica que esté importado correctamente.')
      }
      
      console.log("📦 Creando instancia de JSZip...")
      // Crear instancia de JSZip
      const zip = new JSZip()
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const folderName = `MIDE_Menu_Visita_${timestamp}`
      console.log(`📁 Nombre del archivo ZIP: ${folderName}.zip`)
      
      // Descargar cada archivo y agregarlo al ZIP
      console.log(`📥 Iniciando descarga de ${downloadLinks.length} archivos...`)
      for (let i = 0; i < downloadLinks.length; i++) {
        if (!isDownloading.value) {
          console.log("❌ Descarga cancelada por el usuario")
          break // Verificar si se canceló
        }
        
        const link = downloadLinks[i]
        console.log(`📄 Procesando archivo ${i + 1}/${downloadLinks.length}: ${link.name}`)
        console.log(`🔗 URL: ${link.url}`)
        
        try {
          // Actualizar estado a "descargando"
          downloadQueue.value[i].status = 'downloading'
          currentDownload.value = { name: link.name, materialId: null }
          console.log(`⏳ Descargando: ${link.name}`)
          
          // Descargar el archivo (manejar Google Drive y otros tipos)
          let blob
          try {
            if (link.url.includes('drive.google.com')) {
              // Manejar enlaces de Google Drive
              blob = await downloadGoogleDriveFile(link.url, link.name)
            } else {
              // Manejar enlaces normales
              const response = await fetch(link.url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }
              
              blob = await response.blob()
            }
          } catch (downloadError) {
            console.error(`Error descargando recurso ${link.name}:`, downloadError)
            downloadQueue.value[i].status = 'error'
            continue
          }
          
          // Agregar archivo al ZIP con nombre organizado
          const fileName = `${String(i + 1).padStart(2, '0')}_${link.name.replace(/[^a-zA-Z0-9]/g, '_')}.${getFileExtension(link.url)}`
          console.log(`📁 Agregando al ZIP: ${fileName}`)
          console.log(`📊 Tamaño del archivo: ${blob.size} bytes`)
          zip.file(fileName, blob)
          
          // Marcar como completado
          downloadQueue.value[i].status = 'completed'
          console.log(`✅ Archivo completado: ${link.name}`)
          
          // Espaciar las descargas por 500ms
          if (i < downloadLinks.length - 1) {
            console.log("⏱️ Esperando 500ms antes del siguiente archivo...")
            await new Promise(resolve => setTimeout(resolve, 500))
          }
          
        } catch (error) {
          console.error(`Error descargando recurso ${link.name}:`, error)
          downloadQueue.value[i].status = 'error'
        }
      }
      
      // Generar y descargar el ZIP
      if (isDownloading.value) {
        console.log("🎯 Generando archivo ZIP final...")
        currentDownload.value = { name: 'Generando archivo ZIP...', materialId: null }
        
        console.log("📦 Generando blob del ZIP...")
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        console.log(`📊 Tamaño del ZIP: ${zipBlob.size} bytes`)
        
        console.log("🔗 Creando URL de descarga...")
        const url = window.URL.createObjectURL(zipBlob)
        console.log(`🔗 URL creada: ${url}`)
        
        console.log("📥 Iniciando descarga del ZIP...")
        const link = document.createElement('a')
        link.href = url
        link.download = `${folderName}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        console.log("✅ Descarga del ZIP completada")
      } else {
        console.log("❌ Descarga cancelada, no se genera ZIP")
      }
      
    } catch (error) {
      console.error('❌ Error generando ZIP:', error)
      alert(`Error generando el archivo ZIP: ${error.message}`)
    }
    
    // Finalizar descarga
    console.log("🏁 Finalizando proceso de descarga...")
    isDownloading.value = false
    currentDownload.value = null
    console.log("✅ Proceso de descarga finalizado")
  }

  // Función auxiliar para obtener la extensión del archivo
  const getFileExtension = (url: string): string => {
    try {
      const pathname = new URL(url).pathname
      const extension = pathname.split('.').pop()
      return extension || 'pdf'
    } catch {
      return 'pdf'
    }
  }

  // Función para convertir enlaces de Google Drive a formato de descarga directa
  const convertGoogleDriveUrl = (url: string): string => {
    try {
      // Verificar si es un enlace de Google Drive
      if (url.includes('drive.google.com/file/d/')) {
        // Extraer el ID del archivo
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        if (match && match[1]) {
          const fileId = match[1]
          // Convertir a formato de descarga directa
          return `https://drive.google.com/uc?export=download&id=${fileId}`
        }
      }
      return url // Retornar URL original si no es de Google Drive
    } catch (error) {
      console.error('Error convirtiendo URL de Google Drive:', error)
      return url
    }
  }

  // Función para manejar descarga de archivos de Google Drive
  const downloadGoogleDriveFile = async (url: string, filename: string): Promise<Blob> => {
    try {
      // Primero intentar con la URL convertida
      const downloadUrl = convertGoogleDriveUrl(url)
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Verificar si la respuesta es un HTML (página de confirmación de Google Drive)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        // Si es HTML, significa que necesitamos manejar la confirmación de descarga
        const html = await response.text()
        
        // Buscar el enlace de descarga real en el HTML
        const downloadMatch = html.match(/href="([^"]*uc[^"]*export=download[^"]*)"/)
        if (downloadMatch && downloadMatch[1]) {
          const realDownloadUrl = downloadMatch[1].replace(/&amp;/g, '&')
          const realResponse = await fetch(realDownloadUrl)
          
          if (realResponse.ok) {
            return await realResponse.blob()
          }
        }
        
        throw new Error('No se pudo obtener el enlace de descarga directa')
      }
      
      return await response.blob()
      
    } catch (error) {
      console.error(`Error descargando archivo de Google Drive ${filename}:`, error)
      throw error
    }
  }

  return {
    // Estado
    isDownloading: readonly(isDownloading),
    downloadQueue: readonly(downloadQueue),
    currentDownload: readonly(currentDownload),
    
    // Computed
    totalFiles,
    completedCount,
    pendingCount,
    errorCount,
    
    // Acciones
    handleDownload
  }
}
