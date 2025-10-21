<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Contenido Principal -->
    <MaterialHeader
      :current-screen="currentScreen"
      :title="currentTitle"
      :show-back-button="true"
      :show-more-button="true"
      @go-back="goBack"
    />

    <!-- Material específico de la visita -->
    <div v-if="isLoading" class="p-4 flex-1">
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span class="ml-2 text-sm text-muted-foreground">Cargando material...</span>
      </div>
    </div>

    <div v-else-if="visitMaterial" class="p-4 space-y-4 flex-1">
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <MaterialCard
          v-for="(material, idx) in visitMaterial.materials"
          :key="idx"
          :material="material"
          :index="idx"
        />
      </div>
    </div>

    <div v-else class="p-4 flex-1">
      <div class="text-center py-8">
        <p class="text-muted-foreground">No se encontró material para esta fecha.</p>
      </div>
    </div>

    <BottomNavigation @open-chat="handleOpenChat" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import MaterialHeader from "@/components/material/MaterialHeader.vue";
import MaterialMain from "@/components/material/MaterialMain.vue";
import MobileNavigation from "@/components/profile/MobileNavigation.vue";
import ChatButton from "@/components/common/ChatButton.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import MaterialCard from "@/components/material/MaterialCard.vue";

// Router y Route
const router = useRouter();
const route = useRoute();

// Estado de la pantalla actual
const currentScreen = ref("material-visita");
const activeTab = ref("profile");

// Estado para el material de la visita
const visitMaterial = ref(null);
const isLoading = ref(true);

// Obtener parámetros de la URL
const visitDate = computed(() => route.query.date);
const formattedDate = computed(() => route.query.formattedDate);

// Título dinámico basado en la pantalla actual
const currentTitle = computed(() => {
  return "Material Didáctico para mi visita";
});

// Simular obtención del material de la fecha específica
const fetchVisitMaterial = async () => {
  isLoading.value = true;

  try {
    // Simular llamada al API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Material simulado basado en la fecha
    visitMaterial.value = {
      date: visitDate.value,
      formattedDate: formattedDate.value,
      materials: [
        {
          type: "image",
          src: "https://via.placeholder.com/300x180.png?text=Material+Específico",
          title: "Material para mi visita",
          description: "Contenido personalizado para esta visita.",
        },
        {
          type: "image",
          src: "https://via.placeholder.com/300x180.png?text=Material+Específico",
          title: "Material para mi visita",
          description: "Contenido personalizado para esta visita.",
        },
        {
          type: "image",
          src: "https://via.placeholder.com/300x180.png?text=Material+Específico",
          title: "Material para mi visita",
          description: "Contenido personalizado para esta visita.",
        },
        {
          type: "video",
          src: "https://www.w3schools.com/html/mov_bbb.mp4",
          title: "Video de la visita",
          description: "Contenido multimedia específico.",
        },
        {
          type: "pdf",
          src: "/documentos/guia-visita.pdf",
          title: "Guía de la visita",
          description: "Documento PDF con información detallada.",
        },
        {
          type: "image",
          src: "https://via.placeholder.com/300x180.png?text=Recursos+Adicionales",
          title: "Recursos adicionales",
          description: "Material complementario para la visita.",
        },
        {
          type: "video",
          src: "https://www.w3schools.com/html/mov_bbb.mp4",
          title: "Video de la visita",
          description: "Contenido multimedia específico.",
        },
        {
          type: "video",
          src: "https://www.w3schools.com/html/mov_bbb.mp4",
          title: "Video de la visita",
          description: "Contenido multimedia específico.",
        },
      ],
    };
  } catch (error) {
    console.error("Error al obtener el material:", error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar material al montar el componente
onMounted(() => {
  if (visitDate.value) {
    fetchVisitMaterial();
  }
});

// Función para navegar entre pantallas del perfil
const navigateTo = (screen) => {
  currentScreen.value = screen;
};

// Función para regresar a la pantalla anterior
const goBack = () => {
  if (currentScreen.value === "profile") {
    // Si estamos en la pantalla principal del perfil, regresar a la página anterior
    router.back();
  } else {
    // Si estamos en una subpantalla del perfil, regresar a la pantalla principal
    currentScreen.value = "profile";
  }
};

// Manejar navegación principal (entre secciones)
const handleMainNavigation = (tab) => {
  activeTab.value = tab;
  currentScreen.value = "profile";

  // Aquí puedes agregar lógica para navegar a otras páginas
  if (tab === "reservations") {
    // Navegar a la página de reservaciones
    console.log("Navegando a reservaciones...");
  } else if (tab === "workshops") {
    // Navegar a la página de talleres
    console.log("Navegando a talleres...");
  }
};

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};
</script>
