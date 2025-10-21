<template>
    <div>

        <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
            <!-- Input principal que se expande -->
            <div class="relative" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
                <Card
                    class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2" 
                    :class="[
                        showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full'
                    ]" @click="toggleOptions">
                    <CardContent class="flex items-center justify-between py-1 px-1">
                       <p class="text-sm font-semibold">
                            Gestiona los roles
                        </p>
                        <Icon v-if="showOptions" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
                        <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
                        </CardContent>
                </Card>
            </div>

            <!-- Opciones que se expanden hacia abajo -->
            <div v-if="showOptions" class=" space-y-0 pt-0 px-0 pb-4"
                v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
                <!-- Lista de roles -->
                <div class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
                    <!-- Opción para agregar nuevo rol al final de la lista -->
                    <div class="p-3 bg-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
                        @click="openCreateDialog">
                        <div class="flex items-center justify-between space-x-2 px-2">
                            <span class="text-sm text-muted-foreground font-medium">Agregar nuevo rol</span>
                            <Icon icon="lucide:plus" width="16" height="16" class="text-primary" />
                        </div>
                    </div>
                    <div v-for="(role, index) in props.roles" :key="role.id"
                        class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
                        :class="[
                            index === props.roles.length - 1 ? 'rounded-b-md' : 'rounded-none',
                            index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
                        ]">


                        <div class="flex items-center justify-between space-x-4">
                            <div class="flex items-center space-x-4">
                                <!-- Switch por rol -->
                                <!-- <Switch :model-value="role.enable" class="mr-2"
                                    @update:model-value="handleToggleActive(role.id)"
                                    :disabled="!props.onToggleActive" /> -->
                                <div class="flex flex-col pe-2">
                                    <span class="text-sm font-medium text-foreground truncate max-w-[200px]">
                                        {{ role.name }}
                                    </span>
                                    <span class="text-xs text-muted-foreground">
                                        {{ role.roleType }}
                                    </span>
                                </div>
                            </div>

                            <!-- Botones de acción -->
                            <div class="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" @click.stop="handleAssignModules(role)" class="h-8 w-8 p-0 text-primary"
                                    title="Asignar módulos y permisos">
                                    <Icon icon="lucide:package" width="16" height="16" />
                                </Button>
                                <Button variant="ghost" size="sm" @click.stop="handleAddUser(role)" class="h-8 w-8 p-0 text-primary"
                                    title="Agregar usuario">
                                    <Icon icon="lucide:user-plus" width="16" height="16" />
                                </Button>
                                <Button variant="ghost" size="sm" @click.stop="handleEdit(role)" class="h-8 w-8 p-0 text-primary"
                                    title="Editar rol">
                                    <Icon icon="lucide:edit" width="16" height="16" />
                                </Button>
                                <Button variant="ghost" size="sm" @click.stop="handleDelete(role)"
                                    class="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Eliminar rol">
                                    <Icon icon="lucide:trash-2" width="16" height="16" />
                                </Button>
                            </div>
                        </div>
                    </div>



                    <!-- Mensaje si no hay roles -->
                    <div v-if="props.roles.length === 0"
                        class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
                        <span class="text-sm text-muted-foreground text-center block">
                            No hay roles disponibles
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Diálogo para crear nuevo rol -->
        <CreateRoleDialog v-model:open="showCreateDialog" @save="handleCreateRole" @success="handleRoleCreated" />

        <!-- Diálogo para editar rol -->
        <EditRoleDialog v-model:open="showEditDialog" v-model:role="selectedRole" @save="handleEditRole"
            @success="handleRoleEdited" />

        <!-- Diálogo para agregar usuario al rol -->
        <AddUserToRoleDialog v-model:open="showAddUserDialog" v-model:role="selectedRole" @save="handleAddUserToRole"
            @success="handleUserAddedToRole" />

        <!-- Diálogo para asignar módulos al rol -->
        <RoleModuleAssignmentDialog 
            v-model:open="showModuleDialog" 
            v-if="selectedRole" 
            :role-id="selectedRole.id" 
            :role-name="selectedRole.name" 
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Icon } from '@iconify/vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import CreateRoleDialog from './CreateRoleDialog.vue'
import EditRoleDialog from './EditRoleDialog.vue'
import AddUserToRoleDialog from './AddUserToRoleDialog.vue'
import RoleModuleAssignmentDialog from './RoleModuleAssignmentDialog.vue'
import type { Role } from '~/lib/api/types/role'

interface Props {
    modelValue: number[] | number
    label: string
    placeholder?: string
    roles: readonly Role[]
    autoOpen?: boolean
    multiple?: boolean
    onToggleActive?: (id: string) => Promise<void>
    onEdit?: (role: Role) => Promise<void>
    onDelete?: (role: Role) => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Seleccionar roles...',
    autoOpen: false,
    multiple: true
})

const emit = defineEmits<{
    'update:modelValue': [value: number[] | number]
    'update-role': [role: Role]
    'new-role': [role: Role]
    'delete-role': [role: Role]
}>()

const showOptions = ref(props.autoOpen)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showAddUserDialog = ref(false)
const showModuleDialog = ref(false)
const selectedRole = ref<Role | null>(null)

// Toast para notificaciones (comentado ya que no se usa en este componente)
// const { showSuccess, showError, showInfo } = useToast()

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(() => props.autoOpen, (newValue: boolean) => {
    showOptions.value = newValue
})

const toggleOptions = () => {
    showOptions.value = !showOptions.value
}

const openCreateDialog = () => {
    showCreateDialog.value = true
}

const openEditDialog = (role: Role) => {
    selectedRole.value = role
    showEditDialog.value = true
}

const handleToggleActive = async (id: string) => {
    if (props.onToggleActive) {
        try {
            await props.onToggleActive(id)
        } catch (error) {
            console.error('Error al cambiar el estado del rol:', error)
        }
    }
}

const handleAddUser = async (role: Role) => {
    selectedRole.value = role
    showAddUserDialog.value = true
}

const handleEdit = async (role: Role) => {
    openEditDialog(role)
}

const handleDelete = async (role: Role) => {


    if (props.onDelete) {
        await props.onDelete(role)
    }

    // No es necesario emitir el evento delete-role porque onDelete ya maneja la eliminación
    // emit('delete-role', role)
    // El toast de éxito se maneja en la página padre
    // showSuccess('Rol eliminado', `El rol "${role.name}" se ha eliminado correctamente`)
}

const handleCreateRole = (newRole: Role) => {
    emit('new-role', newRole)
}

const handleRoleCreated = (newRole: Role) => {
    // El rol ya se agregó automáticamente al estado del composable
    console.log('Nuevo rol creado:', newRole)
}

const handleEditRole = (updatedRole: Role) => {
    emit('update-role', updatedRole)
}

const handleRoleEdited = (updatedRole: Role) => {
    // Actualizar el rol seleccionado con los datos actualizados
    selectedRole.value = updatedRole
    console.log('Rol actualizado:', updatedRole)
}

const handleAddUserToRole = (email: string) => {
    console.log('Usuario agregado al rol:', email)
}

const handleUserAddedToRole = (email: string) => {
    console.log('Usuario agregado exitosamente:', email)
}

const handleAssignModules = (role: Role) => {
    selectedRole.value = role
    showModuleDialog.value = true
    console.log('Asignar módulos al rol:', role)
}
</script>