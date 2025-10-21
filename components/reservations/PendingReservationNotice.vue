<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import Card from "@/components/ui/card/Card.vue";
import Button from "@/components/ui/button/Button.vue";

const cargando = ref(true);

// Datos de ejemplo para múltiples notificaciones pendientes
const pendingReservations = ref([
  {
    id: 1,
    status: "Incompleta",
    message:
      "Has iniciado a capturar datos para una reservación, pero esta no sirve cómo reservación ni pase de entrada hasta que completes todos los datos.",
    institution: "Escuela Primaria Benito Juárez",
    date: "2024-01-15",
  },
]);
</script>

<template>
  <div class="space-y-6">
    <h3 class="font-semibold text-[#3C3C3B] text-2xl">Termina de confirmar tus datos</h3>

    <!-- Grid de 3 columnas para las notificaciones pendientes -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="reservation in pendingReservations"
        :key="reservation.id"
        class="bg-[#FFFAEC] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] p-0 overflow-hidden relative rounded-[30px] border-none"
      >
        <CardContent class="p-0 pb-0">
          <div class="flex gap-4 px-6 pt-5 pb-0">
            <!-- Sección de información principal -->
            <div class="w-full mb-2.5">
              <div class="flex gap-x-5 text-start">
                <div class="grid grid-1 gap-y-1.5">
                  <div class="flex items-center gap-2">
                    <p class="w-13 text-sm text-[#3C3C3B] font-normal italic truncate">
                      Estatus:
                    </p>
                    <p class="text-base text-[#3C3C3B] font-semibold">
                      {{ reservation.status }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-14">
                      <Icon
                        icon="material-symbols:campaign-outline"
                        height="50"
                        width="50"
                        style="color: #003da6"
                      />
                    </div>
                    <p class="text-base text-[#3C3C3B] font-semibold">
                      {{ reservation.message }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <p class="text-sm text-[#3C3C3B] font-normal">Institución:</p>
                    <p class="text-sm text-[#3C3C3B] font-semibold">
                      {{ reservation.institution }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="text-sm text-[#3C3C3B] font-normal">Fecha:</p>
                    <p class="text-sm text-[#3C3C3B] font-semibold">
                      {{ reservation.date }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            class="bg-[#FFD040] w-full text-lg text-[#1D1D1D] font-semibold rounded-none cursor-pointer"
          >
            terminar y guardar
            <Icon
              icon="material-symbols:rotate-right"
              width="24"
              height="24"
              class="font-semibold"
              style="color: #1d1d1d"
            />
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
