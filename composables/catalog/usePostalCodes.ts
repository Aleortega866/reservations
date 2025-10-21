import { ref, computed, readonly } from 'vue'
import { postalCodeService } from '@/lib/api'
import type { PostalCode, GetAllPostalCodesRequest } from '@/lib/api/types/postal-code'

export function usePostalCodes() {
  const postalCodes = ref<PostalCode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Carga todos los códigos postales
   * @param params - Parámetros de consulta opcionales
   */
  const fetchPostalCodes = async (params?: GetAllPostalCodesRequest) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔄 Cargando códigos postales...', params)
      const data = await postalCodeService.getAllPostalCodes(params)
      postalCodes.value = data
      
      console.log('✅ Códigos postales cargados:', data.length, 'registros')
    } catch (err) {
      console.error('❌ Error cargando códigos postales:', err)
      error.value = err instanceof Error ? err.message : 'Error desconocido al cargar códigos postales'
      postalCodes.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca códigos postales por código postal
   * @param postalCode - Código postal a buscar
   */
  const searchByPostalCode = async (postalCode: string) => {
    if (!postalCode || postalCode.length < 3) {
      postalCodes.value = []
      return
    }
    
    await fetchPostalCodes({ postalCode })
  }

  /**
   * Busca códigos postales por municipio
   * @param municipality - Municipio a buscar
   */
  const searchByMunicipality = async (municipality: string) => {
    if (!municipality || municipality.length < 3) {
      postalCodes.value = []
      return
    }
    
    await fetchPostalCodes({ municipality })
  }

  /**
   * Obtiene opciones formateadas para usar en componentes de selección
   */
  const postalCodeOptions = computed(() => {
    return postalCodes.value.map(postalCode => ({
      value: postalCode.postalCode.toString(), // Usar el ID como valor
      label: `${postalCode.postalCode} - ${postalCode.neighborhood} - ${postalCode.municipality}`
    }))
  })



  /**
   * Obtiene un código postal específico por su código
   * @param postalCode - Código postal a buscar
   */
  const getPostalCodeByCode = (postalCode: string) => {
    return postalCodes.value.find((pc: PostalCode) => pc.postalCode === postalCode)
  }

  return {
    // Estado
    postalCodes: readonly(postalCodes),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    postalCodeOptions,
    
    // Métodos
    fetchPostalCodes,
    searchByPostalCode,
    searchByMunicipality,
    getPostalCodeByCode
  }
}
