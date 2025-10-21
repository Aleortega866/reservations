import { ref, computed, readonly } from 'vue'
import { formService, type FormType } from '@/lib/api/services/form'

// Variables globales para el singleton
let formTypesInstance: ReturnType<typeof createFormTypesInstance> | null = null

function createFormTypesInstance() {
  const formTypes = ref<FormType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isLoaded = ref(false) // Nueva bandera para verificar si ya se cargaron los datos

  // Computed properties para filtrar formularios
  const activeFormTypes = computed(() => 
    formTypes.value.filter(form => form.enable)
  )

  const formTypesByType = computed(() => (type: string) => 
    formTypes.value.filter(form => form.description.toLowerCase().includes(type.toLowerCase()))
  )

  /**
   * Carga todos los tipos de formularios desde la API
   */
  const loadFormTypes = async (forceReload = false) => {
    // Si ya están cargados y no se fuerza la recarga, no hacer nada
    if (isLoaded.value && !forceReload) {
      console.log('useFormTypes: Datos ya cargados, evitando llamada duplicada')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      console.log('useFormTypes: Cargando datos desde la API...')
      const data = await formService.getAllFormTypes()
      formTypes.value = data
      isLoaded.value = true
      console.log('useFormTypes: Datos cargados exitosamente')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar los tipos de formularios'
      console.error('Error loading form types:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un tipo de formulario por ID
   */
  const getFormTypeById = (id: number) => {
    return formTypes.value.find(form => form.id === id)
  }

  /**
   * Obtiene formularios por tipo
   */
  const getFormTypesByType = (type: string) => {
    return formTypes.value.filter(form => form.description.toLowerCase().includes(type.toLowerCase()))
  }

  /**
   * Busca formularios por nombre
   */
  const searchFormTypes = (query: string) => {
    if (!query.trim()) return formTypes.value
    
    const lowerQuery = query.toLowerCase()
    return formTypes.value.filter(form => 
      form.description.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Actualiza el estado activo/inactivo de un formulario usando PATCH
   */
  const updateFormTypeEnableStatus = async (id: number) => {
    try {
      const result = await formService.updateFormTypeEnableStatusPatch(id)
      
      if (result) {
        // Actualizar el estado local del formulario
        const formIndex = formTypes.value.findIndex(form => form.id === id)
        if (formIndex !== -1) {
          formTypes.value[formIndex] = {
            ...formTypes.value[formIndex],
            enable: !formTypes.value[formIndex].enable
          }
        }
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el estado del formulario'
      console.error('Error updating form type enable status with PATCH:', err)
      return false
    }
  }

  /**
   * Fuerza la recarga de los tipos de formularios
   */
  const reloadFormTypes = async () => {
    return loadFormTypes(true)
  }

  return {
    // Estado
    formTypes: readonly(formTypes),
    loading: readonly(loading),
    error: readonly(error),
    isLoaded: readonly(isLoaded),
    
    // Computed
    activeFormTypes,
    formTypesByType,
    
    // Métodos
    loadFormTypes,
    reloadFormTypes,
    getFormTypeById,
    getFormTypesByType,
    searchFormTypes,
    updateFormTypeEnableStatus
  }
}

export function useFormTypes() {
  // Crear instancia singleton si no existe
  if (!formTypesInstance) {
    console.log('useFormTypes: Creando nueva instancia singleton')
    formTypesInstance = createFormTypesInstance()
  } else {
    console.log('useFormTypes: Reutilizando instancia singleton existente')
  }
  
  return formTypesInstance
} 