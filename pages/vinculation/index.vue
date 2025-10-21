<template>
  <div class="h-screen flex flex-col bg-white">
    <!-- Desktop Navigation -->
    <DesktopNavigation
      v-if="!isMobile"
      title="Vinculación de mi visita"
      :show-new-reservation-button="false"
      :show-material-button="false"
    />

    <!-- Mobile Header -->
    <div v-if="isMobile" class="lg:hidden flex-shrink-0">
      <div class="flex items-center justify-between p-4 bg-white border-b">
        <Button variant="ghost" size="icon" @click="goBack">
          <Icon icon="lucide:arrow-left" class="w-5 h-5 text-purple-600" />
        </Button>
        <h1 class="text-lg font-semibold">Vinculación de mi visita</h1>
        <div class="w-9"></div>
      </div>
    </div>

    <!-- Toggle Group - Sticky -->
    <div class="sticky top-0 z-40 px-4 py-4 flex-shrink-1">
      <div class="max-w-4xl mx-auto">
        <ToggleGroup 
          v-model="activeTab" 
          type="single" 
          default-value="fichas"
          class="flex items-center justify-center rounded-full bg-gray-200 p-1 text-gray-500 w-full shadow-sm"
        >
          <ToggleGroupItem 
            value="fichas" 
            class="flex-1 flex items-center justify-center whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=off]:text-gray-500 hover:text-gray-700 data-[state=off]:bg-transparent"
          >
            Fichas y postales
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="menu" 
            class="flex-1 flex items-center justify-center whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=off]:text-gray-500 hover:text-gray-700 data-[state=off]:bg-transparent"
          >
            Menú de visita
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>

    <!-- Contenedor de contenido con scroll -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-4 pb-20 pt-6">
        <div class="max-w-4xl mx-auto">
          <!-- Contenido de Fichas y postales -->
          <div v-if="activeTab === 'fichas'" v-memo="[contentConfig, error, loading, reservationId]">
            <VinculationContent
              v-if="contentConfig && !error"
              :content-config="contentConfig"
              :loading="loading"
              :error="error"
              :reservation-id="reservationId"
              @edit-vinculation="editVinculation"
              @select-material="selectMaterial"
            />

            <!-- Estados de error y vacío -->
            <div v-else-if="error" class="text-center py-12 text-red-600">
              <Icon icon="lucide:alert-circle" class="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 class="text-lg font-medium mb-2">Error al cargar materiales</h3>
              <p class="text-sm">{{ error }}</p>
            </div>

            <div v-else-if="!loading && !error" class="text-center py-12 text-gray-500">
              <Icon icon="lucide:file-text" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 class="text-lg font-medium mb-2">Ingresa un ID de reservación</h3>
              <p class="text-sm">Para cargar los materiales de vinculación</p>
            </div>
          </div>

          <!-- Contenido de Menú de visita -->
          <div v-else-if="activeTab === 'menu'" v-memo="[reservationId, menuLoading, menuError]">
            <VisitMenuContent
              v-if="reservationId"
              :reservation-id="reservationId"
            />
            <div v-else class="text-center py-12 text-gray-500">
              <Icon icon="lucide:map" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 class="text-lg font-medium mb-2">Ingresa un ID de reservación</h3>
              <p class="text-sm">Para cargar el menú de visita</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation con Footer -->
    <BottomNavigation 
      :showReservationButton="true" 
      :showFooter="false" 
      :externalDownload="{
        showDownloadButton: showDownloadButton,
        downloadFunction: handleDownload
      }"
      @open-chat="handleOpenChat" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from "vue";
import { useRouter, useRoute } from "vue-router";

// Components - Lazy loading para componentes pesados
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import DesktopNavigation from "@/components/app/DesktopNavigation.vue";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Icon } from "@iconify/vue";

// Lazy loading para componentes de contenido
const VinculationContent = defineAsyncComponent(() => 
  import("@/components/vinculation/VinculationContent.vue")
);
const VisitMenuContent = defineAsyncComponent(() => 
  import("@/components/vinculation/VisitMenuContent.vue")
);

// Composables
import { useMaterials } from "@/composables/useMaterials";
import { useVisitMenu } from "@/composables/useVisitMenu";
import { useBreakpoints } from "@vueuse/core";

