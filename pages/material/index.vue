<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Contenido Principal -->
      <MaterialHeader
        :current-screen="currentScreen"
        :title="currentTitle"
        :show-back-button="true"
        :show-more-button="true"
        @go-back="goBack"
      />

      <!-- Pantalla Principal del Perfil -->
      <MaterialMain
        v-if="currentScreen === 'profile'"
        @navigate="navigateTo"
        class="flex-1"
      />

      <BottomNavigation @open-chat="handleOpenChat" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";
import MaterialHeader from "@/components/material/MaterialHeader.vue";
import MaterialMain from "@/components/material/MaterialMain.vue";
import MobileNavigation from "@/components/profile/MobileNavigation.vue";
import ChatButton from "@/components/common/ChatButton.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";

// Router
const router = useRouter();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Estado de la pantalla actual
const currentScreen = ref("profile");
const activeTab = ref("profile");

// Título dinámico basado en la pantalla actual
const currentTitle = computed(() => {
  const titles = {
    material: "Material Didáctico",
    "material-visita": "Material Didáctico para mi visita",
  };
  return titles[currentScreen.value] || "Material Didáctico";
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
