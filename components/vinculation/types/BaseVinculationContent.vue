<template>
  <div class="space-y-3">
    <!-- Botón de descarga con barra de progreso interna -->
    <div v-if="descargar" class="mb-4 p-4">
      <button 
        @click="handleDownload"
        :disabled="isDownloading"
        class="w-full flex items-center justify-center gap-2 py-3 text-white font-medium rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        style="background-color: #652F6C;"
        @mouseenter="$event.target.style.backgroundColor = '#5A2A61'"
        @mouseleave="$event.target.style.backgroundColor = '#652F6C'"
      >
        <!-- Barra de progreso interna -->
        <div 
          v-if="isDownloading && totalFiles > 0"
          class="absolute inset-0 transition-all duration-500 ease-out"
          :style="{ 
            width: `${(completedCount / totalFiles) * 100}%`,
            backgroundColor: '#8B4A91'
          }"
        ></div>
        
        <!-- Contenido del botón -->
        <div class="relative z-10 flex items-center justify-center gap-2">
          <span v-if="!isDownloading">Descargar</span>
          <span v-else-if="completedCount < totalFiles">
            MIDE - {{ completedCount }}/{{ totalFiles }} - {{ currentDownload?.name || 'Preparando...' }}
          </span>
          <span v-else>¡Completado!</span>
          
          <Icon 
            v-if="!isDownloading"
            icon="material-symbols:download" 
            class="w-5 h-5" 
          />
          <Icon 
            v-else-if="completedCount < totalFiles"
            icon="material-symbols:downloading" 
            class="w-5 h-5 animate-spin" 
          />
          <Icon 
            v-else
            icon="material-symbols:check-circle" 
            class="w-5 h-5 animate-bounce" 
          />
        </div>
      </button>
    </div>
    
    <!-- Contenido específico -->
    <div v-if="hasValidAgeGroups" class="space-y-3">
      <AgeGroupCard
        v-for="(ageGroup, index) in validAgeGroups"
        :key="ageGroup.groupCode || ageGroup.id"
        :age-group-id="ageGroup.groupCode || ageGroup.id"
        :age-group-name="ageGroup.ageGroupName || ageGroup.name"
        :is-selected="selectedAgeRange === (ageGroup.groupCode || ageGroup.id)"
        :is-expanded="ageGroup.expanded"
        :primary-economic-concepts="ageGroup.primaryEconomicConcepts || []"
        :secondary-economic-concepts="ageGroup.secondaryEconomicConcepts || []"
        :interest-topic-concepts="ageGroup.interestTopicConcepts || []"
        :materials="ageGroup.materials || []"
        :grades="ageGroup.grades || []"
        :loading="loading"
        :error="error"
        :selected-material="selectedItem"
        :expanded-materials="expandedItems || new Set()"
        :fully-expanded-materials="fullyExpandedItems || new Set()"
        :get-material-thumbnails="getMaterialThumbnailsSimplified"
        :get-material-types-count="getMaterialTypesCount"
        :get-material-duration="getMaterialDuration"
        :get-material-suggested-moment="getMaterialSuggestedMoment"
        :get-material-concept-info="getMaterialConceptInfo"
        :get-material-description="getMaterialDescription"
        :get-material-directed-to="getMaterialDirectedTo"
        :get-material-format="getMaterialFormat"
        :get-material-document-size="getMaterialDocumentSize"
        :get-thumbnail-icon="getThumbnailIcon"
        :is-academic="isAcademic"
        @toggle-expanded="toggleAgeGroup(index)"
        @select="selectAgeRange(ageGroup.groupCode || ageGroup.id)"
        @toggle-material-expanded="toggleMaterialExpanded"
        @select-material="selectMaterial"
        @expand-material-fully="expandMaterialFully"
        @collapse-material-fully="collapseMaterialFully"
        @view-material="viewMaterialSimplified"
        @download-material="downloadMaterialSimplified"
      />
    </div>
    <div v-else-if="!hasValidAgeGroups && !visitMenu" class="text-center py-8 text-gray-500">
      <p>{{ noMaterialsMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, toRaw, computed, onMounted } from "vue";
import { useVinculationState } from "@/composables/vinculation/useVinculationState";
import { useMaterialHelpers } from "@/composables/vinculation/useMaterialHelpers";
import { Icon } from "@iconify/vue";
import AgeGroupCard from "../components/AgeGroupCard.vue";
import JSZip from 'jszip';

// Props
const props = defineProps({
  contentConfig: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  // Props específicos para personalización
  isAcademic: {
    type: Boolean,
    default: false,
  },
  noMaterialsMessage: {
    type: String,
    default: "No hay materiales disponibles",
  },
  downloadLogMessage: {
    type: String,
    default: "Descargando contenido...",
  },
  visitMenu: {
    type: Boolean,
    default: false,
  },
  descargar: {
    type: Boolean,
    default: false,
  },  
});

// Emits
const emit = defineEmits(["select-material"]);

// Composables
const {
  expandedItems,
  fullyExpandedItems,
  selectedItem,
  toggleExpanded,
  expandFully,
  collapseFully,
  resetState
} = useVinculationState();

const {
  getMaterialInfo,
  getMaterialConcepts,
  getMaterialThumbnails,
  getMaterialDescription: getMaterialDescriptionFromHelper,
  downloadMaterial,
  viewMaterial
} = useMaterialHelpers();

// Estado del componente
const selectedAgeRange = ref("");
const data = reactive([]);

// Estado del gestor de descargas integrado
const isDownloading = ref(false);
const downloadQueue = ref([]);
const currentDownload = ref(null);

// Función para transformar academicLevels a ageGroups (solo para AcademicContent)
const transformAcademicLevelsToAgeGroups = (academicLevels) => {
  const ageGroups = [];
  
  academicLevels.forEach(level => {
    // Crear un ageGroup por nivel académico (levelDescription)
    const levelAgeGroup = {
      groupCode: level.level,
      ageGroupName: level.levelDescription, // "Secundaria", "Media Superior"
      level: level.level,
      levelDescription: level.levelDescription,
      // Agregar información de grados para acceso directo
      grades: level.grades.map(grade => ({
        academicLevelId: grade.academicLevelId,
        grade: grade.grade,
        gradeDescription: grade.gradeDescription,
        totalStudents: grade.totalStudents
      })),
      // Consolidar todos los conceptos económicos de todos los grados
      primaryEconomicConcepts: level.grades.flatMap(grade => 
        (grade.primaryEconomicConcepts || []).map(concept => ({
          ...concept,
          // Agregar información del grado al concepto
          gradeInfo: {
            academicLevelId: grade.academicLevelId,
            grade: grade.grade,
            gradeDescription: grade.gradeDescription,
            totalStudents: grade.totalStudents
          }
        }))
      ),
      secondaryEconomicConcepts: level.grades.flatMap(grade => 
        (grade.secondaryEconomicConcepts || []).map(concept => ({
          ...concept,
          gradeInfo: {
            academicLevelId: grade.academicLevelId,
            grade: grade.grade,
            gradeDescription: grade.gradeDescription,
            totalStudents: grade.totalStudents
          }
        }))
      ),
      interestTopicConcepts: level.grades.flatMap(grade => 
        (grade.interestTopicConcepts || []).map(concept => ({
          ...concept,
          gradeInfo: {
            academicLevelId: grade.academicLevelId,
            grade: grade.grade,
            gradeDescription: grade.gradeDescription,
            totalStudents: grade.totalStudents
          }
        }))
      ),
      materials: level.grades.flatMap(grade => grade.materials || []),
      expanded: false
    };
    
    ageGroups.push(levelAgeGroup);
  });
  
  return ageGroups;
};

// Inicializar data de manera segura para hidratación
const initializeData = () => {
  const rawData = toRaw(props.contentConfig.data) || {};
  
  // Verificar si es la estructura academicLevels (solo para AcademicContent)
  if (props.isAcademic && rawData.academicLevels && Array.isArray(rawData.academicLevels)) {
    const ageGroups = transformAcademicLevelsToAgeGroups(rawData.academicLevels);
    resetExpandedStates(ageGroups);
    Object.assign(data, ageGroups);
  } else {
    // Mantener compatibilidad con estructura anterior
    const newData = Array.isArray(rawData) ? rawData : [];
    resetExpandedStates(newData);
    Object.assign(data, newData);
  }
};

// Computed properties para filtrar grupos de edad válidos
const validAgeGroups = computed(() => {
  return data.filter(ageGroup => {
    // Lógica común para todos los tipos
    const hasPrimaryMaterials = ageGroup.primaryEconomicConcepts?.some(concept => 
      concept.materials && concept.materials.length > 0
    ) || false;
    
    const hasSecondaryMaterials = ageGroup.secondaryEconomicConcepts?.some(concept => 
      concept.materials && concept.materials.length > 0
    ) || false;
    
    const hasInterestTopicMaterials = ageGroup.interestTopicConcepts?.some(concept => 
      concept.materials && concept.materials.length > 0
    ) || false;
    
    const hasLegacyMaterials = ageGroup.materials && ageGroup.materials.length > 0;
    
    return hasPrimaryMaterials || hasSecondaryMaterials || hasInterestTopicMaterials || hasLegacyMaterials;
  });
});

const hasValidAgeGroups = computed(() => {
  return validAgeGroups.value.length > 0;
});

// Computed properties para el gestor de descargas
const totalFiles = computed(() => downloadQueue.value.length);
const completedCount = computed(() => 
  downloadQueue.value.filter(file => file.status === 'completed').length
);
const pendingCount = computed(() => 
  downloadQueue.value.filter(file => file.status === 'pending').length
);
const errorCount = computed(() => 
  downloadQueue.value.filter(file => file.status === 'error').length
);

// Funciones de utilidad
const resetExpandedStates = (dataArray) => {
  dataArray.forEach((item) => {
    // Solo resetear si no tiene estado previo
    if (item.expanded === undefined) {
      item.expanded = false;
    }
  });
};

const resetSelections = () => {
  selectedAgeRange.value = "";
  resetState();
};

// Funciones wrapper simplificadas
const getMaterialThumbnailsSimplified = getMaterialThumbnails;
const getMaterialDuration = (material) => getMaterialInfo(material).duration;
const getMaterialSuggestedMoment = (material) => getMaterialInfo(material).moment;
const getThumbnailIcon = (material) => getMaterialInfo(material).thumbnailIcon;
const getMaterialTypesCount = (material) => getMaterialInfo(material).typesCount;
const getMaterialConceptInfo = getMaterialConcepts;
const getMaterialDirectedTo = (material) => getMaterialInfo(material).directedTo;
const getMaterialFormat = (material) => getMaterialInfo(material).format;
const getMaterialDocumentSize = (material) => getMaterialInfo(material).size;
const getMaterialDescription = getMaterialDescriptionFromHelper;

// Funciones de interacción
const toggleAgeGroup = (index) => {
  data[index].expanded = !data[index].expanded;
};

const selectAgeRange = (ageGroupId) => {
  selectedAgeRange.value = ageGroupId;
};

const toggleMaterialExpanded = (ageGroupId, materialKey) => {
  toggleExpanded(materialKey);
};

const expandMaterialFully = (ageGroupId, materialKey) => {
  expandFully(materialKey);
};

const collapseMaterialFully = (ageGroupId, materialKey) => {
  collapseFully(materialKey);
};

const viewMaterialSimplified = viewMaterial;
const downloadMaterialSimplified = downloadMaterial;

const selectMaterial = (material) => {
  emit("select-material", material);
};

// Métodos del gestor de descargas integrado
const cancelDownloads = () => {
  isDownloading.value = false;
  currentDownload.value = null;
};

// Función para manejar la descarga
const handleDownload = async () => {
  console.log(props.downloadLogMessage);
  console.log("Datos disponibles:", data);
  console.log("Props contentConfig:", props.contentConfig);
  
  if (!data || !Array.isArray(data)) {
    console.warn("No hay datos disponibles para descargar");
    return;
  }

  // Recopilar todos los materialIds para descargar
  const materialIds = [];
  
  data.forEach(ageGroup => {
    // Procesar conceptos económicos primarios
    if (ageGroup.primaryEconomicConcepts) {
      ageGroup.primaryEconomicConcepts.forEach(concept => {
        if (concept.materials && Array.isArray(concept.materials)) {
          concept.materials.forEach(material => {
            if (material.materialId) {
              materialIds.push({
                materialId: material.materialId,
                name: material.materialName || 'Material'
              });
            }
          });
        }
      });
    }
    
    // Procesar conceptos económicos secundarios
    if (ageGroup.secondaryEconomicConcepts) {
      ageGroup.secondaryEconomicConcepts.forEach(concept => {
        if (concept.materials && Array.isArray(concept.materials)) {
          concept.materials.forEach(material => {
            if (material.materialId) {
              materialIds.push({
                materialId: material.materialId,
                name: material.materialName || 'Material'
              });
            }
          });
        }
      });
    }
    
    // Procesar conceptos de temas de interés
    if (ageGroup.interestTopicConcepts) {
      ageGroup.interestTopicConcepts.forEach(concept => {
        if (concept.materials && Array.isArray(concept.materials)) {
          concept.materials.forEach(material => {
            if (material.materialId) {
              materialIds.push({
                materialId: material.materialId,
                name: material.materialName || 'Material'
              });
            }
          });
        }
      });
    }
  });

  if (materialIds.length === 0) {
    console.warn("No se encontraron materiales para descargar");
    return;
  }

  // Iniciar descarga
  isDownloading.value = true;
  downloadQueue.value = materialIds.map(file => ({
    ...file,
    status: 'pending'
  }));
  
  try {
    // Crear instancia de JSZip
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const folderName = `MIDE_Materiales_${timestamp}`;
    
    // Descargar cada archivo y agregarlo al ZIP
    for (let i = 0; i < materialIds.length; i++) {
      if (!isDownloading.value) break; // Verificar si se canceló
      
      const { materialId, name } = materialIds[i];
      
      try {
        // Actualizar estado a "descargando"
        downloadQueue.value[i].status = 'downloading';
        currentDownload.value = { name, materialId };
        
        // Usar el endpoint correcto para descargar el PDF
        const endpoint = `https://api-mider-dev.buzzword.com.mx/api/ReservationDidacticMaterial/GetSheetsAndPostcardsPdf/${materialId}`;
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error(`Error descargando material ${materialId}:`, response.statusText);
          downloadQueue.value[i].status = 'error';
          continue;
        }
        
        const blob = await response.blob();
        
        // Agregar archivo al ZIP con nombre organizado
        const fileName = `${String(i + 1).padStart(2, '0')}_${name}.pdf`;
        zip.file(fileName, blob);
        
        // Marcar como completado
        downloadQueue.value[i].status = 'completed';
        
        // Espaciar las descargas por 500ms
        if (i < materialIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`Error descargando material ${materialId}:`, error);
        downloadQueue.value[i].status = 'error';
      }
    }
    
    // Generar y descargar el ZIP
    if (isDownloading.value) {
      currentDownload.value = { name: 'Generando archivo ZIP...', materialId: null };
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
  } catch (error) {
    console.error('Error generando ZIP:', error);
  }
  
  // Finalizar descarga
  isDownloading.value = false;
  currentDownload.value = null;
};

// Inicialización en el cliente
onMounted(() => {
  initializeData();
});

// Watchers
watch(
  () => props.contentConfig,
  (newConfig) => {
    initializeData();
    resetSelections();
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
/* Estilos base para todos los tipos de contenido */
</style>
