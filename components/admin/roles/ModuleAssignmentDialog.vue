<template>
  <Dialog v-model:open="isOpen" >
    <DialogContent class="max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="text-left">
          Asignar Módulos y Permisos al Rol
        </DialogTitle>
        <DialogDescription class="text-left">
          Selecciona los módulos y permisos que tendrá acceso el rol: <strong>{{ roleName }}</strong>
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-hidden flex flex-col">
        <Tabs v-model="activeTab" class="flex-1 flex flex-col">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="modules" class="flex items-center gap-2">
              <Package class="h-4 w-4" />
              Módulos ({{ selectedModules.length }})
            </TabsTrigger>
            <TabsTrigger 
              value="permissions" 
              class="flex items-center gap-2"
              :disabled="selectedModules.length === 0"
            >
              <Shield class="h-4 w-4" />
              Permisos ({{ totalSelectedPermissions }})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" class="flex-1 overflow-hidden flex flex-col mt-4">
            <div class="flex-1 overflow-y-auto px-1">
              <div class="space-y-4 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg text-left font-semibold flex items-center gap-2">
                    <Package class="h-4 w-4" />
                    Módulos Disponibles
                  </h3>
                  <Badge variant="secondary" class="text-xs">
                    {{ selectedModules.length }} seleccionados
                  </Badge>
                </div>

                <!-- Filtro de módulos -->
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    v-model="moduleSearchTerm"
                    placeholder="Buscar módulos..."
                    class="pl-10 max-h-10"
                  />
                </div>

                <!-- Lista de módulos -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Módulos disponibles</span>
                    <Badge variant="outline" class="text-xs">
                      {{ filteredModules.length }} módulos
                    </Badge>
                  </div>
                  <div class="max-h-60 overflow-y-auto border rounded-md min-w-0">
                    <div v-if="filteredModules.length === 0" class="p-4 text-center text-muted-foreground">
                      <Package class="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron módulos</p>
                    </div>
                    <div v-else class="divide-y">
                      <div
                        v-for="module in filteredModules"
                        :key="module.id"
                        class="p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div class="flex items-center justify-between gap-2 min-w-0">
                          <div class="flex items-center gap-3 min-w-0 flex-1">
                            <Checkbox
                              :id="`module-${module.id}`"
                              :model-value="selectedModules.includes(module.id)"
                              @update:model-value="toggleModule(module.id)"
                              :disabled="!module.module || moduleLoading"
                            />
                            <div class="flex-1 cursor-pointer min-w-0" @click="toggleModule(module.id, !selectedModules.includes(module.id))">
                              <label
                                :for="`module-${module.id}`"
                                class="font-medium cursor-pointer text-sm block truncate"
                              >
                                {{ getModuleDisplayName(module.module) }}
                              </label>
                              <p class="text-xs text-muted-foreground mt-0 line-clamp-2 break-words">
                                {{ module.description || 'Sin descripción' }}
                              </p>
                            </div>
                          </div>
                          <Badge
                            :variant="module.module ? 'default' : 'secondary'"
                            class="text-xs flex-shrink-0"
                          >
                            {{ module.module ? 'Activo' : 'Inactivo' }}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" class="flex-1 overflow-hidden flex flex-col mt-4">
            <div class="flex-1 overflow-y-auto px-1">
              <div class="space-y-4 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-lg text-left font-semibold flex items-center gap-2">
                <Shield class="h-4 w-4" />
                Permisos por Módulo
              </h3>
              <Badge variant="secondary" class="text-xs">
                {{ totalSelectedPermissions }} permisos seleccionados
              </Badge>
            </div>

            <!-- Lista de permisos por módulo -->
            <div class="space-y-4 overflow-y-auto max-h-[35rem]">
              <div
                v-for="moduleId in selectedModules"
                :key="moduleId"
                class="border rounded-lg p-4 min-w-0"
              >
                <div class="flex items-center justify-between mb-3 gap-2 min-w-0">
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <h4 class="font-medium truncate text-left">
                      {{ getModuleName(moduleId) }}
                    </h4>
                    <Badge variant="outline" class="text-xs flex-shrink-0">
                      {{ modulePermissions[moduleId]?.length || 0 }} permisos
                    </Badge>
                    <div v-if="loadingPermissions[moduleId]" class="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <div class="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
                      Cargando...
                    </div>
                  </div>
                  <Button
                    v-if="!hasSelectedPermissionsForModule(moduleId)"
                    variant="destructive"
                    size="sm"
                    @click="deleteModule(moduleId)"
                    :disabled="moduleLoading"
                    class="flex-shrink-0"
                  >
                    <Trash2 class="h-3 w-3 mr-1" />
                    <span class="hidden sm:inline">Eliminar Módulo</span>
                    <span class="sm:hidden">Eliminar</span>
                  </Button>
                </div>

                <!-- Permisos del módulo -->
                <div v-if="loadingPermissions[moduleId]" class="text-center py-4">
                  <div class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p class="text-sm text-muted-foreground">Cargando permisos...</p>
                </div>
                
                <div v-else-if="modulePermissions[moduleId]?.length > 0" class="grid grid-cols-1 gap-2 min-w-0">
                  <div
                    v-for="permission in modulePermissions[moduleId]"
                    :key="`${permission.id}-${isPermissionSelected(permission.id, moduleId)}`"
                    class="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 transition-colors min-w-0"
                  >
                    <Checkbox
                      :id="`permission-${permission.id}`"
                      :model-value="isPermissionSelected(permission.id, moduleId)"
                      @update:model-value="togglePermission(permission.id, moduleId)"
                      :disabled="moduleLoading"
                      class="flex-shrink-0"
                    />
                    <label
                      :for="`permission-${permission.id}`"
                      class="text-sm flex-1 min-w-0 text-left"
                    >
                      <div class="font-medium truncate">{{ permission.policyName || 'Sin nombre' }}</div>
                      <div v-if="permission.claimName" class="text-xs text-muted-foreground truncate">
                        {{ permission.claimName }}
                      </div>
                    </label>
                    <Button
                      v-if="isPermissionSelected(permission.id, moduleId)"
                      variant="destructive"
                      size="sm"
                      @click="deletePermission(permission.id, moduleId)"
                      :disabled="moduleLoading"
                      class="ml-2 flex-shrink-0"
                    >
                      <Trash2 class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div v-else class="text-sm text-muted-foreground italic">
                  No hay permisos disponibles para este módulo
                </div>
              </div>
            </div>

            <!-- Mensaje cuando no hay módulos seleccionados -->
            <div v-if="selectedModules.length === 0" class="text-center py-8 text-muted-foreground">
              <Shield class="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Selecciona módulos en la pestaña "Módulos" para ver sus permisos disponibles</p>
            </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <!-- Botones de acción -->
      <DialogFooter class="flex justify-end flex-shrink-0 border-t pt-4">

    
          <Button
            variant="outline"
            @click="closeDialog"
            :disabled="isLoading"
          >
            Cancelar
          </Button>
          <Button
            @click="saveAssignments"
            :disabled="isLoading || selectedModules.length === 0"
          >
            <Save class="h-4 w-4 mr-2" />
            {{ isLoading ? 'Guardando...' : 'Guardar Asignaciones' }}
          </Button>
  
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Shield, 
  Search, 
  Save, 
  Trash2
} from 'lucide-vue-next'
import { useModules } from '@/composables/business/useModules'
import { useToast } from '@/composables/ui/useToast'
// import type { Module } from '@/lib/api/types/module'

