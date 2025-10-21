<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-start">Reemplazar Video</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Selector de archivo -->
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="videoFile">Sustituir video</Label>
            <div class="flex items-center space-x-2">
              <input
                id="videoFile"
                ref="fileInput"
                type="file"
                accept="video/*"
                @change="handleFileSelect"
                :disabled="loading"
                class="hidden"
              />
              <Button
                type="button"
                variant="outline"
                @click="triggerFileSelect"
                :disabled="loading"
                class="flex-1"
              >
                <Icon icon="lucide:upload" width="16" height="16" class="mr-2" />
                {{ selectedFile ? "Cambiar archivo" : "Seleccionar archivo" }}
              </Button>
            </div>

            <!-- Placeholder del archivo seleccionado -->
            <div
              v-if="selectedFile"
              class="p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div class="flex items-start space-x-3">
                <div
                  class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <Icon
                    icon="lucide:video"
                    width="20"
                    height="20"
                    class="text-blue-600"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-blue-900 truncate">
                    {{ selectedFile.name }}
                  </p>
                  <div class="flex items-center space-x-4 mt-1">
                    <span class="text-xs text-blue-600">
                      {{ formatFileSize(selectedFile.size) }}
                    </span>
                    <span class="text-xs text-blue-600">
                      {{ selectedFile.type }}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="clearFileSelection"
                  :disabled="loading"
                  class="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                >
                  <Icon icon="lucide:x" width="16" height="16" />
                </Button>
              </div>
            </div>

            <p class="text-xs text-muted-foreground">
              Formatos soportados: MP4, AVI, MOV, WMV, FLV. Tamaño máximo: 100MB
            </p>
          </div>
        </div>

        <!-- Eliminar video -->
        <div class="space-y-2 mb-12">
          <Button
            type="button"
            variant="destructive"
            @click="handleDeleteVideo"
            :disabled="loading"
            class="w-full flex items-center justify-center space-x-2"
          >
            <Icon icon="lucide:trash-2" width="16" height="16" />
            <span>Eliminar definitivamente este video</span>
          </Button>
        </div>

        <!-- Mensaje de error -->
        <div
          v-if="error"
          class="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <div class="flex items-center space-x-2">
            <Icon
              icon="lucide:circle-alert"
              width="16"
              height="16"
              class="text-destructive"
            />
            <span class="text-sm text-destructive">{{ error }}</span>
          </div>
        </div>

        <!-- Mensaje de validación -->
        <div
          v-if="validationError"
          class="p-3 bg-yellow-50 border border-yellow-200 rounded-md"
        >
          <div class="flex items-center space-x-2">
            <Icon
              icon="lucide:triangle-alert"
              width="16"
              height="16"
              class="text-yellow-600"
            />
            <span class="text-sm text-yellow-700">{{ validationError }}</span>
          </div>
        </div>

        <!-- Botones de acción -->
        <DialogFooter>
          <Button type="submit" :disabled="loading || !isFormValid">
            <div v-if="loading" class="flex items-center space-x-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Reemplazando...</span>
            </div>
            <span v-else>Reemplazar Video</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Diálogo de confirmación -->
  <ConfirmDialog
    :is-open="confirmDialog.dialogState.value.isOpen"
    :title="confirmDialog.dialogState.value.title"
    :message="confirmDialog.dialogState.value.message"
    :confirm-text="confirmDialog.dialogState.value.confirmText"
    :cancel-text="confirmDialog.dialogState.value.cancelText"
    :confirm-variant="confirmDialog.dialogState.value.confirmVariant"
    :loading="confirmDialog.dialogState.value.loading"
    @confirm="confirmDialog.handleConfirm"
    @cancel="confirmDialog.handleCancel"
    @close="confirmDialog.handleClose"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import { useVideo } from "@/composables/media/useVideo";
import { useConfirmDialog } from "@/composables/ui/useConfirmDialog";
import { useVideosStore } from "@/stores/videos";
import type { Video } from "@/lib/api/types/media";

interface Props {
  open: boolean;
  video: Video | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  replaced: [video: Video];
  deleted: [video: Video];
}>();

const { replaceVideoFile, deleteVideo, loading, error } = useVideo();
const confirmDialog = useConfirmDialog();
const videosStore = useVideosStore();

// Referencias
const fileInput = ref<HTMLInputElement>();

// Estado del formulario
const selectedFile = ref<File | null>(null);
const validationError = ref<string>("");

// Validación del formulario
const isFormValid = computed(() => {
  // Para reemplazar, necesita archivo
  return selectedFile.value !== null && !validationError.value;
});

// Formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Disparar selección de archivo
const triggerFileSelect = () => {
  if (fileInput.value && fileInput.value instanceof HTMLInputElement) {
    fileInput.value.click();
  }
};

// Manejar selección de archivo
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    validationError.value = "";

    // Validar tipo de archivo
    if (!file.type.startsWith("video/")) {
      validationError.value = "El archivo seleccionado no es un video válido";
      return;
    }

    // Validar tamaño (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB en bytes
    if (file.size > maxSize) {
      validationError.value = "El archivo es demasiado grande. Tamaño máximo: 100MB";
      return;
    }

    selectedFile.value = file;
  }
};

// Limpiar selección de archivo
const clearFileSelection = () => {
  selectedFile.value = null;
  validationError.value = "";
  if (fileInput.value && fileInput.value instanceof HTMLInputElement) {
    fileInput.value.value = "";
  }
};

// Limpiar formulario cuando se cierre el diálogo
watch(
  () => props.open,
  (isOpen: boolean) => {
    if (!isOpen) {
      clearFileSelection();
    }
  }
);

// Manejar eliminación de video
const handleDeleteVideo = async () => {
  if (!props.video) return;

  try {
    // Validar que el ID sea válido
    if (!props.video.id) {
      console.error("Error: El ID del video no es válido:", props.video.id);
      return;
    }

    console.log("Solicitando confirmación para eliminar video:", props.video.id);

    // Mostrar diálogo de confirmación
    const confirmed = await confirmDialog.showConfirm({
      title: "Eliminar Video",
      message: `¿Estás seguro de que quieres eliminar permanentemente el video "${props.video.title}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      confirmVariant: "destructive",
    });

    if (!confirmed) {
      console.log("Eliminación cancelada por el usuario");
      return;
    }

    console.log("Confirmación recibida, eliminando video:", props.video.id);

    const success = await deleteVideo({
      ids: [Number(props.video.id)],
      confirm: true,
      userModifiedId: 1,
    });

    if (success) {
      // Emitir evento de eliminación
      emit("deleted", props.video);
      emit("update:open", false);
    }
  } catch (err) {
    console.error("Error al eliminar el video:", err);
  }
};

// Manejar envío del formulario (solo reemplazo)
const handleSubmit = async () => {
  if (!props.video || !isFormValid.value) return;

  try {
    // Validar que el ID sea válido
    if (!props.video.id) {
      console.error("Error: El ID del video no es válido:", props.video.id);
      return;
    }

    // Verificar que se seleccionó un archivo para reemplazar
    if (!selectedFile.value) {
      console.error("Error: No se seleccionó ningún archivo para reemplazar");
      return;
    }

    console.log("Reemplazando video:", {
      id: props.video.id,
      title: props.video.title,
      fileName: props.video.fileName,
    });

    // Validar que el título no esté vacío
    if (!props.video.title || props.video.title.trim().length === 0) {
      console.error("Error: El título del video está vacío");
      return;
    }

    const success = await replaceVideoFile({
      id: props.video.id,
      title: props.video.title.trim(),
      description: props.video.description || "",
      additionalDescription: props.video.additionalDescription || "",
      visibleFrom: props.video.visibleFrom || "",
      visibleTo: props.video.visibleTo || "",
      videoFile: selectedFile.value,
      file: selectedFile.value,
      userModifiedId: 1,
      fileName: props.video.fileName,
      ...(props.video.category && { category: props.video.category }),
      ...(props.video.tags && { tags: props.video.tags }),
    });

    if (success) {
      // Emitir evento de reemplazo
      emit("replaced", props.video);
      emit("update:open", false);
    }
  } catch (err) {
    console.error("Error al procesar el video:", err);
  }
};
</script>
