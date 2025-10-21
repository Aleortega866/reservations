<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-start font-medium"
          >Gestionar Usuarios del Rol</DialogTitle
        >
      </DialogHeader>

      <!-- Formulario para agregar usuario -->
      <div class="space-y-4">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Correo Electrónico</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="usuario@ejemplo.com"
              :class="{ 'border-destructive': errors.email }"
              :disabled="loading"
            />
            <p v-if="errors.email" class="text-sm text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <div
            v-if="error"
            class="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
          >
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <Button
            type="submit"
            :disabled="loading || !formData.email.trim() || !isValidEmail(formData.email)"
          >
            <Icon
              v-if="loading"
              icon="lucide:loader-circle"
              width="16"
              height="16"
              class="mr-2 animate-spin"
            />
            {{ loading ? "Agregando..." : "Agregar Usuario" }}
          </Button>
        </form>
      </div>

      <Separator />

      <!-- Lista de usuarios del rol -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Usuarios del Rol</h3>
        </div>

        <div v-if="loadingUsers" class="flex justify-center py-8">
          <Icon
            v-if="loading"
            icon="lucide:loader-circle"
            width="32"
            height="32"
            class="animate-spin"
          />
        </div>

        <div
          v-else-if="roleUsers.length === 0"
          class="text-center py-8 text-muted-foreground"
        >
          <p>No hay usuarios asignados a este rol</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="user in roleUsers"
            :key="user.userId"
            class="flex items-center justify-between p-3 border rounded-lg bg-card"
          >
            <div class="flex-1">
              <p class="font-medium">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="text-sm text-muted-foreground">{{ user.email }}</p>
              <Badge :variant="user.isActive ? 'default' : 'secondary'" class="mt-1">
                {{ user.isActive ? "Activo" : "Inactivo" }}
              </Badge>
            </div>
            <Button
              @click="removeUserFromRole(user)"
              variant="ghost"
              size="sm"
              :disabled="removingUserId === user.userId"
            >
              <Icon
                v-if="removingUserId === user.userId"
                icon="lucide:loader-circle"
                width="16"
                height="16"
                class="animate-spin"
              />
              <Icon v-else icon="lucide:trash-2" width="16" height="16" />
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter class="flex justify-center">
        <Button
          class="w-full"
          type="button"
          variant="outline"
          @click="updateOpen(false)"
          :disabled="loading"
        >
          Cerrar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/vue";
import { useRoles } from "@/composables/auth/useRoles";
import type {
  Role,
  AddUserToRoleRequest,
  RoleUser,
  DeleteRoleUserRequest,
} from "~/lib/api/types/role";
import { useToast } from "@/composables/ui/useToast";

interface Props {
  open: boolean;
  role: Role | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [email: string];
  success: [email: string];
}>();

const { showSuccess, showError } = useToast();
const { getAllRoleUsers, addUserToRole, deleteRoleUser } = useRoles();

const loading = ref(false);
const loadingUsers = ref(false);
const removingUserId = ref<string | null>(null);
const error = ref<string | null>(null);
const roleUsers = ref<RoleUser[]>([]);

const formData = ref({
  email: "",
});

const errors = ref({
  email: "",
});

// Cargar usuarios del rol cuando se abre el modal
watch(
  () => props.open,
  (newValue) => {
    if (newValue && props.role) {
      loadRoleUsers();
      resetForm();
    }
  }
);

const loadRoleUsers = async () => {
  if (!props.role) return;

  loadingUsers.value = true;
  try {
    roleUsers.value = await getAllRoleUsers(props.role.id);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error al cargar los usuarios del rol";
    showError("Error al cargar usuarios", errorMessage);
  } finally {
    loadingUsers.value = false;
  }
};

const removeUserFromRole = async (user: RoleUser) => {
  if (!props.role) return;

  removingUserId.value = user.userId;

  try {
    const request: DeleteRoleUserRequest = {
      userId: user.userId,
      roleId: props.role.id,
      userModifiedId: 1, // TODO: Cambiar por el id del usuario logueado
    };

    await deleteRoleUser(request);

    showSuccess(
      "Usuario eliminado",
      `El usuario ${user.email} ha sido eliminado del rol "${props.role.name}"`
    );

    // Actualizar la lista localmente para una mejor experiencia de usuario
    roleUsers.value = roleUsers.value.filter((u) => u.userId !== user.userId);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error al eliminar el usuario del rol";
    showError("Error al eliminar usuario", errorMessage);
  } finally {
    removingUserId.value = null;
  }
};

const resetForm = () => {
  formData.value = {
    email: "",
  };
  errors.value = {
    email: "",
  };
  error.value = null;
};

const updateOpen = (value: boolean) => {
  emit("update:open", value);
};

const validateForm = () => {
  let isValid = true;

  // Validar email
  if (!formData.value.email.trim()) {
    errors.value.email = "El correo electrónico es requerido";
    isValid = false;
  } else if (!isValidEmail(formData.value.email)) {
    errors.value.email = "Ingresa un correo electrónico válido";
    isValid = false;
  } else {
    errors.value.email = "";
  }

  return isValid;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const onSubmit = async () => {
  if (!validateForm() || !props.role) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const request: AddUserToRoleRequest = {
      email: formData.value.email.trim(),
      roleName: props.role.name,
      userModifiedId: 1, // TODO: Cambiar por el id del usuario logueado
    };

    await addUserToRole(request);

    showSuccess(
      "Usuario agregado",
      `El usuario ${formData.value.email} ha sido agregado al rol "${props.role.name}"`
    );

    // Emitir eventos
    emit("save", formData.value.email);
    emit("success", formData.value.email);

    // Recargar la lista de usuarios para obtener los datos actualizados del servidor
    await loadRoleUsers();

    // Limpiar formulario
    resetForm();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error al agregar el usuario al rol";
    error.value = errorMessage;
    showError("Error al agregar usuario", errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>
