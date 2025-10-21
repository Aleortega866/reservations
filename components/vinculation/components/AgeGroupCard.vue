<template>
  <!-- Contenedor principal del grupo de edad -->
  <div class="border border-blue-100 shadow-sm mb-4" style="border-radius: 2rem; background-color: #E5ECF6;">
    <!-- Header del grupo de edad -->
    <div
      class="flex items-center justify-between p-4 cursor-pointer transition-all duration-300"
      :style="isExpanded ? 'border-top-left-radius: 2rem; border-top-right-radius: 2rem;' : 'border-radius: 2rem;'"
      @click="$emit('toggle-expanded')"
      :aria-expanded="isExpanded"
      role="button"
      tabindex="0"
      @keydown.enter="$emit('toggle-expanded')"
      @keydown.space.prevent="$emit('toggle-expanded')"
      @mouseenter="$event.target.style.backgroundColor = '#D1DDE8'"
      @mouseleave="$event.target.style.backgroundColor = '#E5ECF6'"
    >
      <!-- Texto del grupo de edad -->
      <div class="flex items-center">
        <span class="text-lg font-semibold text-gray-700">
          {{ ageGroupName }}
        </span>
      </div>
      
      <!-- Botón de colapso transparente -->
      <button
        class="flex items-center justify-center w-8 h-8 rounded-full bg-transparent hover:bg-transparent transition-all duration-300"
        @click.stop="$emit('toggle-expanded')"
        :aria-label="isExpanded ? 'Contraer grupo de edad' : 'Expandir grupo de edad'"
      >
        <Icon
          :icon="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          class="w-5 h-5 text-gray-600"
        />
      </button>
    </div>

    <!-- Contenido expandible del grupo -->
    <div
      v-show="isExpanded"
      class="p-4"
      style="border-bottom-left-radius: 2rem; border-bottom-right-radius: 2rem; background-color: #E5ECF6;"
      v-auto-animate="{ duration: 200, easing: 'ease-out' }"
    >
      <!-- Estados de carga y error -->
      <div v-if="loading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>
      <div v-else-if="error" class="text-center py-8 text-red-600">
        <p>{{ error }}</p>
      </div>
      <div
        v-else-if="!hasMaterials"
        class="text-center py-8 text-gray-500"
      >
        <p>No hay materiales disponibles para este grupo de edad</p>
      </div>

      <!-- Lista de materiales con diseño de categorías -->
      <div v-else-if="hasMaterials" class="space-y-3">
        <!-- Categoría Primarios -->
        <div v-if="primaryConceptsWithMaterials.length > 0" class="bg-white border border-gray-200 overflow-hidden" style="border-radius: 1.5rem;">
          <div 
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="togglePrimariosExpanded"
            role="button"
            tabindex="0"
            @keydown.enter="togglePrimariosExpanded"
            @keydown.space.prevent="togglePrimariosExpanded"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ isAcademic ? grades[0].gradeDescription : 'Conceptos económicos primarios' }}
                </h3>
                <div class="flex items-center">
                  <span class="text-sm text-gray-600">{{ primaryConceptsWithMaterials[0]?.conceptName || 'Exhibiciones vinculadas' }}</span>
                  <div class="flex items-center flex-1 mx-2">
                    <div
                      class="flex-1 border-t-2 border-dotted border-pink-300"
                      style="
                        border-image: repeating-linear-gradient(
                            to right,
                            #f1d5db 0,
                            #f1d5db 8px,
                            transparent 4px,
                            transparent 12px
                          )
                          1;
                      "
                    ></div>
                  </div>
                  <div
                    class="flex items-center justify-center w-10 h-10 border-2 border-yellow-400 rounded-full bg-white"
                  >
                    <span class="text-base font-semibold text-gray-700">{{ totalPrimaryMaterials }}</span>
                  </div>
                </div>
              </div>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2"
                :aria-label="isPrimariosExpanded ? 'Contraer primarios' : 'Expandir primarios'"
              >
                <Icon
                  :icon="isPrimariosExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
          <div 
            v-show="isPrimariosExpanded"
            class="p-3 border-t border-gray-100 bg-gray-50 space-y-3"
            v-auto-animate="{ duration: 200, easing: 'ease-out' }"
          >
            <!-- Conceptos primarios -->
            <div 
              v-for="(concept, conceptIndex) in primaryConceptsWithMaterials" 
              :key="`primary-${concept.conceptId}`"
              class="overflow-hidden"
              style="border-radius: 1rem;"
            >
              <MaterialCard
                v-for="(material, materialIndex) in concept.materials"
                :key="`primary-${concept.conceptId}-${material.materialId}`"
                :material="material"
                :is-fully-expanded="isMaterialFullyExpanded(`primary-${concept.conceptId}-${material.materialId}`)"
                @expand-fully="expandMaterialFully(`primary-${concept.conceptId}-${material.materialId}`)"
                @collapse-fully="collapseMaterialFully(`primary-${concept.conceptId}-${material.materialId}`)"
                @view="viewMaterial(material)"
                @download="downloadMaterial(material)"
              />
            </div>
          </div>
        </div>

        <!-- Categoría Secundarios -->
        <div v-if="secondaryConceptsWithMaterials.length > 0" class="bg-white border border-gray-200 overflow-hidden" style="border-radius: 1.5rem;">
          <div 
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleSecundariosExpanded"
            role="button"
            tabindex="0"
            @keydown.enter="toggleSecundariosExpanded"
            @keydown.space.prevent="toggleSecundariosExpanded"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  Conceptos económicos secundarios
                </h3>
                <div class="flex items-center">
                  <span class="text-sm text-gray-600">{{ secondaryConceptsWithMaterials[0]?.conceptName || 'Exhibiciones vinculadas' }}</span>
                  <div class="flex items-center flex-1 mx-2">
                    <div
                      class="flex-1 border-t-2 border-dotted border-pink-300"
                      style="
                        border-image: repeating-linear-gradient(
                            to right,
                            #f1d5db 0,
                            #f1d5db 8px,
                            transparent 4px,
                            transparent 12px
                          )
                          1;
                      "
                    ></div>
                  </div>
                  <div
                    class="flex items-center justify-center w-10 h-10 border-2 border-yellow-400 rounded-full bg-white"
                  >
                    <span class="text-base font-semibold text-gray-700">{{ totalSecondaryMaterials }}</span>
                  </div>
                </div>
              </div>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2"
                :aria-label="isSecundariosExpanded ? 'Contraer secundarios' : 'Expandir secundarios'"
              >
                <Icon
                  :icon="isSecundariosExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
          <div 
            v-show="isSecundariosExpanded"
            class="p-3 border-t border-gray-100 bg-gray-50 space-y-3"
            v-auto-animate="{ duration: 200, easing: 'ease-out' }"
          >
            <!-- Conceptos secundarios -->
            <div 
              v-for="(concept, conceptIndex) in secondaryConceptsWithMaterials" 
              :key="`secondary-${concept.conceptId}`"
              class="overflow-hidden"
              style="border-radius: 1rem;"
            >
              <MaterialCard
                v-for="(material, materialIndex) in concept.materials"
                :key="`secondary-${concept.conceptId}-${material.materialId}`"
                :material="material"
                :is-fully-expanded="isMaterialFullyExpanded(`secondary-${concept.conceptId}-${material.materialId}`)"
                @expand-fully="expandMaterialFully(`secondary-${concept.conceptId}-${material.materialId}`)"
                @collapse-fully="collapseMaterialFully(`secondary-${concept.conceptId}-${material.materialId}`)"
                @view="viewMaterial(material)"
                @download="downloadMaterial(material)"
              />
            </div>
          </div>
        </div>

        <!-- Categoría Temas de Interés (para tipo General) -->
        <div v-if="interestTopicConceptsWithMaterials.length > 0" class="bg-white border border-gray-200 overflow-hidden" style="border-radius: 1.5rem;">
          <div 
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleInterestTopicsExpanded"
            role="button"
            tabindex="0"
            @keydown.enter="toggleInterestTopicsExpanded"
            @keydown.space.prevent="toggleInterestTopicsExpanded"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  Temas de interés
                </h3>
                <div class="flex items-center">
                  <span class="text-sm text-gray-600">{{ interestTopicConceptsWithMaterials[0]?.conceptName || 'Exhibiciones vinculadas' }}</span>
                  <div class="flex items-center flex-1 mx-2">
                    <div
                      class="flex-1 border-t-2 border-dotted border-pink-300"
                      style="
                        border-image: repeating-linear-gradient(
                            to right,
                            #f1d5db 0,
                            #f1d5db 8px,
                            transparent 4px,
                            transparent 12px
                          )
                          1;
                      "
                    ></div>
                  </div>
                  <div
                    class="flex items-center justify-center w-10 h-10 border-2 border-yellow-400 rounded-full bg-white"
                  >
                    <span class="text-base font-semibold text-gray-700">{{ totalInterestTopicMaterials }}</span>
                  </div>
                </div>
              </div>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2"
                :aria-label="isInterestTopicsExpanded ? 'Contraer temas de interés' : 'Expandir temas de interés'"
              >
                <Icon
                  :icon="isInterestTopicsExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
          <div 
            v-show="isInterestTopicsExpanded"
            class="p-3 border-t border-gray-100 bg-gray-50 space-y-3"
            v-auto-animate="{ duration: 200, easing: 'ease-out' }"
          >
            <!-- Temas de interés -->
            <div 
              v-for="(concept, conceptIndex) in interestTopicConceptsWithMaterials" 
              :key="`interest-${concept.conceptId}`"
              class="overflow-hidden"
              style="border-radius: 1rem;"
            >
              <MaterialCard
                v-for="(material, materialIndex) in concept.materials"
                :key="`interest-${concept.conceptId}-${material.materialId}`"
                :material="material"
                :is-fully-expanded="isMaterialFullyExpanded(`interest-${concept.conceptId}-${material.materialId}`)"
                @expand-fully="expandMaterialFully(`interest-${concept.conceptId}-${material.materialId}`)"
                @collapse-fully="collapseMaterialFully(`interest-${concept.conceptId}-${material.materialId}`)"
                @view="viewMaterial(material)"
                @download="downloadMaterial(material)"
              />
  
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import MaterialCard from './MaterialCard.vue'
import { ref, computed, reactive } from 'vue'

// Props
const props = defineProps({
  ageGroupId: {
    type: String,
    required: true
  },
  ageGroupName: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  // Nueva estructura: conceptos económicos
  primaryEconomicConcepts: {
    type: Array,
    default: () => []
  },
  secondaryEconomicConcepts: {
    type: Array,
    default: () => []
  },
  // Para tipo General
  interestTopicConcepts: {
    type: Array,
    default: () => []
  },
  // Mantener compatibilidad con estructura anterior
  materials: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  selectedMaterial: {
    type: String,
    default: ''
  },
  expandedMaterials: {
    type: Set,
    required: true
  },
  fullyExpandedMaterials: {
    type: Set,
    required: true
  },
  isAcademic: {
    type: Boolean,
    default: false
  },
  grades: {
    type: Array,
    default: () => []
  },
})

// Estado reactivo para controlar la expansión de categorías - usando reactive para persistencia
const expansionState = reactive({
  isPrimariosExpanded: false,
  isSecundariosExpanded: false,
  isInterestTopicsExpanded: false,
  expandedConcepts: []
})

// Computed properties para acceso reactivo
const isPrimariosExpanded = computed(() => expansionState.isPrimariosExpanded)
const isSecundariosExpanded = computed(() => expansionState.isSecundariosExpanded)
const isInterestTopicsExpanded = computed(() => expansionState.isInterestTopicsExpanded)
const expandedConcepts = computed(() => expansionState.expandedConcepts)

