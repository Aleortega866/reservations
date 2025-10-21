import { ref, computed, readonly } from 'vue'
import { useApiFetch, API_ENDPOINTS } from '@/lib/api/core/useFetch'
import type { 
  VisitMenuExhibition, 
  VisitMenuApiResponse, 
  VisitMenuFloor
} from '@/types/visit-menu'

export const useVisitMenu = () => {
  const menuData = ref<VisitMenuExhibition[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Función para obtener datos del menú de visita de la API
  const fetchVisitMenu = async (reservationId?: number) => {
    if (!reservationId) {
      error.value = 'ID de reservación es requerido'
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const endpoint = API_ENDPOINTS.reservation.getVisitMenu(reservationId)
      const { execute } = useApiFetch<VisitMenuApiResponse>(endpoint)
      const response = await execute()
      
      // Verificar si la respuesta es válida
      if (!response.isValid || response.code === 500) {
        error.value = response.comments || 'Error al cargar el menú de visita'
        menuData.value = []
        return
      }
      
      // Verificar si hay datos válidos
      if (!response.response || response.response.length === 0) {
        error.value = 'No hay menú de visita disponible para esta reservación'
        menuData.value = []
        return
      }
      
      menuData.value = response.response
    } catch (err) {
      console.error('Error al cargar menú de visita:', err)
      error.value = err instanceof Error ? err.message : 'Error desconocido al cargar menú de visita'
      menuData.value = []
    } finally {
      loading.value = false
    }
  }


  // Función simplificada para agrupar datos por piso
  const getMenuDataGroupedByFloor = computed((): VisitMenuFloor[] => {
    const floorsMap = new Map<string, any>()
    
    menuData.value.forEach((item) => {
      const pisoKey = item.piso
      const exhibicionKey = item.exhibicion.trim()
      
      // Crear piso si no existe
      if (!floorsMap.has(pisoKey)) {
        floorsMap.set(pisoKey, {
          id: pisoKey.toLowerCase().replace(/\s+/g, '-'),
          name: pisoKey,
          exhibitions: new Map()
        })
      }
      
      const floor = floorsMap.get(pisoKey)!
      
      // Crear exhibición si no existe
      if (!floor.exhibitions.has(exhibicionKey)) {
        floor.exhibitions.set(exhibicionKey, {
          id: `${pisoKey.toLowerCase().replace(/\s+/g, '-')}-${exhibicionKey.toLowerCase().replace(/\s+/g, '-')}`,
          name: exhibicionKey,
          ubicacion: item.ubicacion,
          enlace: item.enlace,
          conceptos: [],
          contenidos: [],
          procesos: []
        })
      }
      
      const exhibition = floor.exhibitions.get(exhibicionKey)!
      
      // Consolidar contenido único
      if (item.conceptoEconomicoExhibicion && !exhibition.conceptos.includes(item.conceptoEconomicoExhibicion)) {
        exhibition.conceptos.push(item.conceptoEconomicoExhibicion)
      }
      
      if (item.contenidos && !exhibition.contenidos.includes(item.contenidos)) {
        exhibition.contenidos.push(item.contenidos)
      }
      
      if (item.procesoAprendizaje && !exhibition.procesos.includes(item.procesoAprendizaje)) {
        exhibition.procesos.push(item.procesoAprendizaje)
      }
      
      // Mantener el primer enlace encontrado
      if (!exhibition.enlace && item.enlace) {
        exhibition.enlace = item.enlace
      }
    })
    
    // Convertir a formato final
    const result: VisitMenuFloor[] = []
    
    floorsMap.forEach((floor) => {
      const floorData: VisitMenuFloor = {
        id: floor.id,
        name: floor.name,
        expanded: false,
        exhibitions: []
      }
      
      // Procesar exhibiciones del piso
      floor.exhibitions.forEach((exhibition: any) => {
        // Generar thumbnails dinámicos
        const thumbnails: any[] = []
        const contentTypes = [
          { key: 'conceptos', type: 'concepto', name: 'Concepto Económico', icon: 'lucide:lightbulb' },
          { key: 'contenidos', type: 'contenidos', name: 'Contenidos', icon: 'lucide:book-open' },
          { key: 'procesos', type: 'proceso', name: 'Proceso de Aprendizaje', icon: 'lucide:graduation-cap' }
        ]
        
        contentTypes.forEach(contentType => {
          if (exhibition[contentType.key] && exhibition[contentType.key].length > 0) {
            thumbnails.push({
              id: `thumbnail-${exhibition.id}-${contentType.type}`,
              type: contentType.type,
              name: contentType.name,
              content: exhibition[contentType.key].join(' | '),
              enlace: exhibition.enlace,
              icon: contentType.icon
            })
          }
        })
        
        floorData.exhibitions.push({
          id: exhibition.id,
          name: exhibition.name,
          expanded: false,
          conceptoEconomicoExhibicion: exhibition.conceptos.join(' | '),
          ubicacion: exhibition.ubicacion,
          contenidos: exhibition.contenidos.join(' | '),
          procesoAprendizaje: exhibition.procesos.join(' | '),
          enlace: exhibition.enlace,
          thumbnails: thumbnails
        })
      })
      
      result.push(floorData)
    })
    
    return result
  })


  return {
    menuData: readonly(menuData),
    loading: readonly(loading),
    error: readonly(error),
    fetchVisitMenu,
    getMenuDataGroupedByFloor
  }
}
