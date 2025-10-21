<template>
  <div class="p-2">
    <div
      class="border border-gray-200 overflow-hidden pb-5"
      style="border-radius: 1.5rem; background-color: #e5ecf6"
    >
      <!-- Header del material -->
      <div 
        class="p-3 cursor-pointer transition-all duration-300 hover:bg-blue-100"
        @click="isFullyExpanded ? $emit('collapse-fully') : $emit('expand-fully')"
        @mouseenter="$event.target.style.backgroundColor = '#D1DDE8'"
        @mouseleave="$event.target.style.backgroundColor = '#E5ECF6'"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-900">
            {{ materialName }}
          </span>
          <button
            class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 transition-all duration-300"
            @click.stop="isFullyExpanded ? $emit('collapse-fully') : $emit('expand-fully')"
            :aria-label="isFullyExpanded ? 'Contraer material' : 'Expandir material'"
          >
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isFullyExpanded" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido del material -->
      <div class="p-5">
        <!-- Vista de miniaturas -->
        <div v-if="!isFullyExpanded" class="grid grid-cols-2 gap-3">
          <MaterialThumbnail
            v-for="(thumbnail, thumbIndex) in thumbnails"
            :key="thumbIndex"
            :material="material"
            :description="getThumbnailDescription(thumbnail)"
            @expand="$emit('expand-fully')"
          />
        </div>

        <!-- Vista expandida completa -->
        <MaterialExpandedView
          v-else
          :material="material"
          :material-types-count="materialTypesCount"
          :duration="duration"
          :suggested-moment="suggestedMoment"
          :concept-info="conceptInfo"
          :description="description"
          :directed-to="directedTo"
          :format="format"
          :document-size="documentSize"
          :thumbnail-icon="thumbnailIcon"
          @view="$emit('view')"
          @download="$emit('download')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import MaterialThumbnail from "./MaterialThumbnail.vue";
import MaterialExpandedView from "./MaterialExpandedView.vue";

// Props
const props = defineProps({
  material: {
    type: Object,
    required: true,
  },
  isFullyExpanded: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits([
  "expand-fully",
  "collapse-fully",
  "view",
  "download",
]);

// Computed properties para manejar diferentes tipos de materiales
const materialName = computed(() => {
  return (
    props.material.materialName ||
    props.material.fileName ||
    "Material sin nombre"
  );
});

const materialType = computed(() => {
  const format = props.material.documentFormat?.toLowerCase();
  if (format === "pdf") return "ficha";
  if (["mp4", "avi", "mov", "wmv"].includes(format)) return "video";
  if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(format))
    return "documento";
  return "material";
});

const thumbnails = computed(() => {
  // Para fichas y postales, generar thumbnails basados en el material
  if (materialType.value === "ficha") {
    return [props.material]; // Un thumbnail por ficha
  }
  // Para videos y documentos, generar thumbnails apropiados
  return [props.material];
});

const materialTypesCount = computed(() => {
  return 1; // Cada material individual tiene 1 tipo
});

const duration = computed(() => {
  if (props.material.durationMinutes) {
    return `${props.material.durationMinutes} minutos`;
  }
  return "No especificada";
});

const suggestedMoment = computed(() => {
  return props.material.consultationTime || "No especificado";
});

const conceptInfo = computed(() => {
  return props.material.linkedByData || "No especificado";
});

const description = computed(() => {
  return props.material.shortDescription || "Descripción del material";
});

const directedTo = computed(() => {
  return props.material.directedTo || "No especificado";
});

const format = computed(() => {
  return props.material.documentFormat?.toUpperCase() || "No especificado";
});

const documentSize = computed(() => {
  if (props.material.documentSize) {
    return `${props.material.documentSize} MB`;
  }
  return "No especificado";
});

const thumbnailIcon = computed(() => {
  const type = materialType.value;
  switch (type) {
    case "ficha":
      return "lucide:file-text";
    case "video":
      return "lucide:play-circle";
    case "documento":
      return "lucide:file";
    default:
      return "lucide:file";
  }
});

// Methods
const getThumbnailDescription = (thumbnail) => {
  return props.material.shortDescription || "Descripción del material";
};
</script>
