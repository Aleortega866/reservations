import { ref, computed } from 'vue'
import { catalogService } from '@/lib/api/services'
import type { Catalog, GetAllCatalogsPublicRequest } from '@/lib/api/types'

export const useCatalog = () => {
  const catalogs = ref<Catalog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obtiene todos los catálogos públicos
   * @param params - Parámetros de consulta opcionales
   */
  const fetchCatalogs = async (params?: GetAllCatalogsPublicRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await catalogService.getAllCatalogs(params)
      catalogs.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener catálogos'
      console.error('Error en useCatalog:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtra catálogos por nombre de tabla
   * @param tableName - Nombre de la tabla a filtrar
   */
  const getCatalogsByTable = (tableName: string) => {
    return computed(() => 
      catalogs.value.filter(catalog => catalog.tableName === tableName)
    )
  }

  /**
   * Obtiene un catálogo específico por ID
   * @param id - ID del catálogo
   */
  const getCatalogById = (id: number) => {
    return computed(() => 
      catalogs.value.find(catalog => catalog.id === id)
    )
  }

  /**
   * Obtiene catálogos activos
   */
  const activeCatalogs = computed(() => 
    catalogs.value.filter(catalog => catalog.enable)
  )

  /**
   * Obtiene catálogos públicos específicamente (función dedicada)
   * @param params - Parámetros de consulta opcionales
   */
  const fetchPublicCatalogs = async (params?: GetAllCatalogsPublicRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await catalogService.getAllCatalogsPublic(params)
      catalogs.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener catálogos públicos'
      console.error('Error en fetchPublicCatalogs:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Función genérica para obtener cualquier catálogo formateado para formularios
   * @param tableName - Nombre de la tabla del catálogo
   * @returns Array de opciones con value y label formateados
   */
  const getCatalogFormatted = async (tableName: string) => {
    try {
      // Cargar catálogos si no están cargados o si no tenemos los del catálogo específico
      if (catalogs.value.length === 0 || !catalogs.value.some(cat => cat.tableName === tableName)) {
        await fetchCatalogs({ tableName })
      }
      
      // Filtrar y transformar los datos del catálogo
      const catalogsFromTable = catalogs.value
        .filter((catalog: any) => catalog.tableName === tableName && catalog.enable)
        .map((catalog: any) => ({
          value: catalog.value.toLowerCase().replace(/\s+/g, '_'),
          label: catalog.value
        }))
      
      // Si no hay datos del catálogo, mostrar opciones no disponibles
      if (catalogsFromTable.length === 0) {
        return [
          { value: "no_disponible", label: "Opciones no disponibles" }
        ]
      }
      
      return catalogsFromTable
      
    } catch (error) {
      console.error(`❌ Error al cargar catálogo ${tableName}:`, error)
      // En caso de error, mostrar opciones no disponibles
      return [
        { value: "no_disponible", label: "Opciones no disponibles" }
      ]
    }
  }



  return {
    // Estado
    catalogs: computed(() => catalogs.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Métodos
    fetchCatalogs,
    fetchPublicCatalogs,
    getCatalogsByTable,
    getCatalogById,
    activeCatalogs,
    getCatalogFormatted
  }
} 