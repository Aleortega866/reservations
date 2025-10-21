<template>
  <div class="w-full">
    <template v-if="isMobile">
      <div class="relative border-b-0 shadow-lg mb-6">
        <div class="grid grid-cols-3 gap-4 pt-8 pb-4 px-2">
          <!-- Botón de retroceso (posición absoluta izquierda) -->
          <div class="flex justify-start">
            <Button
              v-if="showBackButton"
              variant="ghost"
              size="icon"
              class="text-primary z-10"
              @click="$emit('goBack')"
            >
              <Icon
                icon="ri:arrow-left-line"
                class="text-primary"
                style="height: 25px !important; width: 25px !important"
              />
            </Button>
          </div>

          <!-- Logo centrado -->
          <div class="flex justify-center mb-3">
            <img src="/assets/logo-header.svg" alt="logo" class="w-20 h-auto" />
          </div>

          <div class="flex justify-end">
            <!-- Botón de menú (posición absoluta derecha) -->
            <Button
              variant="ghost"
              size="icon"
              class="w-6 h-6 p-2 bg-primary text-white rounded-full z-10"
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

        <!-- Título centrado -->
        <h1 class="text-xl font-semibold text-start ps-2 pb-2">{{ title }}</h1>
      </div>
    </template>
    <template v-else>
      <div class="w-full flex items-center justify-between py-4 px-6 bg-white shadow-sm">
        <!-- Lado izquierdo: Título y botón de regreso -->
        <div class="flex items-center space-x-4 flex-shrink-0">
          <Button
            v-if="showBackButton"
            variant="ghost"
            size="icon"
            class="text-primary hover:text-white hover:bg-primary/90 flex-shrink-0"
            @click="$emit('goBack')"
          >
            <Icon
              icon="ri:arrow-left-line"
              style="height: 25px !important; width: 25px !important"
            />
          </Button>
          <h1 class="text-lg font-medium text-gray-800 whitespace-nowrap flex-shrink-0">
            {{ title }}
          </h1>
        </div>

        <!-- Lado derecho: Botones de navegación e iconos -->
        <div class="flex items-center space-x-6 flex-shrink-0">
          <!-- Botones de navegación -->
          <div class="flex items-center space-x-4">
            <Button
              v-if="showNewReservationButton"
              variant="ghost"
              @click="handleNewReservation"
              class="text-gray-600 hover:text-primary"
            >
              Reservaciones
            </Button>
            <Button
              v-if="showMaterialButton"
              variant="ghost"
              @click="handleMaterialClick"
              class="text-gray-600 hover:text-primary"
            >
              Material Didáctico
            </Button>
            <Button
              v-if="showNewReservationButton"
              class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full flex items-center space-x-2"
              @click="handleNewReservation"
            >
              <Icon icon="material-symbols:calendar-add-on-outline" class="w-5 h-5" />
              <span>Crear Nueva Reservación</span>
            </Button>
          </div>

          <!-- Iconos de notificación y menú -->
          <div class="flex items-center space-x-3">
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
    </template>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";

const { toggleSidebar } = useSidebar();
const router = useRouter();

const { isMobile } = useDevice();

// Props
const props = defineProps({
  currentScreen: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
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
});

// Emits
const emit = defineEmits([
  "goBack",
  "new-reservation",
  "material-click",
  "custom-action",
]);

// Funciones
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
  router.push("/notifications");
};
</script>
