<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-start">Editar Video</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-6">
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
          <Label for="altText">Texto alternativo</Label>
          <Textarea
            id="altText"
            v-model="form.additionalDescription"
            placeholder="Texto descriptivo para accesibilidad (opcional)"
            :disabled="loading"
            rows="2"
          />
        </div>

        <!-- Sección del video -->
        <div class="space-y-2">
          <Label for="section">Sección</Label>
          <OptionListField
            v-model="form.sectionId"
            label=""
            placeholder="Selecciona una sección"
            :options="sectionOptions"
            :disabled="sectionsLoading || loading"
          />
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
            @click="$emit('update:open', false)"
            :disabled="loading"
          >
            Cancelar
          </Button>
          <Button type="submit" :disabled="loading || !isFormValid">
            <div v-if="loading" class="flex items-center space-x-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Guardando...</span>
            </div>
            <span v-else>Guardar cambios</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
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
import { useVideo } from "@/composables/media/useVideo";
import { videoService } from "@/lib/api/services/media/video.service";
import type { Video, VideoSection, UpdateVideoRequest } from "@/lib/api/types/media";

interface Props {
  open: boolean;
  video: Video | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  saved: [video: Video];
}>();

const { updateVideo, loading, error } = useVideo();

// Variables para secciones
const sections = ref<VideoSection[]>([]);
const sectionsLoading = ref(false);
const sectionOptions = ref<{ value: string; label: string }[]>([]);

// Formulario reactivo
const form = ref({
  title: "",
  description: "",
  additionalDescription: "",
  visibleFrom: "",
  visibleTo: "",
  sectionId: "",
});

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

// Validación del formulario
const isFormValid = computed(() => {
  return (
    form.value.title.trim().length > 0 && form.value.visibleFrom && form.value.visibleTo
  );
});

// Cargar secciones al montar el componente
onMounted(() => {
  loadSections();
});

// Actualizar formulario cuando cambie el video
watch(
  () => props.video,
  (newVideo) => {
    if (newVideo) {
      form.value = {
        title: newVideo.title || "",
        description: newVideo.description || "",
        additionalDescription: newVideo.additionalDescription || "", // Campo adicional que no está en el tipo Video
        visibleFrom: newVideo.visibleFrom ? newVideo.visibleFrom.slice(0, 16) : "",
        visibleTo: newVideo.visibleTo ? newVideo.visibleTo.slice(0, 16) : "",
        sectionId: (newVideo as any).sectionId
          ? (newVideo as any).sectionId.toString()
          : "", // Convertir a string para OptionListField
      };
    }
  },
  { immediate: true }
);

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!props.video || !isFormValid.value) return;

  try {
    console.log("props.video:", props.video);
    console.log("form.value:", form.value);

    const updateData: UpdateVideoRequest = {
      id: props.video.id,
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      additionalDescription: form.value.additionalDescription.trim(),
      visibleFrom: form.value.visibleFrom,
      visibleTo: form.value.visibleTo,
      fileName: props.video.fileName,
    };

    // Solo agregar sectionId si se ha seleccionado una sección válida
    const sectionIdValue = parseInt(form.value.sectionId);
    if (form.value.sectionId && !isNaN(sectionIdValue) && sectionIdValue > 0) {
      updateData.sectionId = sectionIdValue;
    }

    console.log("updateData a enviar:", updateData);

    const updatedVideo = await updateVideo(updateData);

    if (updatedVideo) {
      emit("saved", updatedVideo);
      emit("update:open", false);
    }
  } catch (err) {
    console.error("Error al actualizar el video:", err);
  }
};
</script>
