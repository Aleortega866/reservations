<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-2xl font-semibold">Cancelación de la visita</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <p class="text-sm">Lamentamos mucho la cancelación de tu visita</p>
          <p class="text-sm font-semibold">¡Ayúdanos a mejorar!</p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">¿Cuál es el motivo de la cancelación?</p>

          <OptionListField
            v-model="selectedReason"
            :options="cancellationReasons"
            placeholder="Por favor, selecciona una o más opciones"
            value-key="id"
            label-key="name"
            :searchable="false"
          />
        </div>

        <div class="flex flex-col space-y-3 pt-4">
          <Button
            @click="handleConfirmCancellation"
            :disabled="!selectedReason || isLoading"
            variant="secondary"
          >
            {{ isLoading ? "Cancelando..." : "Confirmar cancelación" }}
          </Button>

          <Button variant="ghost" @click="handleClose" class="text-primary italic">
            Cancelar
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ref } from "vue";
import OptionListField from "@/components/common/OptionListField.vue";

interface Props {
  isOpen: boolean;
  reservationId?: number | null;
}

interface CancellationReason {
  id: number;
  name: string;
  value: number;
  label: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirmCancellation: [reservationId: number, reasonId: number];
}>();

const selectedReason = ref<number | null>(null);
const isLoading = ref(false);

// Motivos de cancelación predefinidos
const cancellationReasons: CancellationReason[] = [
  { id: 1, name: "Cambio de planes", value: 1, label: "Cambio de planes" },
  { id: 2, name: "Problemas de transporte", value: 2, label: "Problemas de transporte" },
  { id: 3, name: "Emergencia familiar", value: 3, label: "Emergencia familiar" },
  { id: 4, name: "Problemas de salud", value: 4, label: "Problemas de salud" },
  { id: 5, name: "Conflicto de horarios", value: 5, label: "Conflicto de horarios" },
  { id: 6, name: "Problemas económicos", value: 6, label: "Problemas económicos" },
  { id: 7, name: "La institución canceló", value: 7, label: "La institución canceló" },
];

const handleClose = () => {
  selectedReason.value = null;
  emit("close");
};

const handleConfirmCancellation = async () => {
  if (!selectedReason.value || !props.reservationId) {
    return;
  }

  try {
    isLoading.value = true;
    emit("confirmCancellation", props.reservationId, selectedReason.value);
  } catch (error) {
    console.error("Error al confirmar cancelación:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
