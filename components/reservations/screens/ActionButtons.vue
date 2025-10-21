<template>
  <div class="bg-muted/30 rounded-lg p-0 mb-8 lg:hidden">
    <div :class="gridClasses">
      <!-- Botón de Nueva Reservación - Siempre visible -->
      <Card
        @click="$emit('new-reservation')"
        :class="hasReservations ? 'min-h-10 rounded-full' : 'min-h-20 rounded-3xl'"
        class="flex items-center justify-center cursor-pointer bg-primary hover:bg-primary/90 transition-colors p-1"
      >
        <CardContent
          :class="hasReservations ? 'flex-row' : 'flex-col my-5'"
          class="flex items-center justify-between p-1 text-center"
        >
          <Icon
            icon="material-symbols:calendar-add-on-outline"
            width="24"
            height="24"
            :class="hasReservations ? 'mb-0 mr-3' : 'mb-0'"
            style="color: #fff"
          />
          <span class="font-semibold text-lg text-[#FFFFFF]"> Nueva reservación </span>
        </CardContent>
      </Card>

      <!-- Botón de Material Didáctico - Condicional -->
      <Card
        v-if="shouldShowMaterialButton && !hasReservations"
        @click="$emit('view-material')"
        class="flex items-center justify-center min-h-20 cursor-pointer rounded-3xl bg-primary hover:bg-primary/90 transition-colors p-1"
      >
        <CardContent class="flex flex-col items-center justify-center p-1 text-center">
          <Icon
            icon="material-symbols:perm-media-outline"
            width="24"
            height="24"
            class="text-background mb-1"
            style="color: #fff"
          />
          <span class="font-semibold text-lg text-[#FFFFFF]">
            Consultar material didáctico
          </span>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";

import { Icon } from "@iconify/vue";

const props = defineProps({
  hasReservations: {
    type: Boolean,
    default: false,
  },
  showMaterialButton: {
    type: Boolean,
    default: null, // null significa auto-determinar basado en hasReservations
  },
});

const gridClasses = computed(() => {
  // Asegurar que siempre sea un booleano válido
  const hasRes = Boolean(props.hasReservations);
  // Si hay reservaciones, mostrar solo 1 columna (solo nueva reservación)
  // Si no hay reservaciones, mostrar 2 columnas (nueva reservación + material)
  return hasRes
    ? "grid grid-cols-1 gap-4 bg-white border-0"
    : "grid grid-cols-2 gap-4 bg-white border-0";
});

// Computed para mostrar el botón de material didáctico
const shouldShowMaterialButton = computed(() => {
  // Si se especifica explícitamente, usar ese valor
  if (props.showMaterialButton !== null) {
    return props.showMaterialButton;
  }
  // Por defecto, mostrar cuando NO hay reservaciones
  return !Boolean(props.hasReservations);
});

defineEmits(["new-reservation", "view-material"]);
</script>