// Props
interface Props {
  open: boolean
  roleId: string
  roleName: string
  currentModules?: number[]
  currentPermissions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  currentModules: () => [],
  currentPermissions: () => []
})

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: {
    roleId: string
    modules: number[]
    permissions: number[]
  }]
}>()

// Composables
const { 
  modules, 
  getAllModules,
  getAllModulesPermissions,
  getAllModulesRolePermissions,
  createModuleRoleAccess,
  createModuleRolePermission,
  deleteModuleRoleAccess,
  deleteModuleRolePermission,
  getAllModulesRoleAccess,
  isLoading: moduleLoading
} = useModules()

const { showSuccess, showError } = useToast()

// Estado reactivo
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const moduleSearchTerm = ref('')
const selectedModules = ref<number[]>([])
const activeTab = ref('modules')
// selectedPermissions ya no se usa, se maneja directamente con currentRolePermissions

const modulePermissions = ref<Record<number, any[]>>({})
const loadingPermissions = ref<Record<number, boolean>>({})
const currentRoleAccess = ref<any[]>([])
const currentRolePermissions = ref<any[]>([])


// Computed
const filteredModules = computed(() => {
  if (!modules.value || !Array.isArray(modules.value)) return []
  
  // Filtrar módulos de prueba y solo mostrar módulos habilitados
  const validModules = modules.value.filter(module => 
    module.enable && 
    !module.module?.includes('ModuleUnitTest') && 
    !module.module?.includes('UpdateModuleUnitTest')
  )
  
  if (!moduleSearchTerm.value) return validModules
  
  const term = moduleSearchTerm.value.toLowerCase()
  return validModules.filter(module => 
    module.module?.toLowerCase().includes(term) ||
    module.description?.toLowerCase().includes(term)
  )
})

