<template>
  <div>
    <ReservationSuccess
      :reservation="reservation"
      :visitor-name="visitorName"
      @go-home="handleGoHome"
      @download="handleDownload"
      @send-email="handleSendEmail"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import ReservationSuccess from "@/components/reservations/formtypes/summer-course/ReservationSuccess.vue";
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";
import { useToast } from "@/composables/ui/useToast";

// Meta
definePageMeta({
  layout: "default",
  title: "Reservación Completada - MIDER",
});

// Composables
const router = useRouter();
const route = useRoute();
const { store, clearPersistence } = useReservationSummerCourse();
const { showSuccess, showError } = useToast();

// Estado reactivo
const reservation = ref(null);
const visitorName = ref("");

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

  // Obtener nombre del visitante desde el store
  visitorName.value = store.formData.fullName || "Visitante";
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
  downloadPDF(
    pdfContent,
    `reservacion-curso-verano-${reservationData?.id || "confirmacion"}.pdf`
  );
};

const handleSendEmail = (reservationData) => {
  // Implementar envío de email
  console.log("Enviando email para:", reservationData);

  // Aquí podrías llamar a un servicio de email
  showSuccess("Éxito", "Email de confirmación enviado");
};

// Funciones auxiliares para PDF (simuladas)
const generatePDFContent = (data) => {
  return {
    title: "Confirmación de Reservación Curso de Verano",
    content: `Reservación ID: ${data?.id || "N/A"}`,
    date: new Date().toLocaleDateString(),
    type: "Curso de Verano",
  };
};

const downloadPDF = (content, filename) => {
  // Simulación de descarga
  console.log("Descargando PDF:", filename, content);
  showSuccess("Descarga", "PDF generado exitosamente");
};

// Lifecycle
onMounted(() => {
  loadReservationData();

  // Mostrar mensaje de éxito
  showSuccess(
    "¡Reservación Completada!",
    "Tu reservación curso de verano ha sido procesada exitosamente"
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
