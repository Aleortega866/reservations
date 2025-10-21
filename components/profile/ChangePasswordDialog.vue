<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="outline">Actualizar tu contraseña</Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-xl text-start">Actualizar tu contraseña</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleFormSubmit" class="space-y-4 py-2">
        <FormField name="currentPassword" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Contraseña actual</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Contraseña actual"
                :model-value="componentField.modelValue ?? ''"
                :onUpdate:modelValue="componentField['onUpdate:modelValue'] || (() => {})"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="newPassword" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Nueva contraseña</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Nueva contraseña"
                :model-value="componentField.modelValue ?? ''"
                :onUpdate:modelValue="componentField['onUpdate:modelValue'] || (() => {})"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="confirmPassword" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Confirmar nueva contraseña</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Confirmar nueva contraseña"
                :model-value="componentField.modelValue ?? ''"
                :onUpdate:modelValue="componentField['onUpdate:modelValue'] || (() => {})"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Mensaje de error general -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-center space-x-2">
            <Icon
              icon="ri:error-warning-fill"
              width="16"
              height="16"
              class="text-red-500"
            />
            <span class="text-sm text-red-700">{{ error }}</span>
          </div>
        </div>
        <DialogFooter class="pt-5">
          <DialogClose as-child>
            <Button variant="ghost" class="w-full mt-2 text-primary">Cancelar</Button>
          </DialogClose>
          <Button
            variant="secondary"
            type="submit"
            class="w-full"
            :disabled="loading"
            @click="console.log('🔘 Botón presionado')"
          >
            {{ loading ? "Cambiando contraseña..." : "Cambiar mi contraseña" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useApiAuth } from "@/lib/api/composables/auth";
import { useAuth } from "@/lib/api/composables/auth";
import { useToast } from "@/composables/ui/useToast";

const open = ref(false);
const { resetPasswordSignIn, loading, error } = useApiAuth();
const { user } = useAuth();
const { showSuccess, showError } = useToast();

const schema = toTypedSchema(
  z
    .object({
      currentPassword: z.string().min(1, "La contraseña actual es requerida"),
      newPassword: z.string().min(8, "Mínimo 8 caracteres"),
      confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las contraseñas no coinciden",
          path: ["confirmPassword"],
        });
      }
    })
);

const { handleSubmit, errors, values, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
});

const handleFormSubmit = handleSubmit(onSubmit);

async function onSubmit(values: any) {
  console.log("🚀 onSubmit ejecutándose...");
  console.log("🔍 onSubmit llamado con valores:", values);
  console.log("🔍 Usuario actual:", user.value);

  try {
    console.log("🔍 Iniciando llamada al servicio...");

    const requestData = {
      email: user.value?.email || null,
      password: values.currentPassword || null,
      newPassword: values.newPassword || null,
    };

    console.log("🔍 Datos de la petición:", requestData);

    const response = await resetPasswordSignIn(requestData);

    console.log("🔍 Respuesta del servicio:", response);

    showSuccess("Éxito", "Contraseña actualizada correctamente");

    open.value = false;
    resetForm();
  } catch (err: any) {
    console.error("❌ Error al cambiar contraseña:", err);
    console.error("❌ Detalles del error:", {
      message: err?.message,
      status: err?.status,
      response: err?.response,
      stack: err?.stack,
    });

    const errorMessage =
      err?.message || err?.response?.data?.message || "Error al cambiar la contraseña";
    showError("Error", errorMessage);
  }
}
</script>