const totalSelectedPermissions = computed(() => {
  return currentRolePermissions.value.filter(permission => permission.enable === true).length
})

const isLoading = computed(() => 
  moduleLoading.value
)

// Métodos
const getModuleName = (moduleId: number): string => {
  if (!modules.value || !Array.isArray(modules.value)) return 'Módulo desconocido'
  const module = modules.value.find(m => m.id === moduleId)
  return module?.module || 'Módulo desconocido'
}

const getModuleDisplayName = (moduleName: string | null | undefined): string => {
  if (!moduleName) return 'Sin nombre'
  
  // Convertir nombres técnicos a nombres más legibles
  const displayNames: Record<string, string> = {
    'VideosInformativos': 'Videos Informativos',
    'HorariosDisponibilidad': 'Horarios y Disponibilidad',
    'CalendarioVisitas': 'Calendario de Visitas',
    'MaterialesCAD': 'Materiales CAD',
    'CostosPromociones': 'Costos y Promociones',
    'DocumentosOperativosLogisticos': 'Documentos Operativos y Logísticos',
    'NotasComentarios': 'Notas y Comentarios',
    'NotificacionesSistema': 'Notificaciones del Sistema',
    'HistoricoVisitas': 'Histórico de Visitas',
    'ControlAsistenciaReservaciones': 'Control de Asistencia',
    'ReportesVisitasPeriodos': 'Reportes de Visitas',
    'RolesPermisos': 'Roles y Permisos',
    'Catalogos': 'Catálogos',
    'CodigosVinculacion': 'Códigos de Vinculación',
    'Instituciones': 'Instituciones',
    'Promotion': 'Promociones'
  }
  
  return displayNames[moduleName] || moduleName
}

const getModulePermissions = async (moduleId: number) => {
  try {
    // Cargar permisos específicos del módulo desde la API
    const response = await getAllModulesPermissions({ moduleId })
    
    // Debug: Mostrar permisos cargados para el módulo
    if (moduleId === 486) { // Solo para módulo Instituciones
      console.log('📋 Permisos disponibles para Instituciones:', response)
    }
    
    return response || []
  } catch (error) {
    console.error('Error al cargar permisos del módulo:', error)
    return []
  }
}

const toggleModule = async (moduleId: number, newValue?: boolean) => {
  const index = selectedModules.value.indexOf(moduleId)
  const isCurrentlySelected = index > -1
  
  // Si se proporciona newValue, usarlo; si no, usar el estado actual
  const shouldBeSelected = newValue !== undefined ? newValue : !isCurrentlySelected
  
  if (isCurrentlySelected && !shouldBeSelected) {
    // Deseleccionar módulo
    console.log('🔄 Deseleccionando módulo:', moduleId)
    selectedModules.value.splice(index, 1)
    
    // Eliminar acceso de rol al módulo si existe
    await deleteModuleAccess(moduleId)
    
    // Remover permisos del módulo deseleccionado
    if (modulePermissions.value[moduleId]) {
      modulePermissions.value[moduleId].forEach(permission => {
        // Eliminar permiso de rol si existe
        deleteModulePermission(permission.id)
      })
    }
    // Limpiar permisos del módulo
    delete modulePermissions.value[moduleId]
    delete loadingPermissions.value[moduleId]
  } else if (!isCurrentlySelected && shouldBeSelected) {
    // Seleccionar módulo
    console.log('✅ Seleccionando módulo:', moduleId)
    selectedModules.value.push(moduleId)
    
    // NO crear acceso de rol al módulo inmediatamente
    // Solo se creará cuando el usuario haga clic en "Guardar Asignaciones"
    console.log('📝 Módulo seleccionado localmente, se creará el acceso al guardar')
    
    // Cambiar automáticamente al tab de permisos cuando se selecciona un módulo
    if (activeTab.value === 'modules') {
      activeTab.value = 'permissions'
    }
    
    // Cargar permisos del módulo si no están cargados
    if (!modulePermissions.value[moduleId]) {
      console.log('📋 Cargando permisos disponibles para módulo:', moduleId)
      loadingPermissions.value[moduleId] = true
      try {
        const permissions = await getModulePermissions(moduleId)
        // Usar Vue.set o asignación directa para asegurar reactividad
        modulePermissions.value = {
          ...modulePermissions.value,
          [moduleId]: permissions
        }
      } catch (error) {
        console.error('Error al cargar permisos del módulo:', error)
      } finally {
        loadingPermissions.value[moduleId] = false
      }
    }
  }
}


