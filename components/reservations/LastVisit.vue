<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import Card from "@/components/ui/card/Card.vue";
import Button from "@/components/ui/button/Button.vue";
import ReservationCard from "@/components/reservations/ReservationCard.vue";

const cargando = ref(true);

const reservasDemo = [
  {
    id: 1,
    status: "Asistió",
    visitDate: "2024-06-23",
    visitTime: "10:00",
    institution: "Escuela Primaria Benito Juárez",
    attendees: 25,
  },
];
</script>

<template>
  <div class="space-y-6">
    <h3 class="font-semibold text-[#3C3C3B] text-2xl">Última visita</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReservationCard
        v-for="reservation in reservasDemo"
        :key="reservation.id"
        :reservation="reservation"
      />
    </div>
  </div>
</template>
