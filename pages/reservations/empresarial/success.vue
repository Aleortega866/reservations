<template>
  <div>
    <ReservationSuccess
      :reservation="reservation"
      :company-name="companyName"
      @go-home="handleGoHome"
      @download="handleDownload"
      @send-email="handleSendEmail"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import ReservationSuccess from "@/components/reservations/formtypes/empresarial/ReservationSuccess.vue";
import { useReservationCompany } from "@/composables/reservations/useReservationCompany";
import { useToast } from "@/composables/ui/useToast";

// Meta
definePageMeta({
  layout: "default",
  title: "Reservación Completada - MIDER",
});

// Composables
const router = useRouter();
const route = useRoute();
const { store, clearPersistence } = useReservationCompany();
const { showSuccess, showError } = useToast();

// Estado reactivo
const reservation = ref(null);
const companyName = ref("");

// Métodos
const loadReservationData = () => {
  // Intentar obtener la reservación desde el store o parámetros de la URL
  if (store.currentReservation) {
    reservation.value = store.currentReservation;
  } else if (route.query.reservationId) {
    // Si viene de parámetros de URL, cargar la reservación
    const reservationId = parseInt(route.query.reservationId);
    if (reservationId) {
      // Aquí podrías cargar la reservación desde el servidor
      console.log("Cargando reservación desde URL:", reservationId);
    }
  }

  // Obtener nombre de la empresa desde el store
  companyName.value = store.formData.companyId
    ? `Empresa ID: ${store.formData.companyId}`
    : "Empresa no especificada";
};

const handleGoHome = () => {
  // Limpiar persistencia antes de ir al inicio
  console.log("🧹 Limpiando persistencia al ir al inicio");
  clearPersistence();
  router.push("/reservations/");
};

const handleDownload = (reservationData) => {
  // Implementar descarga de PDF o imagen
  console.log("Descargando confirmación para:", reservationData);

  // Simular generación de PDF
  const pdfContent = generatePDFContent(reservationData);
  downloadPDF(pdfContent, `reservacion-${reservationData?.id || "confirmacion"}.pdf`);
};

const handleSendEmail = (reservationData) => {
  // Implementar envío de email
  console.log("Enviando email para:", reservationData);

  // Aquí podrías llamar a un servicio de email
  showSuccess("Éxito", "Email de confirmación enviado");
};

// Lifecycle
onMounted(() => {
  loadReservationData();

  // Mostrar mensaje de éxito
  showSuccess(
    "¡Reservación Completada!",
    "Tu reservación empresarial ha sido procesada exitosamente"
  );
});

// Limpiar persistencia cuando el usuario abandone la página
onBeforeUnmount(() => {
  console.log("🧹 Limpiando persistencia al abandonar página de éxito");
  clearPersistence();
});
</script>

<style scoped>
/* Estilos específicos para la página de éxito */
</style>
