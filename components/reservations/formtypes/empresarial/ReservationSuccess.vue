<template>
  <div class="h-screen bg-white flex items-center justify-center p-8">
    <div class="w-full h-full max-w-3xl grid grid-rows-[auto_1fr_auto]">
      <!-- Header -->
      <div>
        <div class="mb-7">
          <h2 class="text-4xl text-[#3C3C3B] font-semibold uppercase">Boleto digital</h2>
        </div>

        <!-- Descripcion -->
        <div>
          <p class="text-base text-[#3C3C3B] font-medium">
            Al momento de tu visita al museo, proporciona este código QR en el Módulo de
            Informes, contiene toda la información sobre tu reservación.
          </p>
        </div>
      </div>

      <!-- Código QR simulado -->
      <div class="flex flex-col items-start justify-center">
        <div class="w-full text-center mx-auto mb-10">
          <div
            class="inline-block p-4 bg-white rounded-lg shadow-lg border-2 border-gray-200"
          >
            <!-- QR Code simulado -->
            <div
              class="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
            >
              <!-- Patrón QR simulado -->
              <div class="absolute inset-2 grid grid-cols-8 gap-1">
                <div
                  v-for="i in 64"
                  :key="i"
                  :class="[
                    'w-full h-full rounded-sm',
                    Math.random() > 0.5 ? 'bg-black' : 'bg-white',
                  ]"
                ></div>
              </div>

              <!-- Esquinas del QR -->
              <div class="absolute top-2 left-2 w-6 h-6 border-4 border-black rounded-sm">
                <div class="w-2 h-2 bg-black rounded-sm m-1"></div>
              </div>
              <div
                class="absolute top-2 right-2 w-6 h-6 border-4 border-black rounded-sm"
              >
                <div class="w-2 h-2 bg-black rounded-sm m-1"></div>
              </div>
              <div
                class="absolute bottom-2 left-2 w-6 h-6 border-4 border-black rounded-sm"
              >
                <div class="w-2 h-2 bg-black rounded-sm m-1"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aviso -->
        <InfoAlert
          :message-class="'text-[#3C3C3B] font-normal'"
          message-size="text-sm"
          title="Información"
          message="Este no es un comprobante de pago"
        />
      </div>

      <!-- Botones de acción -->
      <div>
        <div class="flex flex-col sm:flex-row gap-4">
          <Button
            @click="$emit('download', reservation)"
            class="h-10 flex-1 bg-[#652F6C] cursor-pointer"
          >
            <Icon
              icon="material-symbols:download-rounded"
              width="34"
              height="34"
              class="mr-2"
            />
            <span class="text-lg font-semibold text-white">Descargar boleto digital</span>
          </Button>

          <Button
            @click="$emit('send-email', reservation)"
            class="h-10 flex-1 bg-[#652F6C] cursor-pointer"
          >
            <Icon
              icon="material-symbols:attach-email"
              width="34"
              height="34"
              class="mr-2"
            />
            <span class="text-lg font-semibold text-white"
              >Enviar boleto digital vía email</span
            >
          </Button>
        </div>

        <!-- Botón para ir al inicio -->
        <div class="text-center mt-4">
          <Button @click="$emit('go-home')" class="h-10 bg-[#3364B8] cursor-pointer">
            <Icon
              icon="material-symbols:keyboard-return-rounded"
              width="34"
              height="34"
              class="mr-2"
            />
            <span class="text-lg font-semibold text-white">Volver a inicio</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { Icon } from "@iconify/vue";
import InfoAlert from "~/components/common/InfoAlert.vue";

// Props
defineProps({
  reservation: {
    type: Object,
    default: () => null,
  },
  visitorName: {
    type: String,
    default: "Visitante",
  },
});

// Emits
defineEmits(["go-home", "download", "send-email"]);

// Funciones auxiliares
const formatDate = (dateString) => {
  if (!dateString) return "No especificada";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};
</script>

<style scoped>
/* Estilos específicos para el componente de éxito */
</style>
