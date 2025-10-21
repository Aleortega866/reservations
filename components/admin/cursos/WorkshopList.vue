<template>
    <div>
        <div class="flex items-center justify-between" @click="toggleOptions">
            <label class="block text-sm font-semibold">{{ label }}</label>
            <Icon v-if="showOptions" icon="lucide:chevron-down" width="16" height="16" class="text-muted-foreground" />
        </div>

        <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
            <!-- Input principal que se expande -->
            <div class="relative" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
                <Card v-if="!showOptions"
                    class="bg-muted cursor-pointer hover:bg-muted/50 transition-colors rounded-md py-2"
                    @click="toggleOptions">
                    <CardContent class="flex items-center justify-between py-1 px-2">
                        <p class="text-sm text-muted-foreground">Activa o pausa los talleres</p>
                        <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            <!-- Opciones que se expanden hacia abajo -->
            <div v-if="showOptions" class="space-y-0" v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
                <!-- Botón de agregar nuevo taller -->
                <div class="p-3 bg-background border border-muted border-t-0 hover:bg-muted/50 transition-colors cursor-pointer"
                     @click="openAddDialog">
                    <div class="flex items-center justify-between space-x-2 px-2">
                        <span class="text-sm text-muted-foreground font-medium">Agregar nuevo taller</span>
                        <Icon icon="lucide:plus" width="16" height="16" class="text-muted-foreground" />
                    </div>
                </div>
                
                <!-- Lista de talleres -->
                <div class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
                    <div v-for="(formulario, index) in props.formularios" :key="formulario.id"
                        class="p-3 bg-background border border-muted border-t-0 hover:bg-muted/50 transition-colors"
                        :class="index === props.formularios.length - 1 ? 'rounded-b-md' : 'rounded-none'">
                        <div class="flex items-center justify-between space-x-4">
                            <div class="flex items-center space-x-4">
                                <!-- Switch por taller -->
                                <Switch 
                                    :model-value="formulario.enable" 
                                    class="mr-2" 
                                    @update:model-value="handleToggleEnable(formulario.id)"
                                    :disabled="!props.onToggleEnable"
                                />
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-foreground">
                                        {{ formulario.description }}
                                    </span>
                                    <span class="text-xs text-muted-foreground">
                                        Capacidad: {{ formulario.currentCapacity || 0 }}/{{ formulario.maxCapacity || 'N/A' }}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Iconos de editar y eliminar -->
                            <div class="flex items-center space-x-2">
                                <Icon @click.stop="openEditDialog(formulario)" icon="lucide:pencil" width="16" height="16" class="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                                <Icon @click.stop="handleDeleteWorkshop(formulario)" icon="lucide:trash-2" width="16" height="16" class="text-muted-foreground hover:text-destructive cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>

                    <!-- Mensaje si no hay talleres -->
                    <div v-if="props.formularios.length === 0"
                        class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
                        <span class="text-sm text-muted-foreground text-center block">
                            No hay talleres disponibles
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Diálogo de crear nuevo taller -->
        <CreateWorkshopDialog
            v-model:open="showAddDialog"
            @save="handleAddWorkshop"
            @success="handleSuccess"
        />

        <!-- Diálogo de editar taller -->
        <EditWorkshopDialog
            v-model:open="showEditDialog"
            :workshop="selectedWorkshop"
            @save="handleEditWorkshop"
            @success="handleSuccess"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Switch } from '@/components/ui/switch'
import CreateWorkshopDialog from './CreateWorkshopDialog.vue'
import EditWorkshopDialog from './EditWorkshopDialog.vue'

interface Formulario {
    id: number
    description: string
    enable: boolean
    maxCapacity?: number
    currentCapacity?: number
    duration?: number
    isActive?: boolean
}

interface Props {
    modelValue: number[] | number
    label: string
    placeholder?: string
    formularios: readonly Formulario[]
    autoOpen?: boolean
    multiple?: boolean
    onToggleEnable?: (id: number) => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Seleccionar formularios...',
    autoOpen: false,
    multiple: true
})

const emit = defineEmits<{
    'update:modelValue': [value: number[] | number]
    'update-formulario': [formulario: Formulario]
    'new-formulario': [formulario: Formulario]
    'delete-formulario': [formulario: Formulario]
    'add-workshop': [workshop: any]
    'edit-workshop': [workshop: any]
    'delete-workshop': [workshop: Formulario]
}>()

const showOptions = ref(props.autoOpen)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedWorkshop = ref<{
    id: number
    description: string
    maxCapacity: number
    duration: number
    isActive: boolean
    currentCapacity: number
} | null>(null)

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(() => props.autoOpen, (newValue: boolean) => {
    showOptions.value = newValue
})

const toggleOptions = () => {
    showOptions.value = !showOptions.value
}

const handleToggleEnable = async (id: number) => {
    if (props.onToggleEnable) {
        try {
            await props.onToggleEnable(id)
        } catch (error) {
            console.error('Error al cambiar el estado del formulario:', error)
        }
    }
}

// Abrir diálogo de agregar nuevo taller
const openAddDialog = () => {
    showAddDialog.value = true
}

// Abrir diálogo de editar taller
const openEditDialog = (workshop: Formulario) => {
    // Convertir Formulario a Workshop
    const workshopData = {
        id: workshop.id,
        description: workshop.description,
        maxCapacity: workshop.maxCapacity || 0,
        duration: workshop.duration || 0,
        isActive: workshop.isActive ?? workshop.enable,
        currentCapacity: workshop.currentCapacity || 0
    }
    selectedWorkshop.value = workshopData
    showEditDialog.value = true
}

// Manejar agregado de nuevo taller
const handleAddWorkshop = (workshop: any) => {
    emit('add-workshop', workshop)
    showAddDialog.value = false
}

// Manejar edición de taller
const handleEditWorkshop = (workshop: any) => {
    emit('edit-workshop', workshop)
    showEditDialog.value = false
    selectedWorkshop.value = null
}

// Manejar eliminación de taller
const handleDeleteWorkshop = (workshop: Formulario) => {
    emit('delete-workshop', workshop)
}

// Manejar éxito de operaciones
const handleSuccess = (data: any) => {
    // Aquí puedes manejar el éxito de las operaciones
    console.log('Operación exitosa:', data)
}
</script> 