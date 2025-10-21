<template>
  <div class="w-full">
    <div v-if="isMobile">
      <div
        class="flex flex-col py-0 px-2 border-b mb-6"
        :class="{ 'shadow-md': showShadow }"
      >
        <!-- Línea superior con iconos -->
        <div class="flex items-center justify-between mt-4 mb-2 px-0">
          <Button
            v-if="showBackButton"
            variant="ghost"
            size="icon"
            class="text-primary hover:text-white hover:bg-primary/90"
            @click="$emit('goBack')"
          >
            <Icon
              icon="ri:arrow-left-line"
              style="height: 25px !important; width: 25px !important"
            />
          </Button>

          <div v-else></div>

          <Button
            variant="ghost"
            size="icon"
            class="w-6 h-6 p-2 bg-primary text-white rounded-full hover:bg-primary/90"
            @click="toggleSidebar"
          >
            <Icon
              icon="tabler:dots"
              style="
                color: #fff !important;
                height: 18px !important;
                width: 18px !important;
              "
            />
          </Button>
        </div>

        <h1 class="text-lg font-semibold ps-1">{{ title }}</h1>
      </div>
    </div>
    <div v-else>
      <div
        class="w-full flex items-center justify-between py-4 px-6 bg-white"
        :class="{ 'shadow-sm': showShadow }"
      >
        <!-- Lado izquierdo: Título y botón de regreso -->
        <div class="flex items-center space-x-4">
          <Button
            v-if="showBackButton"
            variant="ghost"
            size="icon"
            class="text-primary hover:text-white hover:bg-primary/90"
            @click="$emit('goBack')"
          >
            <Icon
              icon="ri:arrow-left-line"
              style="height: 25px !important; width: 25px !important"
            />
          </Button>
          <h1 class="text-lg font-medium text-gray-800">{{ title }}</h1>
        </div>

        <!-- Lado derecho: Botones de navegación e iconos -->
        <div class="flex items-center space-x-6">
          <!-- Botones de navegación -->
          <div class="flex items-center space-x-4">
            <Button
              variant="ghost"
              @click="handleReservationsClick"
              class="text-gray-600 hover:text-white"
            >
              Reservaciones
            </Button>
            <Button
              variant="ghost"
              @click="handleMaterialClick"
              class="text-gray-600 hover:text-white"
            >
              Material Didáctico
            </Button>
            <Button
              class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full flex items-center space-x-2"
              @click="handleNewReservation"
            >
              <Icon icon="material-symbols:calendar-add-on-outline" class="w-5 h-5" />
              <span>Crear Nueva Reservación</span>
            </Button>
          </div>

          <!-- Iconos de notificación y menú -->
          <div class="flex items-center space-x-3">
            <div class="relative">
              <Button
                variant="ghost"
                size="icon"
                class="w-9 h-9 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                @click="goToNotifications"
              >
                <Icon
                  icon="iconamoon:notification"
                  style="
                    color: #fff !important;
                    height: 18px !important;
                    width: 18px !important;
                  "
                />
              </Button>

              <!-- Notification Counter Badge -->
              <div
                v-if="unreadCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
              >
                {{ unreadCount > 99 ? "99+" : unreadCount }}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              class="w-9 h-9 bg-primary text-white rounded-full hover:bg-primary/90"
              @click="toggleSidebar"
            >
              <Icon
                icon="tabler:dots"
                style="
                  color: #fff !important;
                  height: 18px !important;
                  width: 18px !important;
                "
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "vue-router";
import { useNotificationsWithSignalR } from "@/composables/notifications/useNotificationsWithSignalR";
import { onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
// Props
const props = defineProps({
  title: {
    type: String,
    default: "Mi Aplicación",
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
  showNewReservationButton: {
    type: Boolean,
    default: true,
  },
  showMaterialButton: {
    type: Boolean,
    default: false,
  },
  showShadow: {
    type: Boolean,
    default: true,
  },
});

// Device detection - useDevice is available globally from @nuxtjs/device
const { isMobile } = useDevice();

// ============================================================================
// NOTIFICATIONS COMPOSABLE
// ============================================================================

const { unreadCount, initialize, cleanup } = useNotificationsWithSignalR();

// Emits
const emit = defineEmits([
  "goBack",
  "new-reservation",
  "material-click",
  "custom-action",
  "go-to-notifications",
]);

// Composables
const { toggleSidebar } = useSidebar();
const router = useRouter();

// Funciones
const handleReservationsClick = () => {
  router.push("/reservations");
};

const handleNewReservation = () => {
  emit("new-reservation");
  router.push("/reservations/formulario-reservacion");
};

const handleMaterialClick = () => {
  emit("material-click");
  router.push("/material");
};

const goToNotifications = () => {
  emit("go-to-notifications");
  router.push("/notification");
};

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
  try {
    // Inicializar notificaciones con visitorId = 1 (en producción vendría del usuario autenticado)
    const visitorId = authStore.user.userId;
    await initialize(visitorId, true);
  } catch (err: unknown) {
    console.error("Error inicializando notificaciones en navegación:", err);
  }
});

onUnmounted(() => {
  cleanup();
});
</script>
