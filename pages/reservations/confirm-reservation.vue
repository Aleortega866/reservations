<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <img src="/assets/logo-header.svg" alt="logo" class="mx-auto w-20 h-auto" />
      <!-- Mensaje de loading -->
      <div v-if="loading && !exito && !mensajeError" class="text-center space-y-6">
        <div class="p-6 dark:bg-blue-950/20 dark:border-blue-800 rounded-lg">
          <Icon
            icon="lucide:loader-2"
            width="48"
            height="48"
            class="text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin"
          />
          <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Confirmando tu reservación...
          </h2>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Por favor espera mientras verificamos tu reservación.
          </p>
        </div>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="exito" class="text-center space-y-6">
        <div class="p-6 dark:bg-green-950/20 dark:border-green-800 rounded-lg">
          <Icon
            icon="lucide:calendar-check"
            width="48"
            height="48"
            class="text-green-600 dark:text-green-400 mx-auto mb-4"
          />
          <h2 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            ¡Reservación Confirmada!
          </h2>
          <p class="text-sm text-green-700 dark:text-green-300">
            Tu reservación ha sido confirmada correctamente. Te esperamos en la fecha
            programada.
          </p>

          <!-- Información de la reservación (opcional, datos mock por ahora) -->
          <div
            v-if="reservationInfo"
            class="mt-4 p-4 bg-green-50 dark:bg-green-950/40 rounded-md text-left space-y-2"
          >
            <div class="flex items-start gap-2">
              <Icon
                icon="lucide:calendar"
                width="16"
                height="16"
                class="text-green-600 dark:text-green-400 mt-0.5"
              />
              <div class="text-xs">
                <span class="font-medium text-green-800 dark:text-green-200">Fecha:</span>
                <span class="text-green-700 dark:text-green-300 ml-1">{{
                  reservationInfo.date
                }}</span>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <Icon
                icon="lucide:clock"
                width="16"
                height="16"
                class="text-green-600 dark:text-green-400 mt-0.5"
              />
              <div class="text-xs">
                <span class="font-medium text-green-800 dark:text-green-200"
                  >Horario:</span
                >
                <span class="text-green-700 dark:text-green-300 ml-1">{{
                  reservationInfo.time
                }}</span>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <Icon
                icon="lucide:users"
                width="16"
                height="16"
                class="text-green-600 dark:text-green-400 mt-0.5"
              />
              <div class="text-xs">
                <span class="font-medium text-green-800 dark:text-green-200">Tipo:</span>
                <span class="text-green-700 dark:text-green-300 ml-1">{{
                  reservationInfo.type
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="mensajeError" class="text-center space-y-6">
        <div class="p-6 dark:bg-red-950/20 dark:border-red-800 rounded-lg">
          <Icon
            icon="lucide:circle-alert"
            width="48"
            height="48"
            class="text-red-600 dark:text-red-400 mx-auto mb-4"
          />
          <h2 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error de Confirmación
          </h2>
          <p class="text-sm text-red-700 dark:text-red-300">
            {{ mensajeError }}
          </p>

          <!-- Información adicional de ayuda -->
          <div class="mt-4 p-3 bg-red-50 dark:bg-red-950/40 rounded-md text-left">
            <p class="text-xs text-red-700 dark:text-red-300">
              <span class="font-medium">Posibles causas:</span>
            </p>
            <ul
              class="text-xs text-red-700 dark:text-red-300 list-disc list-inside mt-1 space-y-1"
            >
              <li>El enlace de confirmación ha expirado</li>
              <li>La reservación ya fue confirmada anteriormente</li>
              <li>El código de confirmación no es válido</li>
            </ul>
          </div>
        </div>

        <div class="space-y-3">
          <Button @click="contactarSoporte" class="w-full" variant="secondary" size="lg">
            <Icon icon="lucide:help-circle" width="16" height="16" class="mr-2" />
            Contactar Soporte
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { useToast } from "@/composables/ui/useToast";

// Composables
const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useToast();

// Estado reactivo
const loading = ref(true);
const exito = ref(false);
const mensajeError = ref("");

// Información de la reservación (mock por ahora)
const reservationInfo = ref<{
  date: string;
  time: string;
  type: string;
} | null>(null);

// Parámetros de la URL - maneja tanto Token como Code
const reservationId = String(
  route.query.ReservationId || route.query.reservationId || ""
);
const token = String(route.query.Token || route.query.token || "");
const code = String(route.query.Code || route.query.code || "");
const email = String(route.query.Email || route.query.email || "");

// Función principal de confirmación (mock por ahora)
const confirmarReservacion = async () => {
  // Verificar que tengamos los parámetros necesarios
  if (!reservationId || (!token && !code)) {
    loading.value = false;
    mensajeError.value =
      "El enlace de confirmación no es válido o le faltan parámetros necesarios.";
    showError("Error de confirmación", mensajeError.value);
    return;
  }

  try {
    // Simular llamada a la API (aquí irá la lógica real cuando esté el endpoint)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: Aquí irá la llamada real al servicio
    // const response = await confirmReservation({
    //   reservationId: parseInt(reservationId),
    //   code: parseInt(code || token),
    //   email
    // });

    // Mock de respuesta exitosa
    const mockSuccess = true; // Cambiar a false para probar el error

    if (mockSuccess) {
      exito.value = true;
      loading.value = false;

      // Mock de información de la reservación
      reservationInfo.value = {
        date: "15 de Noviembre, 2025",
        time: "10:00 AM - 12:00 PM",
        type: "Visita General",
      };

      showSuccess(
        "Reservación confirmada",
        "Tu reservación ha sido confirmada correctamente."
      );

      // Opcional: Redirigir después de unos segundos
      // setTimeout(() => {
      //   router.push("/reservations");
      // }, 5000);
    } else {
      throw new Error("No se pudo confirmar la reservación");
    }
  } catch (error: any) {
    loading.value = false;
    const serverMessage =
      error.response?.data?.comments ||
      error.message ||
      "Error al confirmar la reservación. Por favor, intenta nuevamente.";
    mensajeError.value = serverMessage;
    showError("Error de confirmación", serverMessage);
  }
};

// Función para navegar a reservaciones
const irAReservaciones = () => {
  router.push("/reservations");
};

// Función para navegar al inicio
const irAlInicio = () => {
  router.push("/");
};

// Función para contactar soporte
const contactarSoporte = () => {
  // TODO: Implementar la lógica para contactar soporte
  showSuccess("Contacto iniciado", "Serás redirigido a nuestro sistema de soporte.");
  // router.push("/soporte");
};

// Lifecycle hooks
onMounted(() => {
  console.log("🎫 Página de confirmación de reservación cargada");
  console.log("Reservation ID:", reservationId);
  console.log("Token:", token);
  console.log("Code:", code);
  console.log("Email:", email);
  console.log("Query completo:", route.query);

  // Iniciar el proceso de confirmación
  confirmarReservacion();
});
</script>
