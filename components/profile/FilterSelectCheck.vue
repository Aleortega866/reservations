<template>
    <div>
        <label class="block text-sm font-medium mb-2">Busca la Institución Educativa que desees agregar</label>

        <div class="bg-secondary/20 rounded-2xl p-2 overflow-hidden" @click="toggleOptions">
            <div class="flex justify-between items-center mb-4 px-1 overflow-hidden">
                <label class="block text-sm font-medium text-card-foreground/70 mb-0">{{ label }}</label>

                <Icon v-if="showOptions" icon="mdi:chevron-down-up"
                    class="w-4 h-4 text-card-foreground/70 pointer-events-none" />
                <Icon v-else icon="mdi:chevron-up-down"
                    class="w-4 h-4 text-card-foreground/70 pointer-events-none" />
            </div>

            <div class="space-y-0 mt-1 overflow-hidden" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
                <!-- Input principal de búsqueda que se expande -->
                <div class="relative text-sm h-10 overflow-hidden" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
                    <Icon icon="lucide:search" width="16" height="16" class="absolute left-3 top-4 transform -translate-y-1/2 text-primary pointer-events-none" />
                    <input v-model="searchQuery" :placeholder="placeholder" :class="[
                        'w-full rounded-full bg-white border-1 border-primary cursor-pointer px-10 !h-8',
                        searchQuery ? 'bg-white' : ''
                    ]" @input="handleSearchInput" />

                </div>

                <!-- Opciones que se expanden hacia abajo -->
                <div v-if="showOptions" class="space-y-0 overflow-hidden"
                    v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
                    <!-- Lista de opciones filtradas -->
                    <div class="max-h-60 overflow-y-auto pt-2" v-auto-animate="{ duration: 100 }">
                        <!-- Indicador de carga para búsqueda CCT -->
                        <div v-if="loadingCCT" class="p-3 text-center">
                            <span class="text-sm text-muted-foreground">
                                🔍 Buscando institución por CCT...
                            </span>
                        </div>
                        
                        <!-- Error en búsqueda CCT -->
                        <div v-else-if="cctError" class="p-3 text-center">
                            <span class="text-sm text-destructive">
                                ❌ {{ cctError }}
                            </span>
                        </div>
                        
                        <!-- Resultados de búsqueda -->
                        <div v-else>
                            <div v-for="(option, index) in filteredOptions" :key="option.value"
                                class="p-1.5 border-0 border-t-1 border-secondary hover:bg-secondary/20 transition-colors"
                                :class="index === filteredOptions.length - 1 ? 'rounded-b-md' : 'rounded-none'">
                                <div class="flex items-center space-x-2">
                                    <Checkbox variant="secondary" v-if="multiple"
                                        :model-value="selectedValuesArray.includes(option.value)"
                                        @update:model-value="(checked: boolean | 'indeterminate') => { if (typeof checked === 'boolean') handleCheckboxChange(option.value, checked) }" />
                                        <span class="text-sm text-muted-foreground cursor-pointer"
                                            :class="{ 'font-medium': !multiple && selectedValuesArray.includes(option.value) }"
                                            @click.stop="toggleOption(option.value)">
                                            {{ option.label }}
                                        </span>
                                        <span class="text-sm text-muted-foreground cursor-pointer">
                                            {{ option.location }}
                                        </span>
                                </div>
                            </div>

                            <!-- Mensaje si no hay resultados -->
                            <div v-if="filteredOptions.length === 0" class="p-3 overflow-hidden">
                                <span class="text-sm text-muted-foreground text-center block">
                                    No se encontraron opciones
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Tarjetas de opciones seleccionadas -->
        <div v-if="selectedValuesArray.length > 0" class="space-y-2 mt-3" v-auto-animate="{ duration: 200 }">
            <label class="block text-sm font-medium text-muted-foreground">
                {{ multiple ? 'Instituciones Educativas por agregar' : 'Institución Educativa por agregar' }}
            </label>
            <div v-for="value in selectedValuesArray" :key="value" class="grid grid-cols-12 items-center gap-3 p-2">
                <!-- Información adicional de la institución -->
                <div
                    class="flex items-center text-xs px-3 py-3 bg-secondary/40 rounded-full border col-span-10 overflow-hidden">
                    <div v-if="getOptionDetails(value)">
                        <div class="font-medium truncate max-w-[90%]">
                            <span class="text-xs">
                                {{ getOptionLabel(value) }},
                            </span>
                            <span class="text-xs text-muted-foreground">
                                {{ getOptionDetails(value)?.location }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="text-xs text-muted-foreground">
                        Información adicional no disponible
                    </div>
                </div>
                <div class="col-span-2 flex items-center justify-center">
                    <Button v-if="multiple" variant="ghost" size="icon"
                        class="!p-0 !w-8 !h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-colors"
                        @click.stop="removeOption(value)">
                        <Icon icon="tdesign:delete-1" style="color: #fff; width: 20px; height: 20px;" />
                    </Button>
                </div>
            </div>
            <InfoAlert
                message="Por favor, confirma que las instituciones que vas a agregar sean correctas antes de guardar la información"
                class="mb-0" />

            <Button variant="secondary" class="w-full mt-8">
                Guardar
            </Button>
        </div>
    </div>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import InfoAlert from '@/components/common/InfoAlert.vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Icon } from '@iconify/vue'
import { useInstitutions } from '@/composables/catalog/useInstitutions'

interface Option {
    value: string
    label: string
    type?: string
    location?: string
    status?: string
    description?: string
}

interface Props {
    modelValue: string[] | string
    label: string
    placeholder?: string
    options: Option[]
    autoOpen?: boolean
    multiple?: boolean
    enableCCTSearch?: boolean // Nueva prop para habilitar búsqueda CCT
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Buscar opciones...',
    autoOpen: false,
    multiple: true,
    enableCCTSearch: true // Habilitado por defecto
})

