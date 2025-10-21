<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          <span class="block text-primary font-bold text-base mt-1">
            Crear Nuevo Taller
          </span>
        </DialogTitle>
        <DialogDescription> Completa la información del nuevo taller </DialogDescription>
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
              Creando...
            </span>
            <span v-else>Crear Taller</span>
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
    description: "",
    maxCapacity: "",
    duration: "",
    isActive: true,
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  // Validar que el usuario esté autenticado
  if (!authStore.isAuthenticated || !authStore.user) {
    error.value = "Debe estar autenticado para realizar esta acción";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Aquí iría la llamada al servicio para crear el taller
    // Por ahora simulamos la creación
    const newWorkshop = {
      id: Date.now(), // ID temporal
      description: values.description,
      maxCapacity: parseInt(values.maxCapacity),
      duration: parseInt(values.duration),
      isActive: values.isActive,
      currentCapacity: 0,
    };

    // Mostrar mensaje de éxito
    showSuccess("Éxito", "El taller se creó correctamente");

    // Emitir el evento de guardado y éxito
    emit("save", newWorkshop);
    emit("success", newWorkshop);
    isOpen.value = false;

    // Limpiar el formulario
    form.resetForm();
  } catch (err: any) {
    console.error("Error al crear el taller:", err);
    error.value = err?.message || "Error al crear el taller. Intente nuevamente.";

    // Mostrar mensaje de error
    showError("Error", error.value || "Error desconocido");
  } finally {
    loading.value = false;
  }
});

// Limpiar el formulario cuando se abra el diálogo
watch(isOpen, (newValue) => {
  if (newValue) {
    form.resetForm();
    error.value = null;
  }
});
</script>
