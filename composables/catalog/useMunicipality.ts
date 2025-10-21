import { ref, computed, readonly } from 'vue'
import { municipalityService } from '@/lib/api'
import type { Municipality, GetAllMunicipalitiesRequest } from '@/lib/api/types/municipality'

export function useMunicipality() {
  const municipalities = ref<Municipality[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Carga todos los municipios
   * @param params - Parámetros de consulta opcionales
   */
  const fetchMunicipalities = async (params?: GetAllMunicipalitiesRequest) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔄 Cargando municipios...', params)
      const data = await municipalityService.getAllMunicipalities(params)
      municipalities.value = data
      
      console.log('✅ Municipios cargados:', data.length, 'registros')
    } catch (err) {
      console.error('❌ Error cargando municipios:', err)
      error.value = err instanceof Error ? err.message : 'Error desconocido al cargar municipios'
      municipalities.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca municipios por nombre
   * @param municipality - Nombre del municipio a buscar
   */
  const searchByMunicipality = async (municipality: string) => {
    if (!municipality || municipality.length < 3) {
      municipalities.value = []
      return
    }
    
    await fetchMunicipalities({ municipality })
  }

  /**
   * Busca un municipio específico por ID
   * @param id - ID del municipio a buscar
   */
  const searchById = async (id: number) => {
    await fetchMunicipalities({ id })
  }

  /**
   * Obtiene opciones formateadas para usar en componentes de selección
   */
  const municipalityOptions = computed(() => {
    return municipalities.value.map(municipality => ({
      value: municipality.id.toString(),
      label: municipality.municipality,
      id: municipality.id
    }))
  })

  /**
   * Obtiene un municipio específico por su ID
   * @param id - ID del municipio a buscar
   */
  const getMunicipalityById = (id: number) => {
    return municipalities.value.find((municipality: Municipality) => municipality.id === id)
  }

  /**
   * Obtiene un municipio específico por su nombre
   * @param municipalityName - Nombre del municipio a buscar
   */
  const getMunicipalityByName = (municipalityName: string) => {
    return municipalities.value.find((municipality: Municipality) => 
      municipality.Municipality.toLowerCase() === municipalityName.toLowerCase()
    )
  }

  return {
    // Estado
    municipalities: readonly(municipalities),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    municipalityOptions,
    
    // Métodos
    fetchMunicipalities,
    searchByMunicipality,
    searchById,
    getMunicipalityById,
    getMunicipalityByName
  }
}
