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
                        <p class="text-sm font-semibold">Formularios principales</p>
                        <Icon v-if="showOptions" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
                        <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            <!-- Opciones que se expanden hacia abajo -->
            <div v-if="showOptions" class="space-y-0" v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
                <!-- Lista de formularios -->
                <div class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
                    <div v-for="(formulario, index) in props.formularios" :key="formulario.id"
                        class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
                        :class="[
                            index === props.formularios.length - 1 ? 'rounded-b-md' : 'rounded-none',
                            index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
                        ]">
                        <div class="flex items-center justify-between space-x-4">
                            <div class="flex items-center space-x-4">
                                <!-- Switch por formulario -->
                                <Switch 
                                    :model-value="formulario.enable" 
                                    class="mr-2" 
                                    size="sm"
                                    @update:model-value="handleToggleEnable(formulario.id)"
                                    :disabled="!props.onToggleEnable"
                                />
                                <div class="flex flex-col">
                                    <span class="text-xs font-medium text-card-foreground/60">
                                        {{ formulario.description }}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Mensaje si no hay formularios -->
                    <div v-if="props.formularios.length === 0"
                        class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
                        <span class="text-sm text-muted-foreground text-center block">
                            No hay formularios disponibles
                        </span>
                    </div>
                </div>


            </div>
        </div>


    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Switch } from '@/components/ui/switch'
import { Icon } from '@iconify/vue'




interface Formulario {
    id: number
    description: string
    enable: boolean
}

interface Props {
    modelValue: number[] | number
    label?: string
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
}>()

const showOptions = ref(props.autoOpen)

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




</script> 