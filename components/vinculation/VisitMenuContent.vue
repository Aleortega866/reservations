<template>
  <div class="space-y-4">
    <!-- Estados de carga y error -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600">
      <Icon icon="lucide:alert-circle" class="w-16 h-16 mx-auto mb-4 text-red-400" />
      <h3 class="text-lg font-medium mb-2">Error al cargar menú de visita</h3>
      <p class="text-sm">{{ error }}</p>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="menuData && menuData.length > 0" class="space-y-4">
      <!-- Descripción del menú de visita -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Menú de visita asociado a tu reservación
        </h2>
        <div class="space-y-3 mb-6 text-gray-700">
          <p>
            Este menú te guiará a través de las exhibiciones del museo, organizadas por pisos y áreas temáticas.
          </p>
          <p>
            Cada exhibición incluye conceptos económicos, contenidos educativos y procesos de aprendizaje específicos.
          </p>
        </div>
      </div>
      
      <!-- Botón de descarga -->
      <div class="mb-4 p-4">
        <DownloadButton
          :disabled="isDownloading"
          :is-downloading="isDownloading"
          :show-progress="isDownloading"
          :total-files="totalFiles"
          :completed-count="completedCount"
          :current-download="currentDownload"
          @download="handleDownload"
        />
      </div>
      <!-- Pisos simplificados -->
      <div v-for="floor in getMenuDataGroupedByFloor" :key="floor.id" class="space-y-3">
        <!-- Piso -->
        <div 
          class="border border-blue-100 shadow-sm mb-4 rounded-3xl"
          style="background-color: #E5ECF6;"
        >
          <!-- Header del piso -->
          <div
            class="flex items-center justify-between p-4 cursor-pointer transition-all duration-300 rounded-3xl hover:bg-blue-100"
            @click="toggleFloor(floor.id)"
            :aria-expanded="expandedFloors.has(floor.id)"
            role="button"
            tabindex="0"
            @keydown.enter="toggleFloor(floor.id)"
            @keydown.space.prevent="toggleFloor(floor.id)"
          >
            <div class="flex items-center">
              <span class="text-lg font-semibold text-gray-700">
                {{ floor.name }}
              </span>
              <!-- <span class="text-sm text-gray-600 ml-2">
                ({{ floor.exhibitions.length }} exhibición{{ floor.exhibitions.length !== 1 ? 'es' : '' }})
              </span> -->
            </div>
            
            <button
              class="flex items-center justify-center w-8 h-8 bg-transparent border-0 rounded-md hover:bg-transparent transition-all duration-300"
              @click.stop="toggleFloor(floor.id)"
              :aria-label="expandedFloors.has(floor.id) ? 'Contraer piso' : 'Expandir piso'"
            >
              <Icon 
                :icon="expandedFloors.has(floor.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                class="w-4 h-4 text-pink-600"
              />
            </button>
          </div>

          <!-- Contenido expandible del piso -->
          <div
            v-show="expandedFloors.has(floor.id)"
            class="p-4 rounded-b-3xl"
            style="background-color: #E5ECF6;"
            v-auto-animate="{ duration: 200, easing: 'ease-out' }"
          >
            <div v-if="floor.exhibitions && floor.exhibitions.length > 0" class="space-y-3">
              <!-- Exhibiciones simplificadas -->
              <div 
                v-for="exhibition in floor.exhibitions" 
                :key="exhibition.id"
                class="bg-white border border-gray-200 rounded-2xl overflow-hidden"
              >
                <!-- Header de la exhibición -->
                <div 
                  class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  @click="toggleExhibition(exhibition.id)"
                  role="button"
                  tabindex="0"
                  @keydown.enter="toggleExhibition(exhibition.id)"
                  @keydown.space.prevent="toggleExhibition(exhibition.id)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h5 class="text-lg font-semibold text-gray-900 mb-1">
                        {{ exhibition.name }}
                      </h5>
                      <div class="flex items-center">
                        <span class="text-sm text-gray-600">{{ exhibition.ubicacion || 'Ubicación no especificada' }}</span>
                        <div class="flex items-center flex-1 mx-2">
                          <div class="flex-1 border-t-2 border-dotted border-pink-300"></div>
                        </div>
                        <div class="flex items-center justify-center w-10 h-10 border-2 border-yellow-400 rounded-full bg-white">
                          <span class="text-base font-semibold text-gray-700">{{ exhibition.thumbnails?.length || 0 }}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      class="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2 bg-transparent hover:bg-transparent"
                      :aria-label="expandedExhibitions.has(exhibition.id) ? 'Contraer exhibición' : 'Expandir exhibición'"
                    >
                      <Icon 
                        :icon="expandedExhibitions.has(exhibition.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                        class="w-4 h-4"
                      />
                    </button>
                  </div>
                </div>

                <!-- Contenido de la exhibición -->
                <div v-if="expandedExhibitions.has(exhibition.id)" class="p-4">
                  <div class="border border-gray-200 rounded-2xl overflow-hidden pb-5" style="background-color: #e5ecf6">
                    <!-- Header interno -->
                    <div 
                      class="p-3 cursor-pointer transition-all duration-300 hover:bg-blue-100"
                      @click="toggleExhibition(exhibition.id)"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">
                          {{ exhibition.name }}
                        </span>
                        <button
                          class="flex items-center justify-center w-6 h-6 bg-transparent border-0 rounded-md hover:bg-transparent transition-all duration-300"
                          @click.stop="toggleExhibition(exhibition.id)"
                          :aria-label="expandedExhibitions.has(exhibition.id) ? 'Contraer exhibición' : 'Expandir exhibición'"
                        >
                          <svg class="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="!expandedExhibitions.has(exhibition.id)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Contenido de thumbnails -->
                    <div class="p-5">
                      <!-- Vista de thumbnails dinámicos (colapsada) -->
                      <div v-if="!expandedThumbnail" class="grid grid-cols-3 gap-2">
                        <div 
                          v-for="thumbnail in exhibition.thumbnails" 
                          :key="thumbnail.id"
                          class="rounded-lg p-1 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
                          @click="expandThumbnail(exhibition.id, thumbnail.type)"
                        >
                          <div class="relative mb-1">
                            <img 
                              src="/assets/Caratula.png" 
                              :alt="thumbnail.name" 
                              class="mx-auto h-24 object-cover rounded-lg"
                            >
                          </div>
                          <p class="text-xs text-gray-600 text-center">
                            {{ thumbnail.name }}
                          </p>
                        </div>
                      </div>

                      <!-- Vista expandida completa -->
                      <div v-else class="space-y-4">
                        <div v-for="thumbnail in exhibition.thumbnails" :key="thumbnail.id" v-show="expandedThumbnail === `${exhibition.id}-${thumbnail.type}`" class="space-y-4">
                          <div class="relative">
                            <div
                              class="w-full h-48 rounded-lg flex items-center justify-center relative overflow-hidden"
                              :class="{
                                'bg-yellow-100': thumbnail.type === 'concepto',
                                'bg-green-100': thumbnail.type === 'contenidos',
                                'bg-blue-100': thumbnail.type === 'proceso'
                              }"
                            >
                              <div class="text-center">
                                <div class="text-2xl font-bold text-gray-700 mb-2">
                                  {{ exhibition.name }}
                                </div>
                                <div class="text-sm text-gray-600 mb-4 px-4">
                                  {{ exhibition.ubicacion }}
                                </div>
                                <div class="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                                  <Icon
                                    :icon="thumbnail.icon || {
                                      'concepto': 'lucide:lightbulb',
                                      'contenidos': 'lucide:book-open',
                                      'proceso': 'lucide:graduation-cap'
                                    }[thumbnail.type]"
                                    class="w-8 h-8 text-gray-500"
                                  />
                                </div>
                                <div class="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span class="text-white text-xs font-bold">e</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="space-y-3">
                            <div class="flex items-center justify-between">
                              <h4 class="font-semibold text-gray-900">
                                Información sobre {{ thumbnail.name.toLowerCase() }}
                              </h4>
                              <button
                                @click="toggleExhibition(exhibition.id)"
                                class="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-transparent hover:bg-transparent"
                                title="Cerrar vista expandida"
                                aria-label="Cerrar vista expandida"
                              >
                                <Icon icon="lucide:chevron-up" class="w-4 h-4" />
                              </button>
                            </div>
                            <div class="space-y-2 text-sm text-gray-600 leading-relaxed">
                              <p>
                                <strong>{{ thumbnail.name }}:</strong>
                                {{ thumbnail.content }}
                              </p>
                              <p>
                                <strong>Exhibición:</strong>
                                {{ exhibition.name }}
                              </p>
                              <p>
                                <strong>Ubicación:</strong>
                                {{ exhibition.ubicacion }}
                              </p>
                              <div v-if="thumbnail.enlace" class="mt-3">
                                <a 
                                  :href="thumbnail.enlace" 
                                  target="_blank" 
                                  class="w-full flex items-center justify-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  Descargar
                                  <Icon icon="lucide:download" class="w-4 h-4 ml-2" />
                                </a>
                              </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-12 text-gray-500">
      <Icon icon="lucide:map" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 class="text-lg font-medium mb-2">No hay menú de visita disponible</h3>
      <p class="text-sm">No se encontró información del menú para esta reservación</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useVisitMenu } from '@/composables/useVisitMenu'
import { useVisitMenuDownload } from '@/composables/vinculation/useVisitMenuDownload'
import DownloadButton from './DownloadButton.vue'

// Props
const props = defineProps({
  reservationId: {
    type: Number,
    required: true
  }
})

// Composables
const { 
  menuData, 
  loading, 
  error, 
  fetchVisitMenu, 
  getMenuDataGroupedByFloor 
} = useVisitMenu()

const {
  isDownloading,
  totalFiles,
  completedCount,
  currentDownload,
  handleDownload: handleDownloadBase
} = useVisitMenuDownload()

// Estado para expansión
const expandedFloors = ref(new Set())
const expandedExhibitions = ref(new Set())
const expandedThumbnail = ref('')

// Función para manejar la descarga
const handleDownload = async () => {
  await handleDownloadBase(getMenuDataGroupedByFloor.value)
}

// Funciones
const toggleFloor = (floorId) => {
  if (expandedFloors.value.has(floorId)) {
    expandedFloors.value.delete(floorId)
  } else {
    expandedFloors.value.add(floorId)
  }
}

const toggleExhibition = (exhibitionId) => {
  if (expandedExhibitions.value.has(exhibitionId)) {
    expandedExhibitions.value.delete(exhibitionId)
    // Limpiar thumbnail si estaba expandido para esta exhibición
    if (expandedThumbnail.value.startsWith(`${exhibitionId}-`)) {
      expandedThumbnail.value = ''
    }
  } else {
    expandedExhibitions.value.add(exhibitionId)
  }
}

const expandThumbnail = (exhibitionId, thumbnailType) => {
  expandedExhibitions.value.add(exhibitionId)
  expandedThumbnail.value = `${exhibitionId}-${thumbnailType}`
}


// Cargar datos
onMounted(async () => {
  if (props.reservationId) {
    await fetchVisitMenu(props.reservationId)
  }
})

// Watcher para cambios en reservationId
watch(() => props.reservationId, async (newId) => {
  if (newId) {
    await fetchVisitMenu(newId)
  }
})
</script>

<style scoped>
/* Estilos específicos del componente */
</style>