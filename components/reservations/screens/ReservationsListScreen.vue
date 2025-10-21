<template>
  <div class="space-y-6">
    <!-- Botones de acción principales -->
    <ActionButtons
      :has-reservations="true"
      :show-material-button="true"
      @new-reservation="$emit('new-reservation')"
      @view-material="$emit('view-material')"
    />

    <div class="space-y-6">
      <h3 class="font-semibold text-[#3C3C3B] text-2xl">Reservaciones próximas</h3>

      <!-- Spinner de carga -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="relative">
          <div class="w-8 h-8 rounded-full border-4 border-gray-200"></div>
          <div
            class="w-8 h-8 rounded-full border-4 border-primary border-t-transparent absolute top-0 left-0 animate-spin"
          ></div>
        </div>
      </div>

      <!-- Reservaciones agrupadas -->
      <div v-else-if="!isLoading && reservations.length > 0" class="space-y-8">
        <div
          v-for="group in groupedReservations"
          :key="group.groupName"
          class="space-y-4"
        >
          <!-- Header del grupo -->
          <GroupHeader :group-name="group.groupName" :count="group.reservations.length" />

          <!-- Grid de reservaciones del grupo -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReservationCard
              v-for="reservation in group.reservations"
              :key="reservation.id"
              :reservation="reservation"
              @view-details="$emit('view-details', reservation)"
            />
          </div>
          <hr class="w-10/12 border-t-2 border-[#B3B3B3] mx-auto my-8" />
        </div>
      </div>

      <!-- Mensaje cuando no hay reservaciones próximas -->
      <div
        v-else-if="!isLoading && reservations.length === 0"
        class="font-semibold text-[#3C3C3B] text-3xl text-center"
      >
        <p>Aún no tienes reservaciones, inicia creando una nueva</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ReservationCard from "@/components/reservations/ReservationCard.vue";
import ActionButtons from "./ActionButtons.vue";
import GroupHeader from "@/components/reservations/GroupHeader.vue";

const props = defineProps({
  reservations: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["new-reservation", "view-details", "view-material"]);

// ============================================================================
// GROUPING LOGIC
// ============================================================================

const groupedReservations = computed(() => {
  if (!props.reservations || props.reservations.length === 0) {
    return [];
  }

  // Agrupar reservaciones por el campo groupBy
  const groups = props.reservations.reduce((acc, reservation) => {
    const groupName = reservation.groupBy || "Sin clasificar";

    if (!acc[groupName]) {
      acc[groupName] = [];
    }

    acc[groupName].push(reservation);
    return acc;
  }, {});

  // Convertir a array y ordenar por prioridad
  const groupOrder = ["Confirmada", "Sin Confirmar"];

  return Object.entries(groups)
    .map(([groupName, reservations]) => ({
      groupName,
      reservations: reservations.sort(
        (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
      ),
    }))
    .sort((a, b) => {
      const indexA = groupOrder.indexOf(a.groupName);
      const indexB = groupOrder.indexOf(b.groupName);

      // Si ambos están en el orden definido, usar ese orden
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // Si solo uno está en el orden definido, ese va primero
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Si ninguno está en el orden definido, ordenar alfabéticamente
      return a.groupName.localeCompare(b.groupName);
    });
});
</script>
