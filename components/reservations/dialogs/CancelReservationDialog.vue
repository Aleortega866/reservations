<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <div class="flex justify-between items-start">
          <DialogTitle class="text-2xl font-semibold">Cancelar reservación</DialogTitle>
        </div>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <p class="text-base font-semibold">
          ¿Estás seguro de que quieres cancelar tu reservación?
        </p>

        <div class="space-y-2">
          <p class="text-sm">
            Esta acción cancelará tu reservación pendiente.<br />
            <span class="font-semibold">¡No te preocupes!</span>
          </p>
          <p class="text-sm">
            Te ofrecemos algunas opciones para intentar solucionar tu caso antes de
            cancelar
          </p>
        </div>

        <div class="space-y-2 pt-2">
          <p class="text-sm font-medium">
            ¿Alguna de las siguientes opciones te ayuda a resolver el caso de tu
            reservación?
          </p>

          <div class="space-y-6">
            <Button
              variant="secondary"
              class="w-full"
              @click="handleOption('conflictos-agenda')"
            >
              Conflictos con la agenda
            </Button>

            <Button
              variant="secondary"
              class="w-full"
              @click="handleOption('organizacion-grupo')"
            >
              Organización del grupo
            </Button>

            <Button
              variant="secondary"
              class="w-full"
              @click="handleOption('transporte-presupuesto')"
            >
              Transporte y presupuesto
            </Button>

            <Button
              variant="secondary"
              class="w-full"
              @click="handleOption('institucion-cancelo')"
            >
              La institución en la reservación canceló la visita
            </Button>
          </div>

          <Button variant="default" class="w-full mt-6" @click="handleOption('ninguna')">
            Ninguna de las anteriores
          </Button>

          <div class="pt-4 border-t">
            <Button
              variant="destructive"
              class="w-full"
              @click="handleOption('cancelar-directamente')"
            >
              Cancelar directamente
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";

interface Props {
  isOpen: boolean;
  reservationId?: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  optionSelected: [option: string];
}>();

const handleClose = () => {
  emit("close");
};

const handleOption = (option: string) => {
  console.log("🚫 Opción de cancelación seleccionada:", option);
  console.log("📄 ID de reservación:", props.reservationId);
  emit("optionSelected", option);
};
</script>
