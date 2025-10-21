import { ref, computed, readonly } from 'vue'
import { visitorService } from '../services/visitor'
import { useAuth } from './auth'
import type {
  Visitor,
  VisitorCompany,
  CreateVisitorRequest,
  UpdateVisitorRequest,
  CreateVisitorCompanyRequest,
  DeleteVisitorCompanyRequest,
  VisitorFilters,
  VisitorInstitution,
  VisitorInstitutionFilters,
  DeleteVisitorInstitutionRequest,
  CreateVisitorInstitutionRequest
} from '../types/visitor'
import { useToast } from '@/composables/ui/useToast'


export function useApiVisitor() {

  const { showSuccess } = useToast()
  // ============================================================================
  // ESTADOS REACTIVOS
  // ============================================================================

  const visitors = ref<Visitor[]>([])
  const visitorCompanies = ref<VisitorCompany[]>([])
  const visitorInstitutions = ref<VisitorInstitution[]>([])
  const deleteVisitorInstitutionCount = ref(0)
  const currentVisitor = ref<Visitor | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  // Contadores para operaciones
  const createVisitorCompanyCount = ref(0)
  const deleteVisitorCompanyCount = ref(0)
  const totalVisitorCompanyOperations = ref(0)

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const hasVisitors = computed(() => visitors.value.length > 0)
  const activeVisitors = computed(() => visitors.value.filter(v => v.isActive !== false))
  const inactiveVisitors = computed(() => visitors.value.filter(v => v.isActive === false))

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  const { user } = useAuth()

  const getUserModifiedId = (): number => {
    if (!user.value?.userId) {
      throw new Error('Usuario no autenticado')
    }
    return parseInt(user.value.userId)
  }

  const handleError = (err: any) => {
    console.error('Error en servicio de visitor:', err)
    error.value = err instanceof Error ? err : new Error(String(err))
    throw err
  }

  const clearError = () => {
    error.value = null
  }

  // ============================================================================
  // OPERACIONES CRUD PARA VISITORS
  // ============================================================================

  const getAllVisitors = async (filters?: VisitorFilters) => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.getAllVisitors(filters)
      visitors.value = response.data || []
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getVisitorById = async (id: number) => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.getVisitorById(id)
      if (response.success && response.data) {
        currentVisitor.value = response.data
      }
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createVisitor = async (data: Omit<CreateVisitorRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      const requestData: CreateVisitorRequest = {
        ...data,
        userModifiedId: getUserModifiedId()
      }
      const response = await visitorService.createVisitor(requestData)
      
      // Agregar el nuevo visitante a la lista
      if (response.data) {
        visitors.value.push(response.data)
      }
      
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateVisitor = async (data: Omit<UpdateVisitorRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      const requestData: UpdateVisitorRequest = {
        ...data,
        userModifiedId: getUserModifiedId()
      }
      const response = await visitorService.updateVisitor(requestData)
      
      // Actualizar el visitante en la lista
      if (response.data) {
        const index = visitors.value.findIndex(v => v.id === response.data.id)
        if (index !== -1) {
          visitors.value[index] = response.data
        }
        
        // Actualizar currentVisitor si es el mismo
        if (currentVisitor.value?.id === response.data.id) {
          currentVisitor.value = response.data
        }
      }
      
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteVisitor = async (id: number) => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.deleteVisitor(id)
      
      // Remover el visitante de la lista
      visitors.value = visitors.value.filter(v => v.id !== id)
      
      // Limpiar currentVisitor si es el mismo
      if (currentVisitor.value?.id === id) {
        currentVisitor.value = null
      }
      
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchVisitors = async (query: string, filters?: VisitorFilters) => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.searchVisitors(query, filters)
      visitors.value = response.data || []
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getVisitorsByUserType = async (userTypeId: number) => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.getVisitorsByUserType(userTypeId)
      visitors.value = response.data || []
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getActiveVisitors = async () => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.getActiveVisitors()
      visitors.value = response.data || []
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // OPERACIONES PARA VISITOR COMPANIES
  // ============================================================================

  const createVisitorCompany = async (data: Omit<CreateVisitorCompanyRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      const requestData: CreateVisitorCompanyRequest = {
        ...data,
        userModifiedId: 1
      }
      
      console.log('🚀 Enviando datos para crear empresa:', requestData)
      
      const response = await visitorService.createVisitorCompany(requestData)
      
      console.log('✅ Respuesta de createVisitorCompany:', response)
      
      // Incrementar contador
      createVisitorCompanyCount.value++
      totalVisitorCompanyOperations.value++
      
      // La API devuelve un objeto con estructura { code, isValid, comments, response: id }
      // No podemos agregar directamente a la lista porque solo tenemos el ID
      // En su lugar, recargamos la lista completa
      console.log('🔄 Recargando lista de empresas después de crear...')
      
      // Recargar la lista de empresas para obtener los datos completos
      const { user } = useAuth()
      await getVisitorCompanies({ visitorId: user.value?.userId })
      
      console.log('📝 Lista de empresas actualizada:', visitorCompanies.value)
      showSuccess('success', 'Empresa creada correctamente')
      
      return response
    } catch (err) {
      console.error('❌ Error en createVisitorCompany:', err)
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteVisitorCompany = async (data: Omit<DeleteVisitorCompanyRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      const requestData: DeleteVisitorCompanyRequest = {
        ...data,
        userModifiedId: 1
      }
      const response = await visitorService.deleteVisitorCompany(requestData)
      
      // Incrementar contador
      deleteVisitorCompanyCount.value++
      totalVisitorCompanyOperations.value++
      
      // Remover la compañía de la lista
      visitorCompanies.value = visitorCompanies.value.filter(c => c.id !== data.id)
      
      return response
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getVisitorCompanies = async (filters?: { id?: number; visitorId?: number }) => {
    try {
      clearError()
      loading.value = true

      const response = await visitorService.getVisitorCompanies(filters)

      console.log('🔍 Respuesta de getVisitorCompanies:', response)
      
      // El servicio ya maneja la extracción de datos y devuelve un array
      visitorCompanies.value = response || []
      
      console.log('✅ Empresas cargadas en el composable:', visitorCompanies.value)

      return response
    } catch (err) {
      console.error('❌ Error en getVisitorCompanies:', err)
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener instituciones educativas del visitante
  /**
   * Obtiene las instituciones educativas del visitante
   * @param {VisitorInstitutionFilters} [filters] - Filtros opcionales
   * @param {number} [filters.id] - ID específico de la institución
   * @param {number} [filters.visitorId] - ID del visitante
   * @param {string} [filters.email] - Email del visitante
   * @param {boolean} [filters.enable] - Estado de habilitación (por defecto true)
   * @returns {Promise<VisitorInstitution[]>} Lista de instituciones del visitante
   */
  const getVisitorInstitutions = async (filters?: VisitorInstitutionFilters) => {
    try {
      clearError()
      loading.value = true
      const response = await visitorService.getVisitorInstitutions(filters)
      // La respuesta tiene la estructura: { code, isValid, comments, response: [...] }
      const rows = (response as any)?.response || (response as any)?.data?.response || (response as any)?.data || []
      visitorInstitutions.value = rows
      return rows
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createVisitorInstitution = async (payload: Omit<CreateVisitorInstitutionRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      
      // Verificar que el usuario esté autenticado antes de proceder
      const userModifiedId = getUserModifiedId()
      
      const requestData: CreateVisitorInstitutionRequest = {
        ...payload,
        userModifiedId
      }
      
      const res = await visitorService.createVisitorInstitution(requestData)
      
      // Si la creación fue exitosa, agregar a la lista local
      if (res.success && res.data) {
        visitorInstitutions.value.push(res.data)
      }
      
      return res
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteVisitorInstitution = async (payload: Omit<DeleteVisitorInstitutionRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      
      // Verificar que el usuario esté autenticado antes de proceder
      const userModifiedId = 1
      
      const requestData: DeleteVisitorInstitutionRequest = {
        ...payload,
        userModifiedId
      }
      const res = await visitorService.deleteVisitorInstitution(requestData)
      // Actualizar estado local si procede
      visitorInstitutions.value = visitorInstitutions.value.filter(i => i.id !== payload.id)
      deleteVisitorInstitutionCount.value++
      return res
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // OPERACIONES AUXILIARES
  // ============================================================================

  const isEmailRegistered = async (email: string): Promise<boolean> => {
    try {
      return await visitorService.isEmailRegistered(email)
    } catch (err) {
      console.error('Error verificando email:', err)
      return false
    }
  }

  const getVisitorStats = async () => {
    try {
      return await visitorService.getVisitorStats()
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err)
      return {
        total: 0,
        active: 0,
        inactive: 0
      }
    }
  }

  const clearVisitors = () => {
    visitors.value = []
    currentVisitor.value = null
    clearError()
  }

  const clearVisitorCompanyCounters = () => {
    createVisitorCompanyCount.value = 0
    deleteVisitorCompanyCount.value = 0
    totalVisitorCompanyOperations.value = 0
  }

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Estados reactivos
    visitors: readonly(visitors),
    visitorCompanies: readonly(visitorCompanies),
    visitorInstitutions: readonly(visitorInstitutions),
    deleteVisitorInstitutionCount: readonly(deleteVisitorInstitutionCount),
    currentVisitor: readonly(currentVisitor),
    loading: readonly(loading),
    error: readonly(error),
    
    // Contadores
    createVisitorCompanyCount: readonly(createVisitorCompanyCount),
    deleteVisitorCompanyCount: readonly(deleteVisitorCompanyCount),
    totalVisitorCompanyOperations: readonly(totalVisitorCompanyOperations),
    
    // Computed properties
    hasVisitors,
    activeVisitors,
    inactiveVisitors,
    
    // Operaciones CRUD para visitors
    getAllVisitors,
    getVisitorById,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    searchVisitors,
    getVisitorsByUserType,
    getActiveVisitors,
    
    // Operaciones para visitor companies
    createVisitorCompany,
    deleteVisitorCompany,
    getVisitorCompanies,
    getVisitorInstitutions,
    createVisitorInstitution,
    deleteVisitorInstitution,
    
    // Operaciones auxiliares
    isEmailRegistered,
    getVisitorStats,
    clearVisitors,
    clearVisitorCompanyCounters,
    clearError
  }
}
