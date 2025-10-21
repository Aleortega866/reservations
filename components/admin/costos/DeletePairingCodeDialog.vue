<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-lg text-start font-semibold"
          >Confirmar eliminación</DialogTitle
        >
        <DialogDescription class="text-sm text-start mb-4">
          ¿Estás seguro de que deseas eliminar el código de vinculación "{{
            pairingCode?.name || pairingCode?.code
          }}"? Esta acción no se puede deshacer.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <Button @click="handleDelete" :disabled="isDeleting">
          <Icon
            v-if="isDeleting"
            icon="lucide:loader-circle"
            width="16"
            height="16"
            class="mr-2 animate-spin"
          />
          {{ isDeleting ? "Eliminando..." : "Eliminar" }}
        </Button>

        <Button
          variant="outline"
          @click="$emit('update:open', false)"
          :disabled="isDeleting"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import type { LinkingCode } from "@/lib/api/types/promotion";
import { usePromotions } from "@/composables/business/usePromotions";

interface Props {
  open: boolean;
  pairingCode: LinkingCode | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  deleted: [pairingCode: LinkingCode];
}>();

const isDeleting = ref(false);

// Composable para manejar promociones
const { deleteLinkingCode } = usePromotions();

const handleDelete = async () => {
  if (!props.pairingCode) return;

  try {
    isDeleting.value = true;

    // Usar el composable para eliminar (actualiza el estado local automáticamente)
    const result = await deleteLinkingCode({
      id: props.pairingCode.id,
    });

    if (result) {
      // Emitir evento de eliminación exitosa
      emit("deleted", props.pairingCode);
      emit("update:open", false);
    }
  } catch (error) {
    console.error("Error al eliminar el código de vinculación:", error);
    // Aquí podrías mostrar un toast de error
  } finally {
    isDeleting.value = false;
  }
};
</script>