// API Configuration
import { API_ENDPOINTS, API_CONFIG } from "@/lib/api/core/config";

// Router
const router = useRouter();

// Device detection
const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
});
const isMobile = breakpoints.smaller("tablet");

// Composables
const {
  ageGroups,
  academicLevels,
  reservationType,
  loading,
  error,
  fetchMaterials: fetchMaterialsAPI,
  getAgeGroupsForComponent,
  getAcademicLevelsForComponent,
} = useMaterials();

// Composable para menú de visita
const {
  menuData,
  loading: menuLoading,
  error: menuError,
  fetchVisitMenu,
  getMenuDataGroupedByFloor
} = useVisitMenu();

// Estado reactivo simplificado
const activeTab = ref('fichas');
const showDownloadButton = ref(true);

// Obtener reservationId de la query string - ÚNICA FUENTE DE VERDAD
const route = useRoute();
const reservationId = computed(() => {
  const id = route.query.reservationId;
  return id ? Number(id) : null;
});

// Estado de carga optimizado
const isLoading = computed(() => loading.value || menuLoading.value);
const hasError = computed(() => error.value || menuError.value);

// Cache para evitar recálculos innecesarios
const contentConfigCache = ref(null);
const menuContentConfigCache = ref(null);

// Configuración de contenido optimizada con cache
const contentConfig = computed(() => {
  // Verificar si hay cambios en los datos
  const currentDataHash = `${ageGroups.value?.length || 0}-${academicLevels.value?.length || 0}-${error.value || ''}`;
  
  if (contentConfigCache.value?.hash === currentDataHash) {
    return contentConfigCache.value.config;
  }

  if (error.value || (!ageGroups.value?.length && !academicLevels.value?.length)) {
    contentConfigCache.value = { hash: currentDataHash, config: null };
    return null;
  }

  const hasAcademicLevels = academicLevels.value?.length > 0;
  const type = hasAcademicLevels ? 'academic' : (reservationType.value?.toLowerCase() || 'general');
  const data = hasAcademicLevels 
    ? { academicLevels: getAcademicLevelsForComponent() }
    : getAgeGroupsForComponent();

  const config = {
    type,
    title: "Fichas y postales asociados a tu reservación",
    description: [
      'Estos materiales fueron creados con el objetivo de vincular tu visita al museo, pueden servirte para "justificar" ante la SEP la relación con tus campos formativos.',
      "Además, te proporcionaremos material didáctico para antes y después de la visita que te servirá cómo material de apoyo con tus grupos.",
    ],
    data,
  };

  contentConfigCache.value = { hash: currentDataHash, config };
  return config;
});

// Configuración de contenido para menú de visita optimizada
const menuContentConfig = computed(() => {
  const currentDataHash = `${menuData.value?.length || 0}-${menuError.value || ''}`;
  
  if (menuContentConfigCache.value?.hash === currentDataHash) {
    return menuContentConfigCache.value.config;
  }

  if (menuError.value || !menuData.value?.length) {
    menuContentConfigCache.value = { hash: currentDataHash, config: null };
    return null;
  }

  const config = {
    type: 'menu',
    title: "Menú de visita asociado a tu reservación",
    description: [
      'Este menú te guiará a través de las exhibiciones del museo, organizadas por pisos y áreas temáticas.',
      "Cada exhibición incluye conceptos económicos, contenidos educativos y procesos de aprendizaje específicos.",
    ],
    data: getMenuDataGroupedByFloor.value,
  };

  menuContentConfigCache.value = { hash: currentDataHash, config };
  return config;
});
// Función para descargar automáticamente el PDF del menú de visita
const handleDownload = async () => {
  try {
    if (!reservationId.value) {
      console.error("Error: No se encontró reservationId en la URL");
      alert("Error: No se encontró ID de reservación en la URL.");
      return;
    }

    console.log("Descargando PDF para reservación:", reservationId.value);
    
    // Llamada homologada usando el endpoint de la configuración
    const response = await $fetch(API_ENDPOINTS.reservation.getVisitMenuPdf(reservationId.value), {
      method: 'GET',
      baseURL: API_CONFIG.baseURL,
      responseType: 'blob'
    });
    
    console.log("Respuesta de la API:", response);
    
    // Crear blob y descargar automáticamente
    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menu-visita-${reservationId.value}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log("PDF descargado exitosamente");
  } catch (error) {
    console.error("Error en la llamada a la API:", error);
    alert("Error al descargar el PDF. Verifica la consola para más detalles.");
  }
};

