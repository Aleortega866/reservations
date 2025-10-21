<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-left text-lg font-semibold"
          >Configurar Visibilidad del Video</DialogTitle
        >
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Switch para mostrar solo una vez -->
        <div class="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div class="space-y-1">
            <Label for="showOnce" class="text-sm font-medium">Mostrar solo una vez</Label>
            <p class="text-xs text-muted-foreground">
              Si está activado, el video solo se mostrará la primera vez que el visitante
              acceda
            </p>
          </div>
          <Switch
            id="showOnce"
            v-model="form.isActive"
            :disabled="loading"
            @update:model-value="
              video ? handleSwitchToggle(video.id.toString(), $event) : undefined
            "
          />
        </div>

        <!-- Fechas de visibilidad -->
        <div class="space-y-4">
          <!-- Campo de fecha de inicio -->
          <CalendarField
            name="visibleFrom"
            label="Visible desde"
            type="vcalendar"
            format="datetime"
            placeholder="Elige la fecha de inicio"
            help-text="Fecha desde la cual el video estará disponible"
            :required="true"
            :model-value="startDate"
            @update:model-value="handleStartDateChange"
          />

          <!-- Campo de fecha de fin -->
          <CalendarField
            name="visibleTo"
            label="Visible hasta"
            type="vcalendar"
            format="datetime"
            placeholder="Elige la fecha de fin"
            help-text="Fecha hasta la cual el video estará disponible"
            :required="true"
            :min-date="startDate || new Date()"
            :model-value="endDate"
            @update:model-value="handleEndDateChange"
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
            <span v-else>Guardar configuración</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CalendarField from "~/components/common/CalendarField.vue";
import { useVideo } from "@/composables/media/useVideo";
import type { Video } from "@/lib/api/types/media";
import { useToast } from "@/composables/ui/useToast";
import { useVideosStore } from "@/stores/videos";

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

// Usar el store de videos
const videosStore = useVideosStore();

// Usar el composable de toast
const { showSuccess, showError } = useToast();

// Formulario reactivo
const form = ref({
  visibleFrom: "",
  visibleTo: "",
  isActive: false,
});

// Estado para las fechas
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);

// Validación del formulario
const isFormValid = computed(() => {
  return startDate.value && endDate.value && startDate.value < endDate.value;
});

// Funciones para manejar los calendarios
const handleStartDateChange = (value: string | Date | null) => {
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  startDate.value = date;
  form.value.visibleFrom = date ? date.toISOString().slice(0, 16) : "";
};

const handleEndDateChange = (value: string | Date | null) => {
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  endDate.value = date;
  form.value.visibleTo = date ? date.toISOString().slice(0, 16) : "";
};

// Actualizar formulario cuando cambie el video
watch(
  () => props.video,
  (newVideo: Video | null) => {
    if (newVideo) {
      form.value = {
        visibleFrom: newVideo.visibleFrom ? newVideo.visibleFrom.slice(0, 16) : "",
        visibleTo: newVideo.visibleTo ? newVideo.visibleTo.slice(0, 16) : "",
        isActive: newVideo.showOnce || false,
      };

      // Actualizar las fechas para los calendarios
      if (newVideo.visibleFrom) {
        startDate.value = new Date(newVideo.visibleFrom);
      }
      if (newVideo.visibleTo) {
        endDate.value = new Date(newVideo.visibleTo);
      }
    }
  },
  { immediate: true }
);

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!props.video || !isFormValid.value) return;

  try {
    const updateData = {
      id: props.video.id,
      title: props.video.title,
      description: props.video.description || "",
      additionalDescription: props.video.additionalDescription || "",
      visibleFrom: form.value.visibleFrom,
      visibleTo: form.value.visibleTo,
      sectionId: props.video.sectionId,
      showOnce: form.value.isActive,
      fileName: props.video.fileName,
    };

    const success = await updateVideo(updateData);

    if (success) {
      emit("saved", props.video);
      emit("update:open", false);
    }
  } catch (err) {
    console.error("Error al actualizar la visibilidad del video:", err);
  }
};

const handleSwitchToggle = async (id: string, value: boolean) => {
  try {
    const video = videosStore.getVideoById(id);

    if (video) {
      console.log(
        `Enviando petición al servidor para cambiar visibilidad del video ${id} a: ${value}`
      );

      // Usar el store para actualizar solo la visibilidad
      // Enviar showOnce como true cuando el switch está activado
      const response = await videosStore.updateVideoVisibility(id, value, value);

      console.log("Respuesta del servidor:", response);

      // Mostrar toast de éxito
      showSuccess(
        "Visibilidad actualizada",
        `El video "${video.title}" se actualizo correctamente`
      );

      //cerrar el dialog
      emit("update:open", false);

      console.log(`✅ Visibilidad del video ${id} cambiada exitosamente a: ${value}`);
    }
  } catch (error) {
    console.error("❌ Error al cambiar visibilidad del video:", error);

    // Mostrar toast de error
    showError(
      "Error al actualizar visibilidad",
      "No se pudo cambiar la visibilidad del video. Inténtalo de nuevo."
    );
  }
};
</script>
