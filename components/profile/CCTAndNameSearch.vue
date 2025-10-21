<template>
  <div>
    <label class="block text-sm font-medium mb-2">Busca la Institución Educativa por CCT o Nombre</label>

         <div class="bg-secondary/20 rounded-2xl p-2 overflow-hidden">
             <div class="flex justify-between items-center mb-4 px-1 overflow-hidden">
         <label class="block text-sm font-medium text-card-foreground/70 mb-0">{{ label }}</label>
 
         <div class="flex items-center space-x-2">
           <!-- Botón para abrir/cerrar opciones -->
           <button 
             @click="toggleOptions"
             class="text-muted-foreground hover:text-foreground transition-colors p-1"
             type="button"
             :title="showOptions ? 'Cerrar opciones' : 'Abrir opciones'">
             <Icon v-if="showOptions" icon="mdi:chevron-down-up" class="w-4 h-4" />
             <Icon v-else icon="mdi:chevron-up-down" class="w-4 h-4" />
           </button>
         </div>
       </div>

      <div class="space-y-0 mt-1 overflow-hidden" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
                 <!-- Input principal de búsqueda que se expande -->
         <div class="relative text-sm h-10 overflow-hidden" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
           <Icon icon="lucide:search" width="16" height="16" class="absolute left-3 top-4 transform -translate-y-1/2 text-primary pointer-events-none" />
           <input 
             v-model="searchQuery" 
             :placeholder="placeholder" 
             :class="[
               'w-full rounded-full bg-white border-1 border-primary cursor-pointer px-10 !h-8',
               searchQuery ? 'bg-white' : ''
             ]" 
             @input="handleSearchInput" 
             @focus="handleInputFocus"
             @blur="handleInputBlur"
           />
           
           <!-- Botón de limpiar búsqueda -->
           <button 
             v-if="searchQuery.length > 0"
             @click="clearSearch"
             class="absolute right-3 top-4 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
             type="button">
             <Icon icon="mdi:close-circle" class="w-4 h-4" />
           </button>
         </div>

        <!-- Opciones que se expanden hacia abajo -->
        <div v-if="showOptions" class="space-y-0 overflow-hidden"
          v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
          <!-- Lista de opciones filtradas -->
          <div class="max-h-60 overflow-y-auto pt-2" v-auto-animate="{ duration: 100 }">
            <!-- Indicador de carga para búsqueda -->
            <div v-if="loadingSearch" class="p-3 text-center">
              <span class="text-sm text-muted-foreground">
                🔍 Buscando institución...
              </span>
            </div>
            
            <!-- Error en búsqueda -->
            <div v-else-if="searchError" class="p-3 text-center">
              <span class="text-sm text-destructive">
                ❌ {{ searchError }}
              </span>
            </div>
            
            <!-- Resultados de búsqueda -->
            <div v-else>
              <div v-for="(option, index) in filteredOptions" :key="option.value"
                class="p-1.5 border-0 border-t-1 border-secondary hover:bg-secondary/20 transition-colors"
                :class="index === filteredOptions.length - 1 ? 'rounded-b-md' : 'rounded-none'">
                <div class="flex  items-center space-x-2">
                  <Checkbox variant="secondary" v-if="multiple"
                    :model-value="selectedValuesArray.includes(option.value)"
                    @update:model-value="(checked: boolean | 'indeterminate') => { if (typeof checked === 'boolean') handleCheckboxChange(option.value, checked) }" />
                  <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground cursor-pointer"
                      :class="{ 'font-medium': !multiple && selectedValuesArray.includes(option.value) }"
                      @click.stop="toggleOption(option.value)">
                      {{ option.label }}
                    </span>
                    <span class="text-xs text-muted-foreground cursor-pointer">
                      {{ option.location }}
                    </span>
                    <span class="text-xs text-muted-foreground cursor-pointer">
                      {{ option.state }}, {{ option.municipality }}, {{ option.locality }}, {{ option.postalCode }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Mensaje si no hay resultados -->
              <div v-if="filteredOptions.length === 0 && searchQuery.length > 0" class="p-3 overflow-hidden">
                <span class="text-sm text-muted-foreground text-center block">
                  No se encontraron instituciones con esos criterios
                </span>
              </div>
              
                             <!-- Mensaje de instrucción -->
               <div v-else-if="filteredOptions.length === 0" class="p-3 overflow-hidden">
                 <span class="text-sm text-muted-foreground text-center block">
                   Ingresa el CCT o nombre de la institución para buscar
                 </span>
               </div>
             </div>
             
             <!-- Controles de paginación -->
             <div v-if="totalPages > 1" class="border-t border-secondary p-3">
               <div class="flex items-center justify-between">
                 <!-- Información de paginación -->
                 <div class="text-xs text-muted-foreground">
                   Página {{ currentPage }} de {{ totalPages }} ({{ totalRecords }} instituciones)
                 </div>
                 
                 <!-- Controles de navegación -->
                 <div class="flex items-center space-x-2">

                   
                   <!-- Botón página anterior -->
                   <Button 
                     variant="outline" 
                     size="sm" 
                     :disabled="currentPage <= 1"
                     @click="goToPreviousPage"
                     class="!px-2 !py-1 !h-7 text-xs">
                     <Icon icon="mdi:chevron-left" class="w-4 h-4" />
                   </Button>
                   
                                       <!-- Números de página con lógica inteligente -->
                    <!-- <div class="flex items-center space-x-1"> -->
                      <!-- 
                        LÓGICA INTELIGENTE DE PAGINACIÓN:
                        - Si hay ≤7 páginas: mostrar todas
                        - Si hay >7 páginas: mostrar páginas relevantes según la posición actual
                        - Siempre mostrar: primera página, última página, página actual y adyacentes
                        - Usar "..." para indicar páginas ocultas
                      -->
                      <!-- <template v-for="page in getVisiblePages()" :key="page">
                        <Button 
                          v-if="page !== '...'"
                          variant="outline" 
                          size="sm" 
                          :class="[
                            '!px-2 !py-1 !h-7 text-xs min-w-[28px]',
                            page === currentPage ? 'bg-primary text-primary-foreground border-primary' : ''
                          ]"
                          @click="goToPage(page)">
                          {{ page }}
                        </Button>
                        <span v-else class="text-xs text-muted-foreground px-1">
                          ...
                        </span>
                      </template> -->
                    <!-- </div> -->
                   
                   <!-- Botón página siguiente -->
                   <Button 
                     variant="outline" 
                     size="sm" 
                     :disabled="currentPage >= totalPages"
                     @click="goToNextPage"
                     class="!px-2 !py-1 !h-7 text-xs">
                     <Icon icon="mdi:chevron-right" class="w-4 h-4" />
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
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
  // Campos adicionales para manejar IDs duplicados
  originalId?: number
  originalCctId?: number
  originalCct?: string
  // Campos geográficos para mostrar en la UI
  state?: string
  municipality?: string
  locality?: string
  postalCode?: string
}

interface Props {
  modelValue: string[] | string
  label: string
  placeholder?: string
  options: Option[]
  autoOpen?: boolean
  multiple?: boolean
  // Parámetros adicionales para filtros
  stateId?: number
  municipalityId?: number | undefined
  localityId?: number | undefined
  postalCode?: string | undefined
  educationalControlTypeId?: number | undefined
  educationShiftId?: number | undefined
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Ingresa el CCT o nombre de la institución...',
  autoOpen: false,
  multiple: true,
  stateId: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: string[] | string]
}>()

const searchQuery = ref('')
const showOptions = ref(props.autoOpen)

// Estados para búsqueda
const loadingSearch = ref(false)
const searchError = ref<string | null>(null)
const searchResults = ref<Option[]>([])

// Estados para paginación
const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const pageSize = ref(50)

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

// Función para cargar instituciones con filtros actuales
const loadInstitutionsWithFilters = async (page = 1) => {
  try {
    loadingSearch.value = true
    searchError.value = null
    
    console.log('🔄 Cargando instituciones con filtros actuales... Página:', page)
    
    // Parámetros de filtro sin búsqueda de texto
    const filterParams: any = {
      stateId: props.stateId,
      pageNumber: page,
      pageSize: pageSize.value
    }
    
    // Agregar filtros adicionales si están disponibles
    if (props.municipalityId) filterParams.municipalityId = props.municipalityId
    if (props.localityId) filterParams.localityId = props.localityId
    if (props.postalCode) filterParams.postalCode = props.postalCode
    if (props.educationalControlTypeId) filterParams.educationalControlTypeId = props.educationalControlTypeId
    if (props.educationShiftId) filterParams.educationShiftId = props.educationShiftId
    
    console.log('🔍 Parámetros de filtro:', filterParams)
    
    const result = await getAllInstitutionCCT(filterParams)
    
    console.log('✅ Instituciones cargadas con filtros:', result)
    
    // La API devuelve un array, pero necesitamos extraer la información de paginación
    // del primer elemento si existe (según el ejemplo que mostraste)
    if (result.length > 0 && (result as any)[0].totalRecords !== undefined) {
      const firstResult = (result as any)[0]
      totalRecords.value = firstResult.totalRecords
      totalPages.value = firstResult.totalPages
      currentPage.value = page
    }
    
         // Transformar los resultados al formato esperado
     // SOLUCIÓN AL PROBLEMA DE IDs DUPLICADOS: Usar un identificador único compuesto
// PROBLEMA: La API devuelve instituciones con el mismo 'id' pero diferentes 'cctId' y 'cct'
// EJEMPLO: id: 46, cctId: 95, cct: "09DPR1633G" vs id: 46, cctId: 96, cct: "09DPR1638B"
// SOLUCIÓN: Crear un value único combinando id + cctId + cct para evitar conflictos
searchResults.value = result.map((institution: any) => ({
  value: `${institution.id}_${institution.cctId}_${institution.cct}`, // Identificador único compuesto
  label: institution.institutionName || 'Sin nombre',
  type: 'Institución Educativa',
  location: `CCT: ${institution.cct || 'N/A'}`,
  status: 'Registrada SEP',
  description: `Institución con CCT: ${institution.cct || 'N/A'}`,
  // Guardar los IDs originales para referencia
  originalId: institution.id,
  originalCctId: institution.cctId,
  originalCct: institution.cct,
  // Campos geográficos para la UI
  state: institution.state,
  municipality: institution.municipality,
  locality: institution.locality,
  postalCode: institution.postalCode
}))
    
    console.log('🔄 Resultados transformados:', searchResults.value)
    console.log('📊 Paginación:', { page: currentPage.value, totalPages: totalPages.value, totalRecords: totalRecords.value })
    
    // Mostrar opciones si hay resultados
    if (searchResults.value.length > 0) {
      showOptions.value = true
    }
    
  } catch (error) {
    console.error('❌ Error al cargar instituciones con filtros:', error)
    searchError.value = error instanceof Error ? error.message : 'Error al cargar instituciones'
    searchResults.value = []
  } finally {
    loadingSearch.value = false
  }
}

// Función para manejar el focus del input
const handleInputFocus = () => {
  console.log('🎯 Focus en input')
  
  // SOLUCIÓN AL PROBLEMA DE "ABRIR Y CERRAR RÁPIDAMENTE":
  // El problema ocurría porque el @click del contenedor principal interfería
  // con el @focus del input, causando que se abriera y cerrara rápidamente.
  
  // Usar setTimeout para evitar conflictos con otros eventos
  setTimeout(() => {
    // Evitar que se cierre si ya está abierto (previene el comportamiento extraño)
    if (!showOptions.value) {
      showOptions.value = true
      
      // Si no hay resultados de búsqueda, cargar instituciones con filtros actuales
      if (searchResults.value.length === 0) {
        console.log('✅ Cargando instituciones con filtros actuales al hacer focus')
        loadInstitutionsWithFilters()
      }
    }
  }, 10) // Pequeño delay para evitar conflictos
}

// Función para manejar el blur del input (cuando pierde focus)
const handleInputBlur = () => {
  console.log('🔴 Blur en input')
  
  // IMPORTANTE: NO cerrar las opciones automáticamente al perder focus
  // Solo se cerrarán cuando el usuario haga clic explícitamente en:
  // 1. El botón de cerrar (X) en el header
  // 2. El botón de toggle para cerrar
  // 3. O cuando se seleccione una opción en modo único (opcional)
  
  // Esto permite que el usuario pueda:
  // - Hacer clic en las opciones sin que se cierren
  // - Navegar por las páginas sin perder la vista
  // - Mantener las opciones abiertas mientras interactúa
}

// Función para ir a la página anterior
const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    loadInstitutionsWithFilters(currentPage.value - 1)
  }
}

// Función para ir a la página siguiente
const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    loadInstitutionsWithFilters(currentPage.value + 1)
  }
}

// Función para ir a una página específica
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    loadInstitutionsWithFilters(page)
  }
}

// Función para cambiar el tamaño de página
const changePageSize = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1 // Resetear a la primera página
  loadInstitutionsWithFilters(1)
}

// Función para obtener las páginas visibles con lógica inteligente
const getVisiblePages = () => {
  const pages: Array<number | '...'> = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    // Si hay 7 páginas o menos, mostrar todas
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Lógica inteligente para más de 7 páginas
    if (current <= 4) {
      // Estamos cerca del inicio: mostrar 1, 2, 3, 4, 5, ..., total
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // Estamos cerca del final: mostrar 1, ..., total-4, total-3, total-2, total-1, total
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Estamos en el medio: mostrar 1, ..., current-1, current, current+1, ..., total
      pages.push(1)
      pages.push('...')
      pages.push(current - 1)
      pages.push(current)
      pages.push(current + 1)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
}

// Función para limpiar la búsqueda manteniendo las opciones abiertas
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = null
  
  // Mantener las opciones abiertas y cargar instituciones con filtros actuales
  if (showOptions.value) {
    loadInstitutionsWithFilters(currentPage.value)
  }
}

// Función para cerrar las opciones solo cuando sea necesario
const closeOptions = () => {
  showOptions.value = false
}

// Función para abrir las opciones
const openOptions = () => {
  showOptions.value = true
  
  // Si no hay resultados, cargar instituciones con filtros actuales
  if (searchResults.value.length === 0) {
    loadInstitutionsWithFilters()
  }
}

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(() => props.autoOpen, (newValue) => {
  showOptions.value = newValue
})

// Watcher para mostrar opciones cuando se actualicen los filtros
watch(() => [props.stateId, props.municipalityId, props.localityId, props.postalCode, props.educationalControlTypeId, props.educationShiftId], () => {
  console.log('🔄 Filtros actualizados, cargando instituciones...')
  if (searchQuery.value.length === 0) {
    // Si no hay búsqueda activa, cargar instituciones con los filtros actuales
    // Resetear paginación cuando cambien los filtros
    currentPage.value = 1
    
    // Mantener las opciones abiertas cuando se actualicen los filtros
    if (!showOptions.value) {
      showOptions.value = true
    }
    
    loadInstitutionsWithFilters(1)
  }
}, { deep: true })

// Watcher para cargar instituciones iniciales cuando se monten los filtros
watch(() => props.stateId, (newStateId) => {
  if (newStateId && searchResults.value.length === 0) {
    console.log('🏁 Estado inicial configurado, cargando instituciones...')
    loadInstitutionsWithFilters()
  }
}, { immediate: true })

// Función para manejar la entrada de búsqueda
const handleSearchInput = async () => {
  if (searchQuery.value.length >= 3) {
    // Buscar después de 3 caracteres
    await performSearch()
  } else if (searchQuery.value.length === 0) {
    // Limpiar resultados de búsqueda pero mantener las opciones abiertas
    // y cargar instituciones con filtros actuales
    searchResults.value = []
    searchError.value = null
    
    // Si no hay búsqueda activa, cargar instituciones con filtros actuales
    // para mantener las opciones disponibles
    if (showOptions.value) {
      await loadInstitutionsWithFilters(currentPage.value)
    }
  }
}

// Función para realizar la búsqueda
const performSearch = async () => {
  try {
    loadingSearch.value = true
    searchError.value = null
    showOptions.value = true // Abrir opciones automáticamente
    
    // Resetear paginación para nueva búsqueda
    currentPage.value = 1
    
    console.log('🔍 Buscando institución:', searchQuery.value)
    
    // Determinar si es búsqueda por CCT o por nombre
    let searchParams: any = {
      stateId: props.stateId,
      pageNumber: 1,
      pageSize: pageSize.value
    }
    
    // Si parece ser un CCT (código alfanumérico de 10 caracteres)
    if (searchQuery.value.length === 10 && /^[A-Z0-9]+$/i.test(searchQuery.value)) {
      searchParams.cct = searchQuery.value.toUpperCase()
      console.log('📍 Detectado como CCT:', searchParams.cct)
    } else {
      // Búsqueda por nombre
      searchParams.institutionName = searchQuery.value
      console.log('📍 Detectado como nombre:', searchParams.institutionName)
    }
    
    // Agregar filtros adicionales si están disponibles
    if (props.municipalityId) searchParams.municipalityId = props.municipalityId
    if (props.localityId) searchParams.localityId = props.localityId
    if (props.postalCode) searchParams.postalCode = props.postalCode
    if (props.educationalControlTypeId) searchParams.educationalControlTypeId = props.educationalControlTypeId
    if (props.educationShiftId) searchParams.educationShiftId = props.educationShiftId
    
    console.log('🔍 Parámetros de búsqueda:', searchParams)
    
    const result = await getAllInstitutionCCT(searchParams)
    
    console.log('✅ Resultados de búsqueda:', result)
    
    // Actualizar información de paginación
    if (result.length > 0 && (result as any)[0].totalRecords !== undefined) {
      const firstResult = (result as any)[0]
      totalRecords.value = firstResult.totalRecords
      totalPages.value = firstResult.totalPages
    }
    
    // Transformar los resultados al formato esperado
    // SOLUCIÓN AL PROBLEMA DE IDs DUPLICADOS: Usar el mismo patrón que loadInstitutionsWithFilters
    searchResults.value = result.map((institution: any) => ({
      value: `${institution.id}_${institution.cctId}_${institution.cct}`, // Identificador único compuesto
      label: institution.institutionName || 'Sin nombre',
      type: 'Institución Educativa',
      location: `CCT: ${institution.cct || 'N/A'}`,
      description: `Institución con CCT: ${institution.cct || 'N/A'}`,
      // Guardar los IDs originales para referencia
      originalId: institution.id,
      originalCctId: institution.cctId,
      originalCct: institution.cct,
      // Campos geográficos para la UI
      state: institution.state,
      municipality: institution.municipality,
      locality: institution.locality,
      postalCode: institution.postalCode
    }))
    
    console.log('🔄 Resultados transformados:', searchResults.value)
    console.log('📊 Paginación de búsqueda:', { page: currentPage.value, totalPages: totalPages.value, totalRecords: totalRecords.value })
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error)
    searchError.value = error instanceof Error ? error.message : 'Error al buscar institución'
    searchResults.value = []
  } finally {
    loadingSearch.value = false
  }
}

const filteredOptions = computed(() => {
  // Mostrar resultados de búsqueda
  return searchResults.value
})

const toggleOptions = () => {
  console.log('🔄 Toggle options clicked, estado actual:', showOptions.value)
  
  // Si las opciones están cerradas, abrirlas
  if (!showOptions.value) {
    console.log('✅ Abriendo opciones...')
    showOptions.value = true
    
    // Si no hay resultados, cargar instituciones con filtros actuales
    if (searchResults.value.length === 0) {
      loadInstitutionsWithFilters()
    }
  } else {
    // Solo cerrar si el usuario hace clic explícitamente en el botón de toggle
    console.log('❌ Cerrando opciones...')
    showOptions.value = false
  }
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
    
    // En modo múltiple, mantener las opciones abiertas para permitir más selecciones
    // showOptions.value = true (ya está abierto)
  } else {
    // Para selección única, reemplazar el valor
    emit('update:modelValue', value)
    
    // Solo cerrar opciones si es selección única y el usuario lo desea
    // showOptions.value = false // Comentado para mantener abierto
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
  // Buscar en los resultados de búsqueda
  const searchOption = searchResults.value.find(opt => opt.value === value)
  if (searchOption) return searchOption.label
  
  // Buscar en las opciones normales como fallback
  const option = props.options.find(opt => opt.value === value)
  return option ? option.label : value
}

// Función para extraer el ID original de la institución desde el value compuesto
const extractOriginalId = (value: string): number | null => {
  const searchOption = searchResults.value.find(opt => opt.value === value)
  if (searchOption?.originalId) {
    return searchOption.originalId
  }
  
  // Fallback: intentar extraer del value compuesto
  const parts = value.split('_')
  if (parts.length >= 1) {
    const id = parseInt(parts[0])
    return isNaN(id) ? null : id
  }
  
  return null
}

const getOptionDetails = (value: string) => {
  // Buscar en los resultados de búsqueda
  const searchOption = searchResults.value.find(opt => opt.value === value)
  if (searchOption) {
    return {
      type: searchOption.type,
      location: searchOption.location,
      status: searchOption.status,
      description: searchOption.description
    }
  }
  
  // Buscar en las opciones normales como fallback
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

// Función para limpiar completamente el componente (llamada externa)
const clearAll = () => {
  console.log('🧹 CCTAndNameSearch - Limpiando todo el componente')
  
  // Limpiar búsqueda
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = null
  
  // Cerrar opciones
  showOptions.value = false
  
  // Resetear paginación
  currentPage.value = 1
  totalPages.value = 1
  totalRecords.value = 0
  
  console.log('✅ CCTAndNameSearch - Componente limpiado completamente')
}

// Exponer la función clearAll para uso externo
defineExpose({
  clearAll
})
</script>