// Sistema de logging para monitorear llamadas API
const apiCallTracker = ref({
  materials: 0,
  menu: 0,
  total: 0,
  lastCall: null
});

const logApiCall = (type) => {
  apiCallTracker.value[type]++;
  apiCallTracker.value.total++;
  apiCallTracker.value.lastCall = { type, timestamp: new Date().toISOString() };
  console.log(`📊 API Call #${apiCallTracker.value.total} - ${type}: ${apiCallTracker.value[type]} llamadas`);
};

// Funciones simplificadas - solo se ejecutan cuando se cambia a la tab
const fetchMaterials = async () => {
  if (!reservationId.value) {
    console.log('🚫 No hay reservationId en la URL');
    return;
  }
  
  // Verificar si ya hay datos cargados para evitar llamadas duplicadas
  if (ageGroups.value?.length > 0 || academicLevels.value?.length > 0) {
    console.log('📦 Materiales ya cargados, evitando llamada duplicada');
    return;
  }
  
  console.log('🔄 Cargando materiales para reservación:', reservationId.value);
  
  try {
    logApiCall('materials');
    await fetchMaterialsAPI(reservationId.value);
    showDownloadButton.value = true;
    console.log('✅ Materiales cargados exitosamente');
  } catch (error) {
    console.error("Error al cargar materiales:", error);
    showDownloadButton.value = false;
  }
};

const fetchMenuData = async () => {
  if (!reservationId.value) {
    console.log('🚫 No hay reservationId en la URL');
    return;
  }
  
  // Verificar si ya hay datos cargados para evitar llamadas duplicadas
  if (menuData.value?.length > 0) {
    console.log('📦 Menú ya cargado, evitando llamada duplicada');
    return;
  }
  
  console.log('🔄 Cargando menú de visita para reservación:', reservationId.value);
  
  try {
    logApiCall('menu');
    await fetchVisitMenu(reservationId.value);
    console.log('✅ Menú cargado exitosamente');
  } catch (error) {
    console.error("Error al cargar menú de visita:", error);
  }
};

// Funciones optimizadas con debounce
const selectMaterial = (material) => {
  const url = material.url || material.documentLink;
  if (url) {
    // Abrir en nueva pestaña de forma optimizada
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  }
};

// Funciones de navegación optimizadas
const goBack = () => router.back();
const handleOpenChat = () => console.log("Open chat clicked");
const editVinculation = () => console.log("Edit vinculation clicked");

// Watcher para cambio de tabs - SOLO carga cuando se cambia a la tab
watch(activeTab, async (newTab) => {
  if (!reservationId.value) return;
  
  console.log(`🔄 Cambio a tab: ${newTab}`);
  
  if (newTab === 'fichas') {
    console.log('🔄 Cargando materiales para tab fichas');
    await fetchMaterials();
  } else if (newTab === 'menu') {
    console.log('🔄 Cargando menú para tab menú');
    await fetchMenuData();
  }
});

// Cargar datos automáticamente al montar el componente - SOLO para la tab activa (fichas por defecto)
onMounted(async () => {
  if (reservationId.value) {
    console.log('🚀 Inicializando con reservationId:', reservationId.value);
    console.log(`📋 Tab activa: ${activeTab.value}`);
    
    // Solo cargar datos para la tab activa (fichas por defecto)
    if (activeTab.value === 'fichas') {
      await fetchMaterials();
    }
    // NO cargar menú automáticamente - solo cuando se cambie a esa tab
  }
});

// Cleanup para liberar memoria
onUnmounted(() => {
  // Limpiar configs cache
  contentConfigCache.value = null;
  menuContentConfigCache.value = null;
  
  // Mostrar resumen de llamadas API
  console.log('📊 Resumen de llamadas API:', {
    materiales: apiCallTracker.value.materials,
    menu: apiCallTracker.value.menu,
    total: apiCallTracker.value.total,
    ultimaLlamada: apiCallTracker.value.lastCall
  });
  
  console.log('🧹 Cleanup completado - memoria liberada');
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
