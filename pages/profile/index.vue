<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading/Verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido del perfil solo si está autenticado -->
    <div v-else-if="shouldShowContent" class="flex-1 bg-background">
      <!-- Contenido Principal -->
      <ProfileHeader
        :current-screen="currentScreen"
        :show-new-reservation-button="true"
        :show-material-button="true"
        :title="currentTitle"
        :show-back-button="true"
        @go-back="goBack"
      />

      <div class="max-w-full lg:max-w-2xl mx-auto pt-8">
        <!-- Pantalla Principal del Perfil -->
        <ProfileMain v-if="currentScreen === 'profile'" @navigate="navigateTo" />
      </div>
    </div>

    <!-- Bottom Navigation solo si está autenticado -->
    <BottomNavigation
      v-if="shouldShowContent"
      :showReservationButton="true"
      @open-chat="handleOpenChat"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUsers } from "@/composables/auth/useUsers";
import { useToast } from "@/composables/ui/useToast";
import { useBackupEmails } from "@/composables/utils/useBackupEmails";
import { useAutoStoreCleanup } from "@/composables/utils/useAutoStoreCleanup";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";
import ProfileHeader from "@/components/profile/ProfileHeader.vue";
import ProfileMain from "@/components/profile/ProfileMain.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";

// Router y Route
const router = useRouter();
const route = useRoute();

// Store y composables
const authStore = useAuthStore();
const { searchUserByEmail, isLoading: userLoading } = useUsers();
const { showError, showSuccess } = useToast();
const { addBackupEmail } = useBackupEmails();

// Guard de autenticación
const {
  isAuthenticated,
  hasValidToken,
  shouldShowLoading,
  shouldShowContent,
} = useAuthGuard();

// Limpieza automática de stores de reservaciones al entrar al perfil
useAutoStoreCleanup({
  cleanupRoutes: ["/reservations", "/profile"],
  preserveOnRoutes: ["/reservations/formulario-reservacion"],
});

// Estado de la pantalla actual
const currentScreen = ref("profile");
const activeTab = ref("profile");

// Título dinámico basado en la pantalla actual
const currentTitle = computed(() => {
  const titles = {
    profile: "Detalles de perfil",
    "personal-data": "Datos Personales",
    "contact-security": "Contacto y Seguridad",
    "reservations-data": "Datos de Reservaciones",
    "reservation-details": "Detalles de Reservación",
  };
  return titles[currentScreen.value] || "Mi Perfil";
});

// Función para navegar entre páginas del perfil
const navigateTo = (screen) => {
  // En lugar de cambiar el estado local, navegar a la página correspondiente
  switch (screen) {
    case "personal-data":
      router.push("/profile/personal-data");
      break;
    case "contact-security":
      router.push("/profile/contact-security");
      break;
    case "reservations-data":
      router.push("/profile/reservation-data");
      break;
    default:
      console.log("Pantalla no reconocida:", screen);
  }
};

// Función para regresar a la pantalla anterior
const goBack = () => {
  if (currentScreen.value === "profile") {
    // Si estamos en la pantalla principal del perfil, regresar a la página anterior
    router.push("/reservations");
  } else {
    // Si estamos en una subpantalla del perfil, regresar a la pantalla principal
    router.push("/profile");
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

// Cargar datos del usuario cuando se monta el componente
onMounted(() => {
  // Verificar si hay un parámetro de sección en la URL
  const sectionFromUrl = route.query.section;
  if (
    sectionFromUrl &&
    ["profile", "personal-data", "contact-security", "reservations-data"].includes(
      sectionFromUrl
    )
  ) {
    currentScreen.value = sectionFromUrl;
  }
});

// Observar cambios en el parámetro de sección de la URL
watch(
  () => route.query.section,
  (newSection) => {
    if (
      newSection &&
      ["profile", "personal-data", "contact-security", "reservations-data"].includes(
        newSection
      )
    ) {
      currentScreen.value = newSection;
    }
  }
);
</script>
