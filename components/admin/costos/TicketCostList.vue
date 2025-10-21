<template>
    <div>
        <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
            <!-- Input principal que se expande -->
            <div class="relative" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">

                <Card 
                    class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
                    :class="[
                        showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full'
                    ]"
                    @click="toggleOptions">
                    <CardContent class="flex items-center justify-between py-1 px-1">
                        <p class="text-sm font-semibold">Costos de los boletos</p>
                        <Icon v-if="showOptions" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
                        <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
                    </CardContent>
                </Card>

            </div>

            <!-- Opciones que se expanden hacia abajo -->
            <div v-if="showOptions" class="space-y-0" v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
                <!-- Lista de opciones -->
                <div class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
                    <div v-for="(option, index) in props.options" :key="option.value"
                        class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
                        :class="[
                            index === props.options.length - 1 ? 'rounded-b-md' : 'rounded-none',
                            index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
                        ]">
                        <div class="flex items-center justify-between space-x-4">
                             <div class="flex items-center space-x-4">
                                 <span class="text-sm text-muted-foreground cursor-pointer break-words"
                                     :title="option.label">
                                     {{ option.label }}
                                 </span>
                             </div>
                             <div class="flex items-center space-x-3 flex-shrink-0">
                                 <span class="text-sm text-muted-foreground font-bold cursor-pointer pe-2">
                                     $ {{ option.price }}
                                 </span>
                                 <Icon @click.stop="openEditDialog(option)" icon="lucide:pencil" width="16" height="16" class="text-primary hover:text-primary cursor-pointer transition-colors" />
                             </div>
                         </div>
                    </div>

                    <!-- Mensaje si no hay opciones -->
                    <div v-if="props.options.length === 0"
                        class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
                        <span class="text-sm text-muted-foreground text-center block">
                            No hay opciones disponibles
                        </span>
                    </div>
                </div>

            </div>
        </div>

        <!-- Diálogo de edición -->
        <EditTicketCostDialog v-model:open="showEditDialog" :initial-cost="selectedTicket?.price || ''"
            :ticket-label="selectedTicket?.label || ''" :ticket-id="selectedTicket?.id || 0"
            v-bind="selectedTicket?.visitorType ? { 'visitor-type': selectedTicket.visitorType } : {}"
            @save="(newCost: number) => handleSaveTicket({ ...selectedTicket!, price: newCost.toString() })"
            @success="handleSuccess" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import EditTicketCostDialog from './EditTicketCostDialog.vue'

interface Option {
    value: string
    label: string
    price: string
    description?: string
    id: number
    visitorType?: number
}

interface Props {
    modelValue: string[] | string
    label: string
    placeholder?: string
    options: Option[]
    autoOpen?: boolean
    multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Seleccionar opciones...',
    autoOpen: false,
    multiple: true
})

const emit = defineEmits<{
    'update:modelValue': [value: string[] | string]
    'update-ticket': [ticket: Option]
    'success': [data: { id: number, newAmount: number }]
}>()

const showOptions = ref(props.autoOpen)
const showEditDialog = ref(false)
const selectedTicket = ref<Option | null>(null)

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(() => props.autoOpen, (newValue: boolean) => {
    showOptions.value = newValue
})

const toggleOptions = () => {
    showOptions.value = !showOptions.value
}

// Abrir diálogo de edición
const openEditDialog = (ticket: Option) => {
    selectedTicket.value = { ...ticket } // Crear una copia para evitar referencias
    showEditDialog.value = true
}

// Manejar guardado del ticket
const handleSaveTicket = (updatedTicket: Option) => {
    emit('update-ticket', updatedTicket)
    showEditDialog.value = false
    selectedTicket.value = null
}

// Manejar éxito de la actualización
const handleSuccess = (data: { id: number, newAmount: number }) => {
    emit('success', data)
}
</script>