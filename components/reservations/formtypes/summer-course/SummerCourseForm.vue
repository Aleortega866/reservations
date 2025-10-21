<template>
  <div class="space-y-4 mt-4">
    <ReservationStep1
      v-if="getCurrentScreen() === 'reservation-step1'"
      :data="reservationData"
      :header-data="headerData"
      @submit="handleStep1Submit"
      @next="goToStep(2)"
      @navigate-to-step="handleNavigateToStep"
    />

    <ReservationStep2
      v-if="getCurrentScreen() === 'reservation-step2'"
      :type="reservationType"
      :data="reservationData"
      :header-data="headerData"
      :reservation-id="currentReservationId || undefined"
      @next="handleStep2Next"
      @back="goToStep(1)"
      @navigate-to-step="handleNavigateToStep"
    />

    <ReservationStep3
      v-if="getCurrentScreen() === 'reservation-step3'"
      :type="reservationType"
      :header-data="headerData"
      :reservation-id="currentReservationId || undefined"
      @complete="handleCompleteReservation"
      @back="goToStep(2)"
      @navigate-to-step="handleNavigateToStep"
    />
  </div>
</template>

<script setup lang="ts">
import { useReservationStepNavigation } from "@/composables/reservations/useReservationStepNavigation";
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";
import { useReservationFormStore } from "@/stores/reservation-form";
import { useSafeEvents } from "@/composables/ui/useSafeEvents";
import { useDialogStore } from "@/stores/dialog";
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import ReservationStep1 from "@/components/reservations/formtypes/summer-course/steps/ReservationStep1.vue";
import ReservationStep2 from "@/components/reservations/formtypes/summer-course/steps/ReservationStep2.vue";
import ReservationStep3 from "@/components/reservations/formtypes/summer-course/steps/ReservationStep3.vue";

// Props
defineProps({
  headerData: {
    type: Object,
    default: () => ({}),
  },
});

// Emits
const emit = defineEmits(["form-changed"]);

// Composable para reservaciones de cursos de verano
const {
  store,
  currentReservation,
  currentReservationId,
  formData,
  resetForm,
  loadStep2,
  loadStep3,
} = useReservationSummerCourse();

// Router para navegación
const router = useRouter();

// Composable para eventos seguros
const { emitStepNavigationEvent, emitReservationIdSetEvent } = useSafeEvents();

// Store de dialogo
const dialogStore = useDialogStore();
const { showDialog } = storeToRefs(dialogStore); // Necesaria que sea reactiva para ser vigilada por el watcher

// Datos de reservación (compatibilidad con componentes existentes)
const reservationType = ref("summer-course");
const reservationData = computed(() => formData.value);

// Inicializar datos y paso
onMounted(() => {
  // Solo resetear si no hay una reservación existente
  const hasExistingReservation =
    currentReservationId?.value || store.currentReservationId;

  if (!hasExistingReservation) {
    // Resetear completamente el formulario (incluye limpieza de persistencia)
    // console.log(
    //   "🧹 Inicializando nueva reservación de curso de verano - limpiando estado previo"
    // );
    resetForm();
  } else {
    // console.log(
    //   "🔄 Cargando reservación existente - manteniendo datos:",
    //   hasExistingReservation
    // );
  }

  // Debug: verificar que el composable esté funcionando
  // console.log(
  //   "🔍 SummerCourseForm mounted - currentReservation:",
  //   currentReservation?.value
  // );
  // console.log(
  //   "🔍 SummerCourseForm mounted - currentReservationId:",
  //   currentReservationId?.value
  // );
  // console.log("🔍 SummerCourseForm mounted - currentStep:", store.currentStep);
  // console.log("🔍 SummerCourseForm mounted - store:", store);
});

// Composable para navegación entre pasos
const { currentStep, goToStep } = useReservationStepNavigation();

// Función para determinar la pantalla actual
const getCurrentScreen = () => {
  const step = currentStep.value;
  switch (step) {
    case 1:
      return "reservation-step1";
    case 2:
      return "reservation-step2";
    case 3:
      return "reservation-step3";
    default:
      return "reservation-step1";
  }
};

// Manejar envío del paso 1
const handleStep1Submit = (result: any) => {
  // console.log("📝 Resultado del paso 1 recibido:", result);
  // console.log("📝 Tipo del resultado:", typeof result);
  // console.log("📝 Resultado tiene ID?:", result && result.id);
  // console.log("📝 Resultado tiene response?:", result && result.response);

  // Extraer el ID del campo 'response' de la respuesta del API
  let reservationId = null;

  if (result && result.response) {
    // El API devuelve el ID en el campo 'response'
    reservationId = result.response;
    //  console.log("✅ ID extraído del campo response:", reservationId);
  } else if (result && result.id) {
    // Fallback: si el ID está directamente en el objeto
    reservationId = result.id;
    // console.log("✅ ID extraído del campo id:", reservationId);
  } else if (typeof result === "number") {
    // Fallback: si el resultado es directamente un número
    reservationId = result;
    // console.log("✅ ID extraído como número directo:", reservationId);
  }

  // Establecer el ID y el objeto completo en el store si se pudo extraer
  if (reservationId) {
    store.setCurrentReservationId(reservationId);

    // También establecer el ID en el store principal para sincronización
    const reservationFormStore = useReservationFormStore();
    reservationFormStore.setReservationId(reservationId);
    //console.log("✅ ID establecido en store principal:", reservationId);

    // También establecer el objeto completo de la reservación
    if (result && typeof result === "object" && result.id) {
      store.setCurrentReservation(result);
      //  console.log("✅ Objeto completo de reservación establecido en el store");
    }
    // console.log("✅ ID establecido en el store:", reservationId);
  } else {
    console.error("❌ No se pudo extraer el ID de la reservación del resultado:", result);
  }

  // El ID de la reservación ya está disponible en el store
  /*  console.log(
    "✅ Reservación creada, ID disponible en store:",
    currentReservationId?.value
  );*/
  //console.log("✅ Reservación completa:", currentReservation?.value);

  // Emitir evento cuando se establezca el ID de reservación
  setTimeout(() => {
    if (currentReservationId.value) {
      emitReservationIdSetEvent(currentReservationId.value, "summer-course");
    }
  }, 100);

  // Los datos de los pasos 2 y 3 se cargan automáticamente en el onMounted
  // de cada componente cuando se montan (patrón adoptado de empresarial)
};

// Manejar navegación a un paso específico
const handleNavigateToStep = (step: number) => {
  console.log("🔄 Navegando al paso:", step);
  goToStep(step);

  // Emitir evento para notificar que se navegó a un paso
  setTimeout(() => {
    emitStepNavigationEvent(step, "summer-course", currentReservationId.value);
  }, 100);
};

// Manejar navegación al paso 3 desde el paso 2
const handleStep2Next = async () => {
  console.log("🔄 Navegando del paso 2 al paso 3...");
  goToStep(3);

  // Emitir evento para notificar que se navegó al paso 3
  setTimeout(() => {
    emitStepNavigationEvent(3, "summer-course", currentReservationId.value);
  }, 100);
};

// Funcion que espera hasta que SplashScreen resuelva como false para poder continuar con la ejecucion del codigo subsecuente
const waitForDialogToClose = (): Promise<void> => {
  return new Promise((resolve) => {
    const stop = watch(showDialog, (newVal) => {
      console.log("Se cierra");
      if (!newVal) {
        stop(); // Detiene el watcher
        resolve();
      }
    });
  });
};

const handleCompleteReservation = async (finalData: any) => {
  try {
    // Guardar datos del paso 3 en el store
    store.updateStepData(3, finalData);

    // Marcar como completado en el store
    store.markAsCompleted();

    console.log("✅ Reservación completada, navegando a página de éxito");

    // Guardar el ID de la reservación antes de limpiar
    const reservationId = store.currentReservationId;

    // Mostrar SplashScreen antes de navegar
    if (reservationId) {
      dialogStore.toggleDialog(true, "¡RESERVACIÓN CREADA!", [
        "Has terminado tu reservación de curso de verano con éxito, revisaremos la información y te notificaremos de cualquier cambio o aclaración en tu reservación",
        "Recuerda que puedes consultar el material didáctico en una liga que hemos enviado a tu correo electrónico o directamente en las reservaciones de tu cuenta.",
      ]);
      await waitForDialogToClose();
      await router.push(
        `/reservations/summer-course/success?reservationId=${reservationId}`
      );
    } else {
      await router.push("/reservations/summer-course/success");
    }

    // Limpiar toda la persistencia después de navegar exitosamente
    console.log("🧹 Limpiando persistencia después de completar reservación exitosa");
    store.clearPersistence();
  } catch (error) {
    console.error("Error al completar la reservación:", error);
  }
};
</script>
