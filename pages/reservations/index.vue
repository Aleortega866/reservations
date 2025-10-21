<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Desktop Navigation usando el componente reutilizable -->
      <ClientOnly>
        <DesktopNavigation
          title="Reservaciones"
          :show-new-reservation-button="true"
          :show-material-button="true"
          @new-reservation="handleNewReservation"
          @material-click="navigateToMaterialDidactico"
        />
      </ClientOnly>

      <div class="flex-1 flex flex-col">
        <ReservationHeader
          v-if="isMobile"
          class="lg:hidden"
          :current-screen="currentScreen"
          :title="getScreenTitle()"
          :show-back-button="false"
          @go-back="handleGoBack"
        />

        <!-- Pantallas modulares -->
        <div class="px-4 flex-1 pt-16 lg:pt-0">
          <!-- WelcomeHeader siempre visible -->
          <WelcomeHeader v-if="currentScreen === 'reservations'" />

          <EmptyReservationsScreen
            class="lg:hidden"
            v-if="currentScreen === 'reservations' && !hasReservations && !isLoading"
            :has-reservations="hasReservations"
            @new-reservation="handleNewReservation"
            @view-material="navigateToMaterialDidactico"
          />

          <!-- Mensaje principal -->
          <EmptyStateMessage
            v-if="!isLoading"
            class="lg:block hidden"
            :has-reservations="hasReservations"
          />

          <ReservationsListScreen
            v-if="currentScreen === 'reservations' && (hasReservations || isLoading)"
            :reservations="reservations"
            :is-loading="isLoading"
            @new-reservation="handleNewReservation"
            @view-details="viewReservationDetails"
            @view-material="navigateToMaterialDidactico"
          />

          <PendingReservationNotice
            v-if="currentScreen === 'reservations' && hasReservations && !isLoading"
          />

          <hr
            v-if="currentScreen === 'reservations' && hasReservations && !isLoading"
            class="w-10/12 border-t-2 border-[#B3B3B3] mx-auto my-8"
          />

          <LastVisit
            v-if="currentScreen === 'reservations' && hasReservations && !isLoading"
          />
        </div>
      </div>

      <!-- Bottom Navigation - Solo visible en móvil -->
      <div class="mt-10">
        <BottomNavigation :showReservationButton="false" @open-chat="handleChatClick" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onActivated, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useReservation } from "@/composables/reservations/useReservation";
import { useNavigation } from "@/composables/ui/useNavigation";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";
import { useReservationStoreCleanup } from "@/composables/utils/useStoreCleanup";

// Definir nombre del componente para keepalive
defineOptions({
  name: "reservations-index",
});

// Componentes
import ReservationHeader from "@/components/reservations/ReservationHeader.vue";
import WelcomeHeader from "@/components/reservations/screens/WelcomeHeader.vue";
import EmptyReservationsScreen from "@/components/reservations/screens/EmptyReservationsScreen.vue";
import ReservationsListScreen from "@/components/reservations/screens/ReservationsListScreen.vue";
import PendingReservationNotice from "@/components/reservations/PendingReservationNotice.vue";
import LastVisit from "@/components/reservations/LastVisit.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import DesktopNavigation from "@/components/app/DesktopNavigation.vue";
import EmptyStateMessage from "@/components/reservations/screens/EmptyStateMessage.vue";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";

// Router
const router = useRouter();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Device detection
const { isMobile } = useDevice();

// Lógica de navegación
const { currentScreen, getScreenTitle, goBack, navigateTo } = useNavigation();

// Lógica de reservaciones
const {
  hasReservations,
  reservations,
  viewReservationDetails,
  loadReservations,
  loadSchools,
  isLoading: isLoadingFromComposable,
} = useReservation();

// Estado de carga inicial
const initialLoading = ref(true);

// Estado de carga combinado
const isLoading = computed(() => initialLoading.value || isLoadingFromComposable.value);

// Composable para limpiar stores
const { clearAllStores } = useReservationStoreCleanup();

// Composable para limpieza automática al navegar
// NOTA: Solo limpia cuando SALES de /reservations, no cuando regresas
import { useAutoStoreCleanup } from "@/composables/utils/useAutoStoreCleanup";
useAutoStoreCleanup({
  cleanupRoutes: ["/profile", "/admin", "/notifications", "/auth/login", "/material"],
  preserveOnRoutes: ["/reservations/formulario-reservacion", "/reservations"],
});

// Función para cargar datos
const loadData = async () => {
  try {
    console.log("🔄 Cargando reservaciones...");
    await loadReservations();
    await loadSchools();
    console.log("✅ Reservaciones cargadas");
  } finally {
    // Desactivar el estado de carga inicial después de que termine la carga
    initialLoading.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  await loadData();
});

// Recargar datos cuando el componente se reactive desde keepalive
onActivated(async () => {
  console.log("🔄 Componente activado desde keepalive, recargando reservaciones...");
  await loadData();
});

// Funciones adicionales
const handleChatClick = () => {
  // Implementa la lógica para manejar el clic en el botón de chat
  console.log("Chat button clicked");
};

const handleNewReservation = () => {
  console.log("🆕 Iniciando nueva reservación - limpiando stores");

  // Limpiar completamente todos los stores antes de navegar
  clearAllStores();

  // Redirigir a la nueva página de flujo de reservación
  router.push("/reservations/formulario-reservacion");
};

const navigateToMaterialDidactico = () => {
  // Navegar a la nueva página de material didáctico
  // router.push('/reservations/material-didactico')
};

const handleGoBack = () => {
  // Regresar a la página anterior en el historial del navegador
  router.back();
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
