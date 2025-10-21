<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="outline">Agregar correo principal</Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-xl text-start"
          >Cambiar correo electrónico principal</DialogTitle
        >
      </DialogHeader>
      <form @submit="handleSubmit(onSubmit)" class="space-y-4 py-2">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Nuevo correo electrónico</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Ingresa un nuevo correo electrónico"
                v-bind="componentField"
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
            <Button
              variant="ghost"
              class="text-primary w-full mt-2"
              :disabled="isSubmitting"
              >Cancelar</Button
            >
          </DialogClose>
          <Button
            variant="secondary"
            type="submit"
            class="w-full"
            :disabled="!meta.valid || isSubmitting"
          >
            {{ isSubmitting ? "Cambiando..." : "Cambiar correo electrónico" }}
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { userService } from "@/lib/api/services/users/user.service";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/ui/useToast";
import { useBackupEmails } from "@/composables/utils/useBackupEmails";
import { useConfirmDialog } from "@/composables/ui/useConfirmDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import InfoAlert from "@/components/common/InfoAlert.vue";

const emit = defineEmits<{
  "add-primary-email": [email: string];
}>();

// Schema de validación para el email
const emailSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingresa un correo electrónico válido")
      .max(50, "El correo electrónico no puede exceder 50 caracteres"),
  })
);

// Configurar el formulario con vee-validate
const { handleSubmit, defineField, isSubmitting, meta } = useForm({
  validationSchema: emailSchema,
  initialValues: {
    email: "",
  },
});

const [email] = defineField("email");

const router = useRouter();
const open = ref(false);
const authStore = useAuthStore();

const { showSuccess, showError } = useToast();
const { isEmailVerified } = useBackupEmails();
const confirmDialog = useConfirmDialog();

async function onSubmit(values: { email: string }) {
  try {
    // Verificar que no sea el mismo correo que ya está activo
    if (values.email === authStore.user?.email) {
      showError("Error", "Este correo ya es tu correo principal");
      return;
    }

    // Verificar si el correo está verificado usando el composable
    const isVerified = isEmailVerified(values.email);

    if (!isVerified) {
      // Mostrar confirmación para correo no verificado
      const confirmed = await confirmDialog.showConfirm({
        title: "Correo no verificado",
        message: `El correo ${values.email} no está verificado. Para continuar usando el sistema, necesitas verificar este correo primero. ¿Deseas proceder con el cambio?`,
        confirmText: "Cambiar y verificar",
        cancelText: "Cancelar",
        confirmVariant: "destructive",
      });

      if (confirmed) {
        // Activar loading en el diálogo
        confirmDialog.setLoading(true);

        // Mostrar loading
        showSuccess("Actualizando", "Cambiando correo principal...");

        const userId = authStore.user?.id || null;
        const userModifiedId = 1;

        // Llamar al endpoint para actualizar el email principal
        await userService.updateUserEmailPrimary({
          userId,
          email: values.email,
          userModifiedId,
        });

        // Mostrar mensaje de correo no verificado y cerrar sesión
        showError(
          "Correo no verificado",
          `El correo ${values.email} no está verificado. Necesitas verificar este correo para continuar usando el sistema.`
        );

        // Cerrar el modal
        open.value = false;
        email.value = "";

        // Cerrar sesión después de un breve delay
        setTimeout(() => {
          authStore.logout();
          // Redirigir al login
          router.push("/auth/login");
        }, 2000);

        return;
      } else {
        // Usuario canceló, no hacer nada
        return;
      }
    }

    // Si llegamos aquí, el correo está verificado o el usuario confirmó el cambio
    // Mostrar confirmación normal
    const confirmed = await confirmDialog.showConfirm({
      title: "Cambiar correo principal",
      message: `¿Estás seguro que deseas cambiar tu correo principal a: ${values.email}?`,
      confirmText: "Cambiar",
      cancelText: "Cancelar",
      confirmVariant: "default",
    });

    if (confirmed) {
      // Activar loading en el diálogo
      confirmDialog.setLoading(true);

      // Mostrar loading
      showSuccess("Actualizando", "Cambiando correo principal...");

      const userId = authStore.user?.id || null;
      const userModifiedId = 1;

      // Llamar al endpoint para actualizar el email principal
      await userService.updateUserEmailPrimary({
        userId,
        email: values.email,
        userModifiedId,
      });

      // Actualizar el correo electrónico en el store usando la función del store
      authStore.updateUserEmail(values.email);

      // Emitir evento para que el componente padre sepa que se actualizó
      emit("add-primary-email", values.email);

      // Cerrar el modal
      open.value = false;
      email.value = "";

      // Mostrar mensaje de éxito
      showSuccess("Email actualizado", `Correo principal cambiado a: ${values.email}`);
    }
  } catch (err: any) {
    console.error("Error al cambiar email principal:", err);

    // Manejar error específico de correo ya existente
    const errorMessage = err?.comments || err?.message || "Error desconocido";
    if (
      err?.code === 400 &&
      (errorMessage.includes("ya existe en la cuenta del usuario") ||
        errorMessage.includes("ya existe"))
    ) {
      showError("Error", "El correo ya existe en tu cuenta");
    } else {
      showError("Error", errorMessage || "No se pudo actualizar el correo principal");
    }
  } finally {
    // Desactivar loading
    confirmDialog.setLoading(false);
  }
}
</script>
