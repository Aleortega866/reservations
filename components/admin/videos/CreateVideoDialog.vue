<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-start">Crear Nuevo Video</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-6 pb-4">
        <!-- Título del video -->
        <div class="space-y-2">
          <Label for="title">Título del video</Label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="Ingresa el título del video"
            :disabled="loading"
            required
          />
        </div>

        <!-- Descripción del video -->
        <div class="space-y-2">
          <Label for="description">Descripción</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Describe el contenido del video"
            :disabled="loading"
            rows="3"
          />
        </div>

        <!-- Texto alternativo -->
        <div class="space-y-2">
          <Label for="additionalDescription">Texto alternativo</Label>
          <Textarea
            id="additionalDescription"
            v-model="form.additionalDescription"
            placeholder="Texto descriptivo para accesibilidad (opcional)"
            :disabled="loading"
            rows="2"
          />
        </div>

        <!-- Sección del video -->
        <div class="space-y-2">
          <Label for="sectionId">Sección</Label>
          <OptionListField
            v-model="form.sectionId"
            label=""
            placeholder="Selecciona una sección"
            :options="sectionOptions"
            :disabled="sectionsLoading || loading"
          />
        </div>

        <!-- Fechas de visibilidad -->
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div class="space-y-2">
            <Label for="visibleFrom">Visible desde</Label>
            <CalendarField
              v-model="form.visibleFrom"
              label=""
              placeholder="Selecciona fecha de inicio"
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <Label for="visibleTo">Visible hasta</Label>
            <CalendarField
              v-model="form.visibleTo"
              label=""
              placeholder="Selecciona fecha de fin"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Opciones adicionales -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input
              id="showOnce"
              v-model="form.showOnce"
              type="checkbox"
              :disabled="loading"
              class="rounded border-gray-300"
            />
            <Label for="showOnce">Mostrar solo una vez</Label>
          </div>
        </div>

        <!-- Archivo del video -->
        <div class="space-y-2">
          <Label for="videoFile">Archivo de video</Label>
          <div class="space-y-2">
            <Input
              ref="fileInputRef"
              id="videoFile"
              placeholder="Elegir archivo"
              type="file"
              accept="video/*"
              @change="handleFileChange"
              :disabled="loading"
              required
            />

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
                  @click="clearSelectedFile"
                  :disabled="loading"
                  class="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                >
                  <Icon icon="lucide:x" width="16" height="16" />
                </Button>
              </div>
            </div>
          </div>
          <p class="text-sm text-muted-foreground">
            Formatos soportados: MP4, AVI, MOV, WMV
          </p>
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

        <!-- Botones de acción -->
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
            :disabled="loading"
          >
            Cancelar
          </Button>
          <Button type="submit" :disabled="loading">
            <div v-if="loading" class="flex items-center space-x-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Creando...</span>
            </div>
            <span v-else>Crear Video</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OptionListField from "@/components/common/OptionListField.vue";
import CalendarField from "@/components/common/CalendarField.vue";
import { useVideo } from "@/composables/media/useVideo";
import { videoService } from "@/lib/api/services/media/video.service";
import type { Video, VideoSection, UploadVideoRequest } from "@/lib/api/types/media";

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  created: [video: Video];
}>();

const { uploadVideo, loading, error } = useVideo();

// Variables para secciones
const sections = ref<VideoSection[]>([]);
const sectionsLoading = ref(false);
const sectionOptions = ref<{ value: string; label: string }[]>([]);

// Archivo seleccionado
const selectedFile = ref<File | null>(null);

// Referencia al input de archivo
const fileInputRef = ref<HTMLInputElement | null>(null);

// Formulario reactivo simple
const form = ref({
  title: "",
  description: "",
  additionalDescription: "",
  sectionId: "",
  visibleFrom: null as Date | null,
  visibleTo: null as Date | null,
  showOnce: false,
});

// Validación manual
const validateForm = () => {
  const errors: string[] = [];

  if (!form.value.title.trim()) {
    errors.push("El título es requerido");
  }

  if (!form.value.visibleFrom) {
    errors.push("La fecha de inicio es requerida");
  }

  if (!form.value.visibleTo) {
    errors.push("La fecha de fin es requerida");
  }

  if (!selectedFile.value) {
    errors.push("El archivo de video es requerido");
  }

  return errors;
};

// Función para formatear el tamaño del archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Función para cargar secciones
const loadSections = async () => {
  try {
    sectionsLoading.value = true;
    const sectionsData = await videoService.getAllSections();
    sections.value = sectionsData;

    // Convertir a formato de opciones para OptionListField
    sectionOptions.value = sectionsData.map((section) => ({
      value: section.id.toString(),
      label: section.name,
    }));
  } catch (err) {
    console.error("Error al cargar secciones:", err);
  } finally {
    sectionsLoading.value = false;
  }
};

// Cargar secciones al montar el componente
onMounted(() => {
  loadSections();
});

// Manejar cambio de archivo
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

// Limpiar archivo seleccionado
const clearSelectedFile = () => {
  selectedFile.value = null;
  // Limpiar también el input file usando la referencia
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

// Manejar cancelación
const handleCancel = () => {
  resetForm();
  emit("update:open", false);
};

// Resetear formulario
const resetForm = () => {
  form.value = {
    title: "",
    description: "",
    additionalDescription: "",
    sectionId: "",
    visibleFrom: null,
    visibleTo: null,
    showOnce: false,
  };
  selectedFile.value = null;
  // Limpiar también el input file usando la referencia
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

// Manejar envío del formulario
const handleSubmit = async () => {
  // Validar formulario
  const errors = validateForm();
  if (errors.length > 0) {
    console.error("Errores de validación:", errors);
    return;
  }

  if (!selectedFile.value) return;

  try {
    // Convertir fechas a string ISO si son objetos Date
    const visibleFrom =
      form.value.visibleFrom instanceof Date
        ? form.value.visibleFrom.toISOString()
        : form.value.visibleFrom || "";
    const visibleTo =
      form.value.visibleTo instanceof Date
        ? form.value.visibleTo.toISOString()
        : form.value.visibleTo || "";

    const uploadData: UploadVideoRequest = {
      file: selectedFile.value,
      title: form.value.title.trim(),
      description: form.value.description?.trim() || "",
      additionalDescription: form.value.additionalDescription?.trim() || "",
      category: "", // Mantener vacío por ahora
      tags: [],
      fileName: selectedFile.value.name,
      visibleFrom,
      visibleTo,
      showOnce: form.value.showOnce,
      userModifiedId: 1,
      isVisible: true,
      enable: true,
    };

    // Solo agregar sectionId si se ha seleccionado una sección válida
    const sectionIdValue = parseInt(form.value.sectionId);
    if (form.value.sectionId && !isNaN(sectionIdValue) && sectionIdValue > 0) {
      uploadData.sectionId = sectionIdValue;
    }

    console.log("uploadData a enviar:", uploadData);

    const success = await uploadVideo(uploadData);

    if (success) {
      // El uploadVideo no retorna el video creado, solo un boolean
      // Emitir un evento vacío para notificar que se creó exitosamente
      emit("created", {} as Video);
      resetForm();
      emit("update:open", false);
    }
  } catch (err) {
    console.error("Error al crear el video:", err);
  }
};
</script>