const closeDialog = () => {
  isOpen.value = false
}

const hasSelectedPermissionsForModule = (moduleId: number): boolean => {
  if (!modulePermissions.value[moduleId]) return false
  return modulePermissions.value[moduleId].some(permission => 
    isPermissionSelected(permission.id, moduleId)
  )
}

const isPermissionSelected = (permissionId: number, moduleId: number): boolean => {
  // Buscar si existe un permiso activo para este permissionId y moduleId
  const isCurrentlySelected = currentRolePermissions.value.some(rolePermission => 
    rolePermission.permissionId === permissionId && 
    rolePermission.moduleId === moduleId && 
    rolePermission.enable === true
  )
  
  // Verificar si hay cambios pendientes para este permiso
  const isPendingToAdd = pendingPermissionChanges.value.toAdd.some(
    p => p.permissionId === permissionId && p.moduleId === moduleId
  )
  
  const isPendingToRemove = pendingPermissionChanges.value.toRemove.some(
    p => p.permissionId === permissionId && p.moduleId === moduleId
  )
  
  // Calcular el estado final considerando los cambios pendientes
  let finalState = isCurrentlySelected
  
  if (isPendingToAdd) {
    finalState = true
  } else if (isPendingToRemove) {
    finalState = false
  }
  
  return finalState
}

const deletePermission = async (permissionId: number, moduleId: number) => {
  try {
    console.log('🗑️ Marcando permiso para eliminación:', permissionId, 'del módulo:', moduleId)
    
    // Remover de la lista de agregar si existe
    pendingPermissionChanges.value.toAdd = pendingPermissionChanges.value.toAdd.filter(
      p => !(p.permissionId === permissionId && p.moduleId === moduleId)
    )
    
    // Agregar a la lista de remover si no existe
    const alreadyInRemoveList = pendingPermissionChanges.value.toRemove.some(
      p => p.permissionId === permissionId && p.moduleId === moduleId
    )
    
    if (!alreadyInRemoveList) {
      pendingPermissionChanges.value.toRemove.push({ permissionId, moduleId })
    }
    
    console.log('📝 Cambios pendientes actualizados:', pendingPermissionChanges.value)
  } catch (error) {
    console.error('Error al marcar permiso para eliminación:', error)
    showError('Error', 'No se pudo marcar el permiso para eliminación')
  }
}

const deleteModule = async (moduleId: number) => {
  try {
    console.log('🗑️ Eliminando módulo:', moduleId)
    
    // Remover del estado local
    const index = selectedModules.value.indexOf(moduleId)
    if (index > -1) {
      selectedModules.value.splice(index, 1)
    }
    
    // NO eliminar acceso de rol al módulo inmediatamente
    // Solo se eliminará cuando se guarde o se cierre el diálogo
    console.log('📝 Módulo removido localmente, se eliminará el acceso al guardar')
    
    // Limpiar permisos del módulo del estado local
    // Los permisos se manejan directamente con currentRolePermissions
    delete modulePermissions.value[moduleId]
    delete loadingPermissions.value[moduleId]
    
    showSuccess('Módulo eliminado', 'El módulo ha sido eliminado de la selección')
  } catch (error) {
    console.error('Error al eliminar módulo:', error)
    showError('Error', 'No se pudo eliminar el módulo')
  }
}


const deleteModuleAccess = async (moduleId: number) => {
  try {
    // Buscar el acceso existente para este rol y módulo
    const existingAccess = currentRoleAccess.value.find(access => 
      access.roleId === props.roleId && access.moduleId === moduleId
    )
    
    if (existingAccess) {
      console.log('Eliminando acceso de rol al módulo:', existingAccess.id)
      await deleteModuleRoleAccess({ id: existingAccess.id })
    }
  } catch (error) {
    console.error('Error al eliminar acceso de rol al módulo:', error)
  }
}

const deleteModulePermission = async (permissionId: number) => {
  try {
    // Buscar el permiso existente para este rol
    const existingPermission = currentRolePermissions.value.find(permission => 
      permission.roleId === props.roleId && permission.permissionId === permissionId
    )
    
    if (existingPermission) {
      const result = await deleteModuleRolePermission({ id: existingPermission.id })
      
      // Actualizar el estado local después de eliminar
      if (result) {
        const index = currentRolePermissions.value.findIndex(p => p.id === existingPermission.id)
        if (index > -1) {
          currentRolePermissions.value.splice(index, 1)
        }
      }
      
      return result
    }
    
    return null
  } catch (error) {
    console.error('Error al eliminar permiso de rol:', error)
    return null
  }
}

const loadPermissionsForAssignedModules = async (moduleIds: number[]) => {
  try {
    console.log('📋 Cargando permisos para módulos ya asignados:', moduleIds)
    
    for (const moduleId of moduleIds) {
      if (!modulePermissions.value[moduleId]) {
        loadingPermissions.value[moduleId] = true
        
        try {
          const permissions = await getModulePermissions(moduleId)
          
          modulePermissions.value = {
            ...modulePermissions.value,
            [moduleId]: permissions
          }
        } catch (error) {
          console.error(`Error al cargar permisos del módulo ${moduleId}:`, error)
        } finally {
          loadingPermissions.value[moduleId] = false
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar permisos de módulos asignados:', error)
  }
}

// Estado local para manejar permisos pendientes
const pendingPermissionChanges = ref<{
  toAdd: Array<{ permissionId: number, moduleId: number }>
  toRemove: Array<{ permissionId: number, moduleId: number }>
}>({
  toAdd: [],
  toRemove: []
})

const togglePermission = async (permissionId: number, moduleId: number, newValue?: boolean) => {
  try {
    console.log('🔄 togglePermission llamado:', { permissionId, moduleId })
    
    const isCurrentlySelected = isPermissionSelected(permissionId, moduleId)
    
    // Si se proporciona newValue, usarlo; si no, usar el estado actual
    const shouldBeSelected = newValue !== undefined ? newValue : !isCurrentlySelected
    
    if (isCurrentlySelected && !shouldBeSelected) {
      // Deseleccionar permiso - agregar a la lista de cambios pendientes
      console.log('🔄 Marcando permiso para deselección:', permissionId)
      
      // Remover de la lista de agregar si existe
      pendingPermissionChanges.value.toAdd = pendingPermissionChanges.value.toAdd.filter(
        p => !(p.permissionId === permissionId && p.moduleId === moduleId)
      )
      
      // Agregar a la lista de remover si no existe
      const alreadyInRemoveList = pendingPermissionChanges.value.toRemove.some(
        p => p.permissionId === permissionId && p.moduleId === moduleId
      )
      
      if (!alreadyInRemoveList) {
        pendingPermissionChanges.value.toRemove.push({ permissionId, moduleId })
      }
      
    } else if (!isCurrentlySelected && shouldBeSelected) {
      // Seleccionar permiso - agregar a la lista de cambios pendientes
      console.log('✅ Marcando permiso para selección:', permissionId)
      
      // Remover de la lista de remover si existe
      pendingPermissionChanges.value.toRemove = pendingPermissionChanges.value.toRemove.filter(
        p => !(p.permissionId === permissionId && p.moduleId === moduleId)
      )
      
      // Agregar a la lista de agregar si no existe
      const alreadyInAddList = pendingPermissionChanges.value.toAdd.some(
        p => p.permissionId === permissionId && p.moduleId === moduleId
      )
      
      if (!alreadyInAddList) {
        pendingPermissionChanges.value.toAdd.push({ permissionId, moduleId })
      }
    }
    
    console.log('📝 Cambios pendientes:', pendingPermissionChanges.value)
  } catch (error) {
    console.error('Error al cambiar estado del permiso:', error)
    showError('Error', 'No se pudo cambiar el estado del permiso')
  }
}

const saveAssignments = async () => {
  try {
    console.log('💾 Guardando asignaciones para rol:', props.roleId)
    console.log('📦 Módulos seleccionados:', selectedModules.value.length)
    console.log('🔐 Cambios pendientes:', pendingPermissionChanges.value)
    
    // 1. Crear accesos de módulos
    console.log('📦 Creando accesos de módulos...')
    for (const moduleId of selectedModules.value) {
      // Verificar si el acceso ya existe
      const existingAccess = currentRoleAccess.value.find(access => 
        access.roleId === props.roleId && access.moduleId === moduleId
      )
      
      if (!existingAccess) {
        console.log('📦 Creando acceso para módulo:', moduleId)
        const newAccess = await createModuleRoleAccess({
          roleId: props.roleId,
          moduleId: moduleId
        })
        
        if (newAccess) {
          currentRoleAccess.value.push(newAccess)
        }
      }
    }
    
    // 2. Procesar cambios de permisos pendientes
    console.log('🔐 Procesando cambios de permisos...')
    
    // Eliminar permisos marcados para remover
    for (const change of pendingPermissionChanges.value.toRemove) {
      console.log('🗑️ Eliminando permiso:', change.permissionId, 'del módulo:', change.moduleId)
      
      // Buscar el permiso de rol activo para este permissionId y moduleId
      const activeRolePermission = currentRolePermissions.value.find(rolePermission => 
        rolePermission.permissionId === change.permissionId && 
        rolePermission.moduleId === change.moduleId && 
        rolePermission.enable === true
      )
      
      if (activeRolePermission) {
        const deleteResult = await deleteModuleRolePermission({ id: activeRolePermission.id })
        if (deleteResult) {
          console.log('✅ Permiso eliminado:', change.permissionId)
        }
      }
    }
    
    // Crear permisos marcados para agregar
    for (const change of pendingPermissionChanges.value.toAdd) {
      console.log('✅ Creando permiso:', change.permissionId, 'para módulo:', change.moduleId)
      
      const createResult = await createModuleRolePermission({
        roleId: props.roleId,
        moduleId: change.moduleId,
        permissionId: change.permissionId
      })
      
      if (createResult) {
        console.log('✅ Permiso creado:', change.permissionId)
      }
    }
    
    // 3. Recargar los datos actualizados
    console.log('🔄 Recargando datos actualizados...')
    const updatedRolePermissions = await getAllModulesRolePermissions({ roleId: props.roleId })
    currentRolePermissions.value = updatedRolePermissions
    
    // 4. Limpiar cambios pendientes
    pendingPermissionChanges.value = { toAdd: [], toRemove: [] }
    
    // 5. Emitir evento de éxito
    emit('save', {
      roleId: props.roleId,
      modules: selectedModules.value,
      permissions: currentRolePermissions.value.filter(p => p.enable === true).map(p => p.id)
    })
    
    showSuccess('Asignaciones guardadas', 'Los módulos y permisos se han asignado correctamente al rol')
    closeDialog()
  } catch (error) {
    showError('Error al guardar', 'No se pudieron guardar las asignaciones')
    console.error('Error al guardar asignaciones:', error)
  }
}

// Watchers
watch(() => props.open, (newValue: boolean) => {
  if (newValue) {
    // Inicializar con los valores actuales
    selectedModules.value = [...props.currentModules]
    // Limpiar cambios pendientes
    pendingPermissionChanges.value = { toAdd: [], toRemove: [] }
    // Resetear tab activo
    activeTab.value = 'modules'
    // selectedPermissions ya no se usa
    loadData()
  }
})

// Métodos de carga
const loadData = async () => {
  try {
    console.log('🚀 Iniciando carga de datos...')
    await getAllModules()
    
    // Cargar accesos y permisos actuales del rol
    if (props.roleId) {
      console.log('📋 Cargando datos del rol:', props.roleId)
      
      // Cargar accesos de rol a módulos
      const roleAccess = await getAllModulesRoleAccess({ roleId: props.roleId })
      currentRoleAccess.value = roleAccess
      
      // Cargar permisos de rol en módulos
      const rolePermissions = await getAllModulesRolePermissions({ roleId: props.roleId })
      currentRolePermissions.value = rolePermissions
      
      // Inicializar módulos basados en los datos actuales
      selectedModules.value = roleAccess.map(access => access.moduleId)
      // No necesitamos selectedPermissions, usamos currentRolePermissions directamente
      
      console.log('📦 Módulos asignados:', selectedModules.value.length)
      console.log('🔐 Permisos activos asignados:', rolePermissions.filter(p => p.enable === true).length)
      console.log('🔐 Total permisos en BD (activos + inactivos):', rolePermissions.length)
      
      // Debug: Mostrar permisos del módulo Instituciones (ID: 486)
      const institucionesPermissions = rolePermissions.filter(p => p.moduleId === 486)
      console.log('🏛️ Permisos de Instituciones:', institucionesPermissions)
      
      // Cargar permisos de los módulos ya asignados
      await loadPermissionsForAssignedModules(roleAccess.map(access => access.moduleId))
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    showError('Error', 'No se pudieron cargar los datos')
  }
}

// Lifecycle
onMounted(() => {
  if (props.open) {
    loadData()
  }
})
</script>
