<template>
    <div>
        <div class="flex items-center justify-between" @click="openRulesModal">
            <label class="block text-sm font-semibold">{{ label }}</label>
            <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground" />
        </div>

        <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
            <!-- Input principal que se expande -->
            <div class="relative rounded-md">
                <Card 
                    class="bg-muted cursor-pointer hover:bg-muted/50 transition-colors rounded-md py-2"
                    @click="openRulesModal">
                    <CardContent class="flex items-center justify-between py-1 px-2">
                        <p class="text-sm text-muted-foreground">Configurar reglas de talleres y horarios</p>
                        <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Modal principal de reglas -->
        <RulesWorkshopModal
            v-model:open="showRulesModal"
            @select-option="handleOptionSelection"
        />

        <!-- Modal de talleres por tipo de visita -->
        <WorkshopsByVisitTypeModal
            v-model:open="showWorkshopsModal"
            @save="handleWorkshopsSave"
        />

        <!-- Modal de rangos de horas -->
        <TimeRangeModal
            v-model:open="showTimeModal"
            @save="handleTimeSave"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import RulesWorkshopModal from './RulesWorkshopModal.vue'
import WorkshopsByVisitTypeModal from './WorkshopsByVisitTypeModal.vue'
import TimeRangeModal from './TimeRangeModal.vue'

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
    'workshops-save': [data: any]
    'time-save': [data: any]
}>()

// Estados de los modales
const showRulesModal = ref(false)
const showWorkshopsModal = ref(false)
const showTimeModal = ref(false)

// Abrir modal principal de reglas
const openRulesModal = () => {
    showRulesModal.value = true
}

// Manejar selección de opción en el modal principal
const handleOptionSelection = (option: 'workshops' | 'hours') => {
    if (option === 'workshops') {
        showWorkshopsModal.value = true
    } else if (option === 'hours') {
        showTimeModal.value = true
    }
}

// Manejar guardado de configuración de talleres
const handleWorkshopsSave = (data: any) => {
    emit('workshops-save', data)
    console.log('Configuración de talleres guardada:', data)
}

// Manejar guardado de configuración de horarios
const handleTimeSave = (data: any) => {
    emit('time-save', data)
    console.log('Configuración de horarios guardada:', data)
}
</script> 