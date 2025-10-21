import { ref, computed } from 'vue'

export const useVinculationState = () => {
  // Estado compartido para expansión de elementos - usar arrays para evitar problemas de hidratación
  const expandedItems = ref<string[]>([])
  const fullyExpandedItems = ref<string[]>([])
  const selectedItem = ref<string>('')

  // Funciones para manejar expansión
  const toggleExpanded = (key: string) => {
    const index = expandedItems.value.indexOf(key)
    if (index > -1) {
      expandedItems.value.splice(index, 1)
      const fullIndex = fullyExpandedItems.value.indexOf(key)
      if (fullIndex > -1) {
        fullyExpandedItems.value.splice(fullIndex, 1)
      }
    } else {
      expandedItems.value.push(key)
    }
  }

  const expandFully = (key: string) => {
    if (!fullyExpandedItems.value.includes(key)) {
      fullyExpandedItems.value.push(key)
    }
  }

  const collapseFully = (key: string) => {
    const index = fullyExpandedItems.value.indexOf(key)
    if (index > -1) {
      fullyExpandedItems.value.splice(index, 1)
    }
  }

  const isExpanded = (key: string) => expandedItems.value.includes(key)
  const isFullyExpanded = (key: string) => fullyExpandedItems.value.includes(key)

  // Función para resetear todo el estado
  const resetState = () => {
    expandedItems.value = []
    fullyExpandedItems.value = []
    selectedItem.value = ''
  }

  // Función para seleccionar un elemento
  const selectItem = (key: string) => {
    selectedItem.value = key
  }

  return {
    // Estado - convertir a Set para compatibilidad con componentes existentes
    expandedItems: computed(() => new Set(expandedItems.value)),
    fullyExpandedItems: computed(() => new Set(fullyExpandedItems.value)),
    selectedItem: computed(() => selectedItem.value),
    
    // Acciones
    toggleExpanded,
    expandFully,
    collapseFully,
    isExpanded,
    isFullyExpanded,
    selectItem,
    resetState
  }
}
