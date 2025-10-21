<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          Asignación de Módulos y Permisos
        </DialogTitle>
        <DialogDescription class="text-left text-muted-foreground">
          Gestiona los módulos y permisos asignados al rol: <strong>{{ roleName }}</strong>
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Botón para asignar módulos -->


          <div class="w-full flex items-center justify-end my-3">
            <Button
            @click="openAssignmentDialog"
            class="flex items-center gap-2"
          >
            Asignar Módulos
          </Button>
          </div>
      
          

        <!-- Resumen de asignaciones actuales -->
        <div v-if="currentAssignments.length > 0" class="space-y-3">
          <h4 class="font-medium flex items-center gap-2">
            <Shield class="h-4 w-4" />
            Asignaciones Actuales
          </h4>
          
          <div class="grid gap-3">
            <div
              v-for="assignment in currentAssignments"
              :key="assignment.moduleId"
              class="p-3 border rounded-lg bg-card"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Package class="h-4 w-4 text-muted-foreground" />
                  <span class="font-medium">{{ assignment.moduleName }}</span>
                  <Badge variant="outline" class="text-xs">
                    {{ assignment.permissions.length }} permisos
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="removeModuleAssignment(assignment.moduleId)"
                  :disabled="isRemoving"
                  class="text-destructive hover:text-destructive"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
              
              <!-- Lista de permisos -->
              <div v-if="assignment.permissions.length > 0" class="flex flex-wrap gap-1">
                <Badge
                  v-for="permission in assignment.permissions"
                  :key="permission.id"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ permission.policyName || 'Sin nombre' }}
                </Badge>
              </div>
              <div v-else class="text-sm text-muted-foreground italic">
                Sin permisos asignados
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay asignaciones -->
        <div v-else class="text-center py-8 text-muted-foreground">
          <Package class="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p class="font-medium">No hay módulos asignados</p>
          <p class="text-sm">Haz clic en "Asignar Módulos" para comenzar</p>
        </div>

        <!-- Dialog de asignación -->
        <ModuleAssignmentDialog
          v-model:open="showAssignmentDialog"
          :role-id="roleId"
          :role-name="roleName"
          :current-modules="currentModuleIds"
          :current-permissions="currentPermissionIds"
          @save="handleSaveAssignments"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" @click="closeDialog">
          Cerrar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Package, Shield, Trash2 } from 'lucide-vue-next'
import ModuleAssignmentDialog from './ModuleAssignmentDialog.vue'
import { useModules } from '@/composables/business/useModules'
import { useToast } from '@/composables/ui/useToast'

// Props
interface Props {
  open: boolean
  roleId: string
  roleName: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Composables
const { 
  moduleRoleAccess,
  moduleRolePermissions,
  getAllModules,
  getAllModulesRoleAccess,
  getAllModulesRolePermissions,
  deleteModuleRoleAccess,
  deleteModuleRolePermission,
  isDeletingRoleAccess,
  isDeletingRolePermission
} = useModules()

const { showSuccess, showError } = useToast()

// Estado reactivo
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const showAssignmentDialog = ref(false)
const currentAssignments = ref<Array<{
  moduleId: number
  moduleName: string
  permissions: Array<{
    id: number
    policyName: string | null
  }>
}>>([])

// Computed
// const canAssignModules = computed(() => {
//   // Verificar si el usuario tiene permisos de administrador
//   return user.value?.roleTypeId === 1 // Asumiendo que 1 es el ID del rol de administrador
// })

const currentModuleIds = computed(() => 
  currentAssignments.value.map(a => a.moduleId)
)

const currentPermissionIds = computed(() => 
  currentAssignments.value.flatMap(a => a.permissions.map(p => p.id))
)

const isRemoving = computed(() => 
  isDeletingRoleAccess.value || isDeletingRolePermission.value
)

// Métodos
const openAssignmentDialog = () => {
  // if (!canAssignModules.value) {
  //   showError('Sin permisos', 'No tienes permisos para asignar módulos')
  //   return
  // }
  showAssignmentDialog.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const loadCurrentAssignments = async () => {
  try {
    // Cargar accesos de roles a módulos
    const roleAccess = await getAllModulesRoleAccess({ roleId: props.roleId })
    
    // Cargar permisos de roles en módulos
    const rolePermissions = await getAllModulesRolePermissions({ roleId: props.roleId })
    
    // Procesar las asignaciones
    const assignments: typeof currentAssignments.value = []
    
    roleAccess.forEach(access => {
      // Filtrar solo permisos activos (enable: true) para este módulo
      const activeModulePermissions = rolePermissions.filter(p => 
        p.moduleId === access.moduleId && p.enable === true
      )
      
      // Eliminar duplicados por permissionId, manteniendo solo el más reciente
      const uniquePermissions = activeModulePermissions.reduce((acc, current) => {
        const existing = acc.find(p => p.permissionId === current.permissionId)
        if (!existing || new Date(current.dateModified) > new Date(existing.dateModified)) {
          // Si no existe o es más reciente, reemplazar
          acc = acc.filter(p => p.permissionId !== current.permissionId)
          acc.push(current)
        }
        return acc
      }, [] as typeof activeModulePermissions)
      
      assignments.push({
        moduleId: access.moduleId,
        moduleName: access.module || 'Sin nombre',
        permissions: uniquePermissions.map(p => ({
          id: p.id,
          policyName: p.policyName || 'Sin nombre'
        }))
      })
    })
    
    currentAssignments.value = assignments
  } catch (error) {
    console.error('Error al cargar asignaciones actuales:', error)
  }
}

const handleSaveAssignments = async (_data: {
  roleId: string
  modules: number[]
  permissions: number[]
}) => {
  try {
    // Recargar las asignaciones actuales
    await loadCurrentAssignments()
    
    // No mostrar notificaciones aquí - el componente hijo se encarga de esto
  } catch (error) {
    showError('Error al guardar', 'No se pudieron guardar las asignaciones')
    console.error('Error al guardar asignaciones:', error)
  }
}

const removeModuleAssignment = async (moduleId: number) => {
  try {
    // Buscar el acceso del rol al módulo
    const roleAccess = moduleRoleAccess.value.find(ra => 
      ra.roleId === props.roleId && ra.moduleId === moduleId
    )
    
    if (roleAccess) {
      // Eliminar el acceso del rol al módulo
      await deleteModuleRoleAccess({ id: roleAccess.id })
    }
    
    // Eliminar solo los permisos activos del rol en este módulo
    const activeRolePermissions = moduleRolePermissions.value.filter(rp => 
      rp.roleId === props.roleId && rp.moduleId === moduleId && rp.enable === true
    )
    
    for (const permission of activeRolePermissions) {
      await deleteModuleRolePermission({ id: permission.id })
    }
    
    // Recargar las asignaciones
    await loadCurrentAssignments()
    
    // Solo mostrar una notificación de éxito al final
    showSuccess('Asignación eliminada', 'El módulo y sus permisos han sido removidos del rol')
  } catch (error) {
    showError('Error al eliminar', 'No se pudo eliminar la asignación')
    console.error('Error al eliminar asignación:', error)
  }
}

// Watchers
watch(() => props.open, async (newValue) => {
  if (newValue) {
    await getAllModules()
    await loadCurrentAssignments()
  }
})

// Lifecycle
onMounted(async () => {
  if (props.open) {
    await getAllModules()
    await loadCurrentAssignments()
  }
})
</script>