const emit = defineEmits<{
    'update:modelValue': [value: string[] | string]
}>()

const searchQuery = ref('')
const showOptions = ref(props.autoOpen)

// Estados para búsqueda CCT
const loadingCCT = ref(false)
const cctError = ref<string | null>(null)
const cctSearchResults = ref<Option[]>([])

// Composable para instituciones
const { getAllInstitutionCCT } = useInstitutions()

// Computed para obtener el array de valores seleccionados
const selectedValuesArray = computed(() => {
    if (props.multiple) {
        return Array.isArray(props.modelValue) ? props.modelValue : []
    } else {
        const value = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
        return value ? [value] : []
    }
})

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(() => props.autoOpen, (newValue) => {
    showOptions.value = newValue
})

// Función para manejar la entrada de búsqueda
const handleSearchInput = async () => {
    // Verificar si la búsqueda CCT está habilitada y el query tiene exactamente 10 caracteres
    if (props.enableCCTSearch && searchQuery.value.length === 10) {
        // Verificar si parece ser un CCT (código alfanumérico)
        if (/^[A-Z0-9]+$/i.test(searchQuery.value)) {
            console.log('🔍 Detectado CCT de 10 caracteres:', searchQuery.value)
            await searchByCCT(searchQuery.value.toUpperCase())
        }
    } else {
        // Limpiar resultados de búsqueda CCT si no es un CCT válido
        cctSearchResults.value = []
        cctError.value = null
    }
}

// Función para buscar por CCT
const searchByCCT = async (cct: string) => {
    try {
        loadingCCT.value = true
        cctError.value = null
        showOptions.value = true // Abrir opciones automáticamente
        
        console.log('🔍 Buscando institución por CCT:', cct)
        
        // Parámetros para la búsqueda CCT
        const cctParams = {
            stateId: 1, // Valor por defecto - podría ser configurable
            pageNumber: 1,
            pageSize: 10,
            cct: cct
        }
        
        const result = await getAllInstitutionCCT(cctParams)
        
        console.log('✅ Resultados de búsqueda CCT:', result)
        
        // Transformar los resultados al formato esperado
        cctSearchResults.value = result.map((institution: any) => ({
            value: institution.id?.toString() || '',
            label: institution.institutionName || 'Sin nombre',
            type: 'Institución Educativa',
            location: `CCT: ${institution.cct || 'N/A'}`,
            status: 'Registrada SEP',
            description: `Institución con CCT: ${institution.cct || 'N/A'}`
        }))
        
        console.log('🔄 Resultados transformados:', cctSearchResults.value)
        
    } catch (error) {
        console.error('❌ Error en búsqueda CCT:', error)
        cctError.value = error instanceof Error ? error.message : 'Error al buscar institución por CCT'
        cctSearchResults.value = []
    } finally {
        loadingCCT.value = false
    }
}

const filteredOptions = computed(() => {
    // Si hay resultados de búsqueda CCT, mostrarlos
    if (cctSearchResults.value.length > 0) {
        return cctSearchResults.value
    }
    
    // Si no hay resultados de búsqueda CCT, usar el filtrado normal
    if (!searchQuery.value) return props.options
    return props.options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const toggleOptions = () => {
    showOptions.value = !showOptions.value
}

const toggleOption = (value: string) => {
    if (props.multiple) {
        const newValues = [...selectedValuesArray.value]
        const index = newValues.indexOf(value)

        if (index > -1) {
            newValues.splice(index, 1)
        } else {
            newValues.push(value)
        }

        // Emitir directamente el nuevo valor
        emit('update:modelValue', newValues)
    } else {
        // Para selección única, simplemente reemplazar el valor
        emit('update:modelValue', value)
        showOptions.value = false // Cerrar opciones después de seleccionar
    }
}

const removeOption = (value: string) => {
    if (props.multiple) {
        const newValues = selectedValuesArray.value.filter(v => v !== value)
        emit('update:modelValue', newValues)
    } else {
        emit('update:modelValue', '')
    }
}

const getOptionLabel = (value: string) => {
    // Buscar primero en los resultados de CCT
    const cctOption = cctSearchResults.value.find(opt => opt.value === value)
    if (cctOption) return cctOption.label
    
    // Buscar en las opciones normales
    const option = props.options.find(opt => opt.value === value)
    return option ? option.label : value
}

const getOptionDetails = (value: string) => {
    // Buscar primero en los resultados de CCT
    const cctOption = cctSearchResults.value.find(opt => opt.value === value)
    if (cctOption) {
        return {
            type: cctOption.type,
            location: cctOption.location,
            status: cctOption.status,
            description: cctOption.description
        }
    }
    
    // Buscar en las opciones normales
    const option = props.options.find(opt => opt.value === value)
    if (!option) return null

    return {
        type: option.type,
        location: option.location,
        status: option.status,
        description: option.description
    }
}

const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
        // Agregar valor
        const newValues = [...selectedValuesArray.value, value]
        emit('update:modelValue', newValues)
    } else {
        // Remover valor
        const newValues = selectedValuesArray.value.filter(v => v !== value)
        emit('update:modelValue', newValues)
    }
}

</script>