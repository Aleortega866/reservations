<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <!-- Icono de advertencia -->
      <div
        class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full"
      >
        <Icon icon="mdi:alert-circle" class="w-6 h-6 text-yellow-600" />
      </div>

      <!-- Título -->
      <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">¡Espera!</h3>

      <!-- Mensaje -->
      <p class="text-sm text-gray-600 text-center mb-6">
        {{ message }}
      </p>

      <!-- Botones -->
      <div class="flex flex-col space-y-3">
        <!-- Botón Continuar -->
        <Button
          @click="handleContinue"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white"
          :disabled="loading"
        >
          <Icon icon="mdi:arrow-left" class="w-4 h-4 mr-2" />
          {{ continueText }}
        </Button>

        <!-- Botón Guardar -->
        <Button
          @click="handleSave"
          variant="outline"
          class="w-full border-green-600 text-green-600 hover:bg-green-50"
          :disabled="loading"
        >
          <Icon icon="mdi:content-save" class="w-4 h-4 mr-2" />
          {{ saveText }}
          <Icon v-if="loading" icon="mdi:loading" class="w-4 h-4 ml-2 animate-spin" />
        </Button>

        <!-- Botón Descartar -->
        <Button
          @click="handleDiscard"
          variant="outline"
          class="w-full border-red-600 text-red-600 hover:bg-red-50"
          :disabled="loading"
        >
          <Icon icon="mdi:delete" class="w-4 h-4 mr-2" />
          {{ discardText }}
        </Button>
      </div>

      <!-- Botón cerrar (X) -->
      <Button
        @click="handleClose"
        variant="ghost"
        size="icon"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <Icon icon="mdi:close" class="w-5 h-5" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  loading?: boolean;
  message?: string;
  continueText?: string;
  saveText?: string;
  discardText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  loading: false,
  message:
    "Estás a punto de salir sin guardar el progreso de tu reservación. ¿Qué deseas hacer?",
  continueText: "Continuar creando mi reservación",
  saveText: "Guardar y salir",
  discardText: "Perder mi progreso",
});

const emit = defineEmits<{
  continue: [];
  save: [];
  discard: [];
  close: [];
}>();

const handleContinue = () => {
  emit("continue");
};

const handleSave = () => {
  emit("save");
};

const handleDiscard = () => {
  emit("discard");
};

const handleClose = () => {
  emit("close");
};
</script>
