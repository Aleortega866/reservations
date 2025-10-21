<template>
  <!-- Solo muestra los botones si hay un ID de reservación (creada o modificada) -->
  <div v-if="reservationId">
    <div class="flex flex-col space-y-8 py-4">
      <!-- Botón principal: Confirmar Reservación -->
      <Button
        type="button"
        variant="secondary"
        class="w-full h-10 shadow-[4px_4px_16px_rgba(0,0,0,0.3)] cursor-pointer"
        :disabled="isLoading || isConfirming"
        @click="handleConfirmReservation"
      >
        <div v-if="isConfirming" class="flex items-center justify-center">
          <div
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          Confirmando...
        </div>
        <span v-else class="text-white text-lg font-semibold">Confirmar reservación</span>
      </Button>

      <!-- Botón secundario: Cancelar Reservación -->
      <!-- <Button
        type="button"
        variant="destructive"
        class="w-full h-10 shadow-[4px_4px_16px_rgba(0,0,0,0.3)] cursor-pointer"
        :disabled="isLoading || isCancelling"
        @click="handleCancelReservation"
      >
        <div v-if="isCancelling" class="flex items-center justify-center">
          <div
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          Cancelando...
        </div>
        <span v-else class="text-white text-lg font-semibold">Cancelar reservación</span>
      </Button> -->

      <!-- Botón terciario: Material y Menú de Visita -->
      <Button
        type="button"
        variant="default"
        class="w-full h-10 shadow-[4px_4px_16px_rgba(0,0,0,0.3)] cursor-pointer"
        @click="handleMaterialAction"
      >
        <Icon
          icon="material-symbols:perm-media-outline"
          width="24"
          height="24"
          class="text-background mb-0"
          style="color: #fff"
        />
        <span class="text-white text-lg font-semibold"
          >Material y menú de visita</span
        >
      </Button>
    </div>
    <Separator class="my-10 h-0.5 bg-muted max-w-3/4 mx-auto" />
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useReservationOperations } from "@/composables/reservations/useReservationOperations";
import { useToast } from "@/composables/ui/useToast";

interface Props {
  isLoading?: boolean;
  reservationId?: number | null;
  showMaterialButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  reservationId: null,
  showMaterialButton: false,
  showConfirmButton: false,
});

const router = useRouter();

const emit = defineEmits<{
  materialAction: [];
  reservationConfirmed: [reservationId: number];
  reservationCancelled: [reservationId: number];
}>();

const { showSuccess, showError } = useToast();
const {
  isLoading: isConfirming,
  confirmReservation,
  cancelReservation: cancelReservationService,
} = useReservationOperations();

const isCancelling = ref(false);

const handleConfirmReservation = async () => {
  if (!props.reservationId) {
    showError("Error", "No se encontró el ID de la reservación");
    return;
  }

  const result = await confirmReservation(props.reservationId);

  if (result?.isValid && result?.code === 200) {
    showSuccess("¡Reservación confirmada!", "Tu reservación ha sido confirmada exitosamente");

    // Emitir evento para notificar que la reservación fue confirmada
    emit("reservationConfirmed", props.reservationId);
  } else {
    showError("Error al confirmar", result?.comments || "No se pudo confirmar la reservación");
  }
};

const handleCancelReservation = async () => {
  if (!props.reservationId) {
    showError("Error", "No se encontró el ID de la reservación");
    return;
  }

  try {
    isCancelling.value = true;

    const result = await cancelReservationService(
      props.reservationId!,
      1 // ID de tipo de cancelación por defecto
    );

    if (result?.success) {
      showSuccess("¡Reservación cancelada!", "Tu reservación ha sido cancelada exitosamente");

      // Emitir evento para notificar que la reservación fue cancelada
      emit("reservationCancelled", props.reservationId);
    } else {
      showError("Error al cancelar", result?.message || "No se pudo cancelar la reservación");
    }
  } catch (error) {
    console.error("❌ Error al cancelar reservación:", error);
    showError("Error", "Ocurrió un error al cancelar la reservación. Por favor intenta de nuevo.");
  } finally {
    isCancelling.value = false;
  }
};

const handleMaterialAction = () => {
  console.log(
    "📄 Abriendo material y menú de visita para reservación:",
    props.reservationId
  );
  emit("materialAction");
  router.push(`/vinculation?reservationId=${props.reservationId}`);
};

// const handleConfirmReservation = () => {
//   console.log("📄 Confirmando reservación:", props.reservationId);
//   emit("confirmReservation");
//   router.push(
//     `/reservations/general/success?reservationId=${props.reservationId}`
//   );
// };
</script>
