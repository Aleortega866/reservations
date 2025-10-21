<template>
  <Dialog :open="isOpen" @update:open="(value: boolean) => emit('update:isOpen', value)">
    <DialogContent class="sm:max-w-[425px] p-0">
      <div class="px-6 pb-6">
        <div class="flex flex-col items-center justify-center p-6">
          <h2 class="text-lg font-bold text-center text-gray-800 mb-2">
            SE HA CREADO EL CÓDIGO DE VINCULACIÓN CON ÉXITO
          </h2>

          <div class="bg-white pb-4 w-full mb-4">
            <p class="text-sm text-gray-500 text-center mb-2">
              El código de vinculación es:
            </p>
            <p
              class="text-lg font-mono font-bold text-center text-muted-foreground bg-blue-50 p-2 rounded border"
            >
              {{ codePromotion }}
            </p>
          </div>

          <Button @click="copyToClipboard" class="w-full mb-0">
            <Icon icon="lucide:copy" width="16" height="16" class="mr-2" />
            Copiar al portapapeles
          </Button>

          <!-- <Button @click="closeDialog" variant="outline" class="w-full">
            Cerrar
          </Button> -->
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Button from "@/components/ui/button/Button.vue";
import { useToast } from "@/composables/ui/useToast";

interface Props {
  isOpen: boolean;
  codePromotion: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
}>();

const { showSuccess } = useToast();

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.codePromotion);
  showSuccess("Copiado", "Código copiado al portapapeles");
};

const closeDialog = () => {
  emit("update:isOpen", false);
};
</script>