// Computed properties para la nueva estructura
// Filtrar conceptos que tienen materiales
const primaryConceptsWithMaterials = computed(() => {
  return (props.primaryEconomicConcepts || []).filter(concept => concept.materials && concept.materials.length > 0)
})

const secondaryConceptsWithMaterials = computed(() => {
  return (props.secondaryEconomicConcepts || []).filter(concept => concept.materials && concept.materials.length > 0)
})

const interestTopicConceptsWithMaterials = computed(() => {
  return (props.interestTopicConcepts || []).filter(concept => concept.materials && concept.materials.length > 0)
})

const totalPrimaryMaterials = computed(() => {
  return primaryConceptsWithMaterials.value.reduce((total, concept) => total + concept.materials.length, 0)
})

const totalSecondaryMaterials = computed(() => {
  return secondaryConceptsWithMaterials.value.reduce((total, concept) => total + concept.materials.length, 0)
})

const totalInterestTopicMaterials = computed(() => {
  return interestTopicConceptsWithMaterials.value.reduce((total, concept) => total + concept.materials.length, 0)
})

// Verificar si hay materiales disponibles
const hasMaterials = computed(() => {
  return totalPrimaryMaterials.value > 0 || totalSecondaryMaterials.value > 0 || totalInterestTopicMaterials.value > 0
})

// Emits
const emit = defineEmits([
  'toggle-expanded',
  'expand-material-fully',
  'collapse-material-fully',
  'view-material',
  'download-material'
])

// Methods
const isMaterialFullyExpanded = (materialKey) => {
  return props.fullyExpandedMaterials.has(materialKey)
}

// Métodos para manejar expansión de conceptos
const isConceptExpanded = (conceptKey) => {
  return expansionState.expandedConcepts.includes(conceptKey)
}

const toggleConceptExpanded = (conceptKey) => {
  const index = expansionState.expandedConcepts.indexOf(conceptKey)
  if (index > -1) {
    expansionState.expandedConcepts.splice(index, 1)
  } else {
    expansionState.expandedConcepts.push(conceptKey)
  }
}

// Métodos para manejar expansión de categorías principales
const togglePrimariosExpanded = () => {
  expansionState.isPrimariosExpanded = !expansionState.isPrimariosExpanded
}

const toggleSecundariosExpanded = () => {
  expansionState.isSecundariosExpanded = !expansionState.isSecundariosExpanded
}

const toggleInterestTopicsExpanded = () => {
  expansionState.isInterestTopicsExpanded = !expansionState.isInterestTopicsExpanded
}


const expandMaterialFully = (materialKey) => {
  emit('expand-material-fully', props.ageGroupId, materialKey)
}

const collapseMaterialFully = (materialKey) => {
  emit('collapse-material-fully', props.ageGroupId, materialKey)
}

const viewMaterial = (material) => {
  emit('view-material', material)
}

const downloadMaterial = (material) => {
  emit('download-material', material)
}
</script>

