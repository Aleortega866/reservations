<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="outline">Nuevo correo electrónico de respaldo</Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-xl text-start"
          >Cambiar correo electrónico principal</DialogTitle
        >
      </DialogHeader>
      <form @submit="onSubmit" class="space-y-4 py-2">
        <FormField v-slot="{ field }" name="email">
          <FormItem>
            <FormLabel>Correo electrónico de respaldo</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Ingresa un nuevo correo electrónico"
                :model-value="field.value"
                @update:model-value="field.onChange"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <InfoAlert
          message="Para confirmar el cambio es necesario verificar el correo electrónico"
          class="mb-5"
        />
        <DialogFooter class="pt-2">
          <DialogClose as-child>
            <Button variant="ghost" class="text-primary italic w-full mt-2"
              >Cancelar</Button
            >
          </DialogClose>
          <Button
            variant="secondary"
            type="submit"
            class="w-full"
            :disabled="!meta.valid || isSubmitting"
          >
            {{ isSubmitting ? "Agregando..." : "Agregar correo de respaldo" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@iconify/vue";
import InfoAlert from "@/components/common/InfoAlert.vue";

const emit = defineEmits<{
  "add-backup-email": [email: string];
}>();

const props = defineProps<{
  currentBackupEmails?: string[];
}>();

const open = ref(false);
const isSubmitting = ref(false);

// Esquema de validación
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingresa un correo electrónico válido")
      .max(255, "El correo electrónico es demasiado largo"),
  })
);

// Formulario con validación
const { handleSubmit, meta, values, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: "",
  },
});

// El composable se inicializa en el componente padre

const onSubmit = handleSubmit(async (formValues) => {
  try {
    isSubmitting.value = true;

    // Emitir evento para que el componente padre maneje la lógica
    emit("add-backup-email", formValues.email);

    open.value = false;
    resetForm();
  } catch (err: any) {
    console.error("Error en el formulario:", err);
  } finally {
    isSubmitting.value = false;
  }
});
</script>
