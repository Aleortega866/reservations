<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          <span class="block text-primary font-bold text-base mt-1"> Editar Taller </span>
        </DialogTitle>
        <DialogDescription> Modifica la información del taller </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="grid gap-4 py-4">
        <FormField v-slot="{ field }" name="description">
          <FormItem>
            <FormLabel>Descripción del Taller</FormLabel>
            <FormControl>
              <Input
                v-model="form.values.description"
                placeholder="Ingresa la descripción del taller"
                :disabled="loading"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ field }" name="maxCapacity">
          <FormItem>
            <FormLabel>Capacidad Máxima</FormLabel>
            <FormControl>
              <Input
                v-model="form.values.maxCapacity"
                type="number"
                placeholder="Ingresa la capacidad máxima"
                :disabled="loading"
                min="1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ field }" name="duration">
          <FormItem>
            <FormLabel>Duración (minutos)</FormLabel>
            <FormControl>
              <Input
                v-model="form.values.duration"
                type="number"
                placeholder="Ingresa la duración en minutos"
                :disabled="loading"
                min="1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ field }" name="isActive">
          <FormItem
            class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
          >
            <FormControl>
              <Checkbox v-model="form.values.isActive" :disabled="loading" />
            </FormControl>
            <div class="space-y-1 leading-none">
              <FormLabel> Taller Activo </FormLabel>
              <p class="text-sm text-muted-foreground">
                El taller estará disponible para reservaciones
              </p>
            </div>
          </FormItem>
        </FormField>

        <!-- Mensaje de error -->
        <div
          v-if="error"
          class="text-sm text-destructive bg-destructive/10 p-2 rounded-md"
        >
          {{ error }}
        </div>

        <div class="flex flex-col gap-2 mt-4">
          <Button type="submit" :disabled="loading" class="w-full">
            <span v-if="loading" class="flex items-center gap-2">
              <div
                class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              ></div>
              Guardando...
            </span>
            <span v-else>Guardar Cambios</span>
          </Button>
          <Button
            class="w-full"
            type="button"
            variant="outline"
            @click="isOpen = false"
            :disabled="loading"
            >Cancelar</Button
          >
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "@/composables/ui/useToast";

interface Workshop {
  id: number;
  description: string;
  maxCapacity: number;
  duration: number;
  isActive: boolean;
  currentCapacity?: number;
}

const props = defineProps<{
  workshop?: Workshop | null;
}>();

const emit = defineEmits(["save", "update:open", "success"]);

const isOpen = defineModel("open", { type: Boolean, default: false });

// Estados para el servicio
const loading = ref(false);
const error = ref<string | null>(null);

// Store de autenticación
const authStore = useAuthStore();

// Toast para notificaciones
const { showSuccess, showError } = useToast();

const formSchema = toTypedSchema(
  z.object({
    description: z
      .string()
      .min(1, "La descripción es requerida")
      .max(200, "La descripción no puede exceder 200 caracteres"),
    maxCapacity: z
      .string()
      .min(1, "La capacidad máxima es requerida")
      .regex(/^\d+$/, "Solo números enteros"),
    duration: z
      .string()
      .min(1, "La duración es requerida")
      .regex(/^\d+$/, "Solo números enteros"),
    isActive: z.boolean().default(true),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    description: props.workshop?.description || "",
    maxCapacity: props.workshop?.maxCapacity?.toString() || "",
    duration: props.workshop?.duration?.toString() || "",
    isActive: props.workshop?.isActive ?? true,
  },
});

// Actualizar valores cuando cambie el taller
watch(
  () => props.workshop,
  (newWorkshop) => {
    if (newWorkshop) {
      form.setFieldValue("description", newWorkshop.description);
      form.setFieldValue("maxCapacity", newWorkshop.maxCapacity.toString());
      form.setFieldValue("duration", newWorkshop.duration.toString());
      form.setFieldValue("isActive", newWorkshop.isActive);
    }
  },
  { immediate: true }
);

const onSubmit = form.handleSubmit(async (values) => {
  // Validar que el usuario esté autenticado
  if (!authStore.isAuthenticated || !authStore.user) {
    error.value = "Debe estar autenticado para realizar esta acción";
    return;
  }

  if (!props.workshop) {
    error.value = "No se encontró el taller a editar";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Aquí iría la llamada al servicio para actualizar el taller
    // Por ahora simulamos la actualización
    const updatedWorkshop = {
      ...props.workshop,
      description: values.description,
      maxCapacity: parseInt(values.maxCapacity),
      duration: parseInt(values.duration),
      isActive: values.isActive,
    };

    // Mostrar mensaje de éxito
    showSuccess("Éxito", "El taller se actualizó correctamente");

    // Emitir el evento de guardado y éxito
    emit("save", updatedWorkshop);
    emit("success", updatedWorkshop);
    isOpen.value = false;
  } catch (err: any) {
    console.error("Error al actualizar el taller:", err);
    error.value = err?.message || "Error al actualizar el taller. Intente nuevamente.";

    // Mostrar mensaje de error
    showError("Error", error.value || "Error desconocido");
  } finally {
    loading.value = false;
  }
});

// Limpiar el formulario cuando se abra el diálogo
watch(isOpen, (newValue) => {
  if (newValue && props.workshop) {
    form.setFieldValue("description", props.workshop.description);
    form.setFieldValue("maxCapacity", props.workshop.maxCapacity.toString());
    form.setFieldValue("duration", props.workshop.duration.toString());
    form.setFieldValue("isActive", props.workshop.isActive);
    error.value = null;
  }
});
</script>
