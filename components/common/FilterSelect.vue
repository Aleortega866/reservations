<template>
  <div>
    
    <label v-if="label" class="block font-semibold">{{ label }}</label>
    <div class="relative mt-1">
      <!-- Input principal de búsqueda -->
      <div class="relative">
        <Icon v-if="!props.modelValue && !searchQuery" icon="lucide:search" width="16" height="16" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input 
          :model-value="displayValue" 
          :placeholder="placeholder"
          :class="[
            'w-full cursor-pointer pr-10',
            (props.modelValue || searchQuery) ? 'pl-3' : 'pl-10'
          ]" 
          @click="toggleOptions" 
          @input="handleInput"
          readonly
        />
        <Icon icon="lucide:chevron-down" width="16" height="16" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" :class="{ 'rotate-180': showOptions }" />
      </div>

      <!-- Opciones que se expanden hacia abajo -->
      <div v-if="showOptions" class="absolute top-full left-0 right-0 z-50 mt-1">
        <!-- Input de búsqueda -->
        <div class="p-2 bg-background border border-muted rounded-t-md border-b-0">
          <Input 
            v-model="searchQuery"
            placeholder="Buscar..."
            class="w-full"
            @input="handleSearchInput"
          />
        </div>
        
        <!-- Lista de opciones filtradas -->
        <div class="max-h-60 overflow-y-auto bg-background border border-muted rounded-b-md shadow-lg">
          <!-- Indicador de resultados -->
          <div v-if="searchQuery && filteredOptions.length > 0" class="p-2 bg-muted/30 border-b border-muted">
            <span class="text-xs text-muted-foreground">
              {{ filteredOptions.length }} resultado{{ filteredOptions.length !== 1 ? 's' : '' }} encontrado{{ filteredOptions.length !== 1 ? 's' : '' }}
            </span>
          </div>
          
          <div 
            v-for="(option, index) in filteredOptions.slice(0, 20)" 
            :key="option.value"
            class="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            :class="index === Math.min(filteredOptions.length - 1, 19) ? 'rounded-b-md' : ''"
            @click="selectOption(option)"
          >
            <div class="flex items-center space-x-2">
              <span 
                class="text-sm text-muted-foreground"
                v-html="searchQuery ? highlightMatch(option.label, searchQuery) : option.label"
              ></span>
            </div>
          </div>

          <!-- Mensaje si hay más resultados -->
          <div v-if="filteredOptions.length > 20" class="p-2 bg-muted/30 border-t border-muted">
            <span class="text-xs text-muted-foreground text-center block">
              Mostrando 20 de {{ filteredOptions.length }} resultados. Refina tu búsqueda para ver más.
            </span>
          </div>

          <!-- Mensaje si no hay resultados -->
          <div v-if="filteredOptions.length === 0"
            class="p-3 bg-background rounded-b-md">
            <span class="text-sm text-muted-foreground text-center block">
              No se encontraron opciones
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/vue'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  label: string
  placeholder?: string
  options: Option[]
  autoOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar opción...',
  autoOpen: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchQuery = ref('')
const showOptions = ref(props.autoOpen)

// Computed para mostrar el valor seleccionado o la búsqueda
const displayValue = computed({
  get() {
    if (searchQuery.value) return searchQuery.value
    if (!props.modelValue) return ''
    const selectedOption = props.options.find(opt => opt.value === props.modelValue)
    return selectedOption ? selectedOption.label : props.modelValue
  },
  set(value: string) {
    // Esto se ejecuta cuando se escribe en el input
    searchQuery.value = value
    if (!showOptions.value) {
      showOptions.value = true
    }
  }
})

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(() => props.autoOpen, (newValue) => {
  showOptions.value = newValue
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase().trim()
  
  // Si la consulta está vacía después del trim, mostrar todas las opciones
  if (!query) return props.options
  
  return props.options
    .map(option => {
      const label = option.label.toLowerCase()
      let score = 0
      
      // Coincidencia exacta (máxima prioridad)
      if (label === query) {
        score = 1000
      }
      // Coincidencia al inicio del texto (alta prioridad)
      else if (label.startsWith(query)) {
        score = 500
      }
      // Coincidencia de palabras completas
      else if (label.includes(` ${query}`) || label.includes(`-${query}`) || label.includes(`_${query}`)) {
        score = 300
      }
      // Coincidencia parcial (baja prioridad)
      else if (label.includes(query)) {
        score = 100
      }
      // Coincidencia de caracteres consecutivos
      else {
        // Buscar caracteres consecutivos en cualquier orden
        const queryChars = query.split('')
        const labelChars = label.split('')
        let consecutiveMatches = 0
        let lastMatchIndex = -1
        
        for (const char of queryChars) {
          const charIndex = labelChars.findIndex((labelChar, index) => 
            labelChar === char && index > lastMatchIndex
          )
          if (charIndex !== -1) {
            consecutiveMatches++
            lastMatchIndex = charIndex
          }
        }
        
        if (consecutiveMatches >= query.length * 0.7) { // Al menos 70% de caracteres coinciden
          score = 50
        }
      }
      
      return { option, score }
    })
    .filter(item => item.score > 0) // Solo opciones con puntuación
    .sort((a, b) => b.score - a.score) // Ordenar por puntuación descendente
    .map(item => item.option)
})

const toggleOptions = () => {
  showOptions.value = !showOptions.value
  if (showOptions.value) {
    searchQuery.value = ''
  }
}

const selectOption = (option: Option) => {
  console.log('🎯 FilterSelect: Seleccionando opción:', option)
  console.log('🎯 FilterSelect: Emitiendo valor:', option.value)
  emit('update:modelValue', option.value)
  searchQuery.value = ''
  showOptions.value = false
}

const handleInput = (event: Event) => {
  // Como el input es readonly, esta función no se ejecutará al escribir
  // Pero la mantenemos por si acaso
  const target = event.target as HTMLInputElement
  console.log('Input event:', target.value)
}

const handleSearchInput = (event: Event) => {
  // Esto se ejecuta cuando se escribe en el input de búsqueda
  const target = event.target as HTMLInputElement
  console.log('Search input event:', target.value)
}

// Función para resaltar coincidencias en el texto
const highlightMatch = (text: string, query: string) => {
  if (!query) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// Cerrar opciones al hacer clic fuera
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showOptions.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 