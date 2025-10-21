<template>
  <div class="p-4 space-y-4">
    <div class="space-y-4">
      <div class="space-y-2">
        <Label class="text-sm font-medium">Teléfono de contacto</Label>
        <EditPhoneDialog ref="editPhoneDialogRef" @update-phone="updatePhone">
          <template #trigger>
            <div
              class="py-3 px-4 bg-secondary/40 rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
              @click="openEditPhoneDialog"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold">{{ contactData.phone }}</span>
                <Icon icon="ri:edit-line" class="w-4 h-4" />
              </div>
            </div>
          </template>
        </EditPhoneDialog>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Correo electrónico principal</Label>
        <div
          class="py-3 px-4 bg-secondary/40 rounded-full cursor-pointer hover:bg-secondary/80 transition-colors mb-0"
          :class="[
            showEmailSelector ? 'rounded-t-lg rounded-b-none border-b-0' : 'rounded-full',
            showEmailSelector ? 'bg-input-filled' : 'bg-input-empty',
          ]"
          @click="toggleEmailSelector"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold">{{ primaryEmail }}</span>
            <Icon v-if="showEmailSelector" icon="mdi:chevron-down-up" />
            <Icon v-else icon="mdi:chevron-up-down" />
          </div>
        </div>
        <!-- Botón para agregar nuevo correo principal -->
        <div
          v-if="showEmailSelector"
          class="p-3 mb-0 bg-background border border-muted cursor-pointer hover:bg-muted/50 transition-colors rounded-none"
        >
          <AddPrimaryEmailDialog @add-primary-email="addPrimaryEmail">
            <template #trigger>
              <div
                class="bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors -mx-4 -my-3 px-4 py-3 rounded-md"
              >
                <span class="text-sm text-primary">
                  Agregar nuevo correo electrónico principal
                </span>
                <Icon icon="gridicons:add" class="w-4 h-4 text-primary" />
              </div>
            </template>
          </AddPrimaryEmailDialog>
        </div>

        <!-- Selector de correo principal -->
        <div ref="emailSelector" class="mt-0 space-y-0">
          <div
            v-if="showEmailSelector"
            v-for="(email, index) in availableEmails"
            :key="getOptionKey(email)"
            :class="[
              'px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors',
              index % 2 === 0
                ? 'bg-secondary/20 hover:bg-secondary/40'
                : 'bg-secondary/10 hover:bg-secondary/40',
            ]"
            @click="selectPrimaryEmail(email)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted-foreground">
                  {{ email }}
                </span>
                <!-- Indicador de verificación -->
                <div v-if="isEmailVerified(email)" class="flex items-center space-x-1">
                  <span class="text-xs text-green-600"> -Verificado</span>
                </div>
                <div v-else class="flex items-center space-x-1">
                  <span class="text-xs text-orange-500">- No verificado</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-5 w-5 text-muted-foreground hover:text-foreground"
                @click.stop="removeBackupEmail(email)"
              >
                <Icon
                  icon="material-symbols:delete-outline"
                  class="w-4 h-4 text-destructive"
                />
              </Button>
            </div>
          </div>
        </div>

        <div class="flex items-start mt-1 space-x-2">
          <InfoAlert
            message="Recuerda que puedes hacer reservación con distintas instituciones desde el mismo correo"
            class="mb-0"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Correo electrónico de respaldo</Label>
        <div
          class="py-3 px-4 bg-secondary/40 rounded-full cursor-pointer hover:bg-muted/80 transition-colors mb-0"
          :class="[
            showBackupSelector
              ? 'rounded-t-lg rounded-b-none border-b-0'
              : 'rounded-full',
            showBackupSelector ? 'bg-input-filled' : 'bg-input-empty',
          ]"
          @click="toggleBackupSelector"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-normal">
              {{
                backupEmails && backupEmails.length > 0
                  ? backupEmails[0] +
                    (backupEmails.length > 1
                      ? " y " + (backupEmails.length - 1) + " más"
                      : "")
                  : "No hay correos de respaldo"
              }}
            </span>
            <Icon v-if="showBackupSelector" icon="mdi:chevron-down-up" />
            <Icon v-else icon="mdi:chevron-up-down" />
          </div>
        </div>

        <!-- Selector de correos de respaldo -->
        <div ref="backupSelector" class="mt-0 space-y-0">
          <div v-if="showBackupSelector">
            <!-- Formulario para agregar nuevo correo -->
            <div
              v-if="showAddEmail"
              class="py-2 px-1 bg-background border border-muted rounded-b-md"
            >
              <div class="flex items-center space-x-1">
                <Input
                  v-model="newEmail"
                  type="email"
                  placeholder="Nuevo correo electrónico"
                  class="flex-1 text-sm"
                  @keyup.enter="addBackupEmail"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  @click="addBackupEmail"
                >
                  <Icon icon="gridicons:add" class="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground hover:text-foreground"
                  @click="cancelAddEmail"
                >
                  <Icon icon="ri:close-line" class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <!-- Botón para agregar correo como parte de la lista -->
            <div v-if="!showAddEmail && canAddMore" class="px-4 py-3 rounded-b-md">
              <AddBackupEmailDialog
                :current-backup-emails="backupEmails || []"
                @add-backup-email="addBackupEmailFromModal"
              >
                <template #trigger>
                  <div
                    class="bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors -mx-4 -my-3 px-4 py-3 rounded-md"
                  >
                    <span class="text-sm text-primary">
                      Agregar nuevo correo electrónico de respaldo
                    </span>
                    <Icon icon="gridicons:add" class="w-4 h-4 text-primary" />
                  </div>
                </template>
              </AddBackupEmailDialog>
            </div>

            <!-- Lista de correos existentes -->
            <div
              v-for="(email, index) in backupEmails || []"
              :key="getOptionKey(email)"
              :class="[
                'px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors',
                index % 2 === 0
                  ? 'bg-secondary/20 hover:bg-secondary/40'
                  : 'bg-secondary/10 hover:bg-secondary/40',
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-muted-foreground">
                    {{ email }}
                  </span>
                  <!-- Indicador de verificación -->
                  <div v-if="isEmailVerified(email)" class="flex items-center space-x-1">
                    <span class="text-xs text-green-600 italic">- Verificado</span>
                  </div>
                  <div v-else class="flex items-center space-x-1">
                    <span class="text-xs text-orange-500 italic">- No verificado</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-5 w-5 text-muted-foreground hover:text-foreground"
                  @click.stop="removeBackupEmail(email)"
                >
                  <Icon
                    icon="material-symbols:delete-outline"
                    class="w-4 h-4 text-destructive"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-start mt-1 space-x-2">
          <InfoAlert
            message="Recuerda que puedes agregar un máximo de 3 correos electrónicos de respaldo"
            class="mb-0"
          />
        </div>

        <!-- Indicador de carga -->
        <div v-if="backupEmailsLoading" class="flex items-center mt-2 space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span class="text-xs text-muted-foreground"
            >Cargando correos de respaldo...</span
          >
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Cambiar contraseña</Label>
        <ChangePasswordDialog>
          <template #trigger>
            <div
              class="py-3 px-4 bg-secondary/20 rounded-full w-full text-sm cursor-pointer hover:bg-muted/80 transition-colors"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-normal"
                  >Cambia o restablece tu contraseña aquí</span
                >
                <Icon icon="uis:lock" class="w-4 h-4" />
              </div>
            </div>
          </template>
        </ChangePasswordDialog>
      </div>
    </div>

    <!-- Diálogo de confirmación reutilizable -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContactData, GetUserApiResponse } from "@/types/user";
import { Icon } from "@iconify/vue";
import autoAnimate from "@formkit/auto-animate";
import ChangePasswordDialog from "./ChangePasswordDialog.vue";
import EditPhoneDialog from "./EditPhoneDialog.vue";
import AddPrimaryEmailDialog from "./AddPrimaryEmailDialog.vue";
import AddBackupEmailDialog from "./AddBackupEmailDialog.vue";
import { useUsers } from "@/composables/auth/useUsers";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/ui/useToast";
import { userService } from "@/lib/api/services/users/user.service";
import { useBackupEmails } from "@/composables/utils/useBackupEmails";
import { useConfirmDialog } from "@/composables/ui/useConfirmDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import InfoAlert from "@/components/common/InfoAlert.vue";

const props = defineProps<{
  contactData: ContactData & { backupEmails?: string[] };
}>();

const emit = defineEmits<{
  "update-primary-email": [email: string];
  "remove-backup-email": [email: string];
  "add-backup-email": [email: string];
  "update-phone": [phone: string];
  "add-primary-email": [email: string];
  "update-backup-emails": [emails: string[]];
}>();

// Composables
const { searchUserByEmail, isLoading, error } = useUsers();
const authStore = useAuthStore();
const { showError, showSuccess } = useToast();
const {
  backupEmails,
  loading: backupEmailsLoading,
  error: backupEmailsError,
  hasReachedLimit,
  canAddMore,
  emailCount,
  loadBackupEmails,
  addBackupEmail: addBackupEmailComposable,
  removeBackupEmail: removeBackupEmailComposable,
  validateEmail,
  initialize: initializeBackupEmails,
  isEmailVerified,
} = useBackupEmails();

// Composable para diálogos de confirmación
const confirmDialog = useConfirmDialog();

// Usar directamente los datos del prop del padre en lugar de crear un ref local
const contactData = computed(() => props.contactData);

const showEmailSelector = ref(false);
const emailSelector = ref();
const showBackupSelector = ref(false);
const backupSelector = ref();
const showAddEmail = ref(false);
const newEmail = ref("");
const editPhoneDialogRef = ref();

// Computed property para el correo principal que siempre refleje el valor más actualizado
const primaryEmail = computed(() => {
  return authStore.user?.email || contactData.value.primaryEmail;
});

// Lista de correos disponibles (solo los de respaldo) - usar directamente del composable
const availableEmails = computed(() => {
  return backupEmails.value || [];
});

// Watcher para actualizar el correo principal cuando cambie en el store
watch(
  () => authStore.user?.email,
  (newEmail) => {
    if (newEmail && newEmail !== contactData.value.primaryEmail) {
      console.log("Correo principal actualizado en el store:", newEmail);
      contactData.value.primaryEmail = newEmail;
      emit("update-primary-email", newEmail);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  autoAnimate(emailSelector.value);
  autoAnimate(backupSelector.value);

  console.log("=== Inicializando componente ContactSecurityScreen ===");
  console.log("authStore.user:", authStore.user);
  console.log("authStore.user?.id:", authStore.user?.id);
  console.log("contactData del prop:", props.contactData);

  // Solo inicializar el composable de backup emails si tenemos el ID del usuario
  if (authStore.user?.id) {
    console.log("Inicializando composable de backup emails...");
    await initializeBackupEmails();
    console.log("Composable inicializado. Emails cargados:", backupEmails.value);
    console.log("Estado del composable - loading:", backupEmailsLoading.value);
    console.log("Estado del composable - error:", backupEmailsError.value);
  } else {
    console.log("No se encontró el ID del usuario, esperando a que se cargue...");
  }
});

// Watcher para cuando se carguen los datos del usuario
watch(
  () => authStore.user?.id,
  async (newUserId) => {
    if (newUserId) {
      console.log("Usuario cargado, inicializando composable de backup emails...");
      await initializeBackupEmails();
    }
  }
);

// Watcher para cuando cambien los datos de contacto del prop
watch(
  () => props.contactData,
  (newContactData) => {
    console.log("Datos de contacto actualizados desde el padre:", newContactData);
  },
  { deep: true }
);

// Función para cargar datos del usuario (ya no necesaria, los datos vienen del padre)
const loadUserData = async () => {
  console.log("loadUserData ya no es necesaria, los datos vienen del componente padre");
};

// Función para cargar datos del usuario con un email específico (ya no necesaria)
const loadUserDataWithEmail = async (email: string) => {
  console.log(
    "loadUserDataWithEmail ya no es necesaria, los datos vienen del componente padre"
  );
};

// Función para obtener la clave única de un option
const getOptionKey = (option: string): string => {
  return option;
};

// Función para cargar los correos alternativos del usuario usando el composable
const loadAlternativeEmails = async (userId: string) => {
  try {
    console.log("Cargando correos alternativos para el usuario:", userId);

    // Usar el composable para cargar los emails
    await loadBackupEmails(userId);

    console.log("Lista de correos de respaldo actualizada:", backupEmails.value);

    // Emitir evento para actualizar la UI del componente padre
    emit("update-backup-emails", backupEmails.value);

    // Emitir evento para actualizar la UI del componente padre
    emit("update-backup-emails", backupEmails.value);
  } catch (err) {
    console.error("Error al cargar correos alternativos:", err);
    showError("Error", "No se pudieron cargar los correos de respaldo");
  }
};

// Función para actualizar los datos del usuario en localStorage
const updateUserDataInLocalStorage = (userData: any) => {
  try {
    // Obtener los datos actuales del localStorage
    const currentUserData = localStorage.getItem("auth_user");
    let userDataToUpdate = {};

    if (currentUserData) {
      userDataToUpdate = JSON.parse(currentUserData);
    }

    // Actualizar con los nuevos datos
    const updatedUserData = {
      ...userDataToUpdate,
      ...userData,
    };

    // Guardar en localStorage
    localStorage.setItem("auth_user", JSON.stringify(updatedUserData));
    console.log("Datos del usuario actualizados en localStorage:", updatedUserData);

    // También actualizar el authStore si está disponible
    if (authStore.user) {
      Object.assign(authStore.user, userData);
    }
  } catch (error) {
    console.error("Error al actualizar datos en localStorage:", error);
  }
};

const toggleEmailSelector = () => {
  showEmailSelector.value = !showEmailSelector.value;
};

const toggleBackupSelector = () => {
  showBackupSelector.value = !showBackupSelector.value;
};

const selectPrimaryEmail = async (email: string) => {
  if (email !== primaryEmail.value) {
    try {
      // Verificar si el correo está verificado usando el composable
      const isVerified = isEmailVerified(email);

      if (!isVerified) {
        // Mostrar confirmación para correo no verificado
        const confirmed = await confirmDialog.showConfirm({
          title: "Correo no verificado",
          message: `El correo ${email} no está verificado. Para continuar usando el sistema, necesitas verificar este correo primero. ¿Deseas proceder con el cambio?`,
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
          const userModifiedId = 1; // ID del usuario que modifica (por defecto 1)

          // Llamar al endpoint para actualizar el email principal
          await userService.updateUserEmailPrimary({
            userId,
            email: email,
            userModifiedId,
          });

          // Mostrar mensaje de correo no verificado y cerrar sesión
          showError(
            "Correo no verificado",
            `El correo ${email} no está verificado. Necesitas verificar este correo para continuar usando el sistema.`
          );

          // Cerrar el selector
          showEmailSelector.value = false;

          // Cerrar sesión después de un breve delay
          setTimeout(() => {
            authStore.logout();
            // Redirigir al login
            window.location.href = "/auth/login";
          }, 2000);

          return;
        } else {
          // Usuario canceló, no hacer nada
          return;
        }
      }

      // Si llegamos aquí, el correo está verificado
      // Mostrar confirmación normal
      const confirmed = await confirmDialog.showConfirm({
        title: "Cambiar correo principal",
        message: `¿Estás seguro que deseas cambiar tu correo principal a: ${email}?`,
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
        const userModifiedId = 1; // ID del usuario que modifica (por defecto 1)

        // Llamar al endpoint para actualizar el email principal
        await userService.updateUserEmailPrimary({
          userId,
          email: email,
          userModifiedId,
        });

        // Emitir el evento para actualizar la UI local
        emit("update-primary-email", email);

        // Emitir el evento para actualizar la UI local
        emit("update-primary-email", email);

        // Cerrar el selector
        showEmailSelector.value = false;

        // Mostrar mensaje de éxito
        showSuccess("Email actualizado", `Correo principal cambiado a: ${email}`);

        // Actualizar el email en el authStore para futuras consultas
        if (authStore.user) {
          authStore.user.email = email;
        }

        // Esperar un momento y luego recargar los datos del usuario con el nuevo email
        setTimeout(async () => {
          await loadUserDataWithEmail(email);
        }, 1000);
      }
    } catch (error) {
      console.error("Error al cambiar email principal:", error);
      showError("Error", "No se pudo cambiar el correo principal");
    } finally {
      // Desactivar loading
      confirmDialog.setLoading(false);
    }
  } else {
    showEmailSelector.value = false;
  }
};

const removeBackupEmail = async (email: string) => {
  try {
    console.log("Eliminando correo de respaldo:", email);

    // Usar el composable para eliminar el email
    await removeBackupEmailComposable(email);

    // Recargar los correos alternativos para actualizar la lista
    const userId = authStore.user?.id;
    if (userId) {
      await loadAlternativeEmails(userId);
    }

    // Emitir el evento para que el componente padre sepa que se actualizó
    emit("remove-backup-email", email);
  } catch (err: any) {
    console.error("Error al eliminar correo de respaldo:", err);
    showError("Error", err?.message || "No se pudo eliminar el correo de respaldo");
  }
};

const addBackupEmail = () => {
  const email = newEmail.value.trim();

  if (email) {
    // Usar la validación del composable
    const validation = validateEmail(email);

    if (validation.isValid) {
      emit("add-backup-email", email);
      newEmail.value = "";
      showAddEmail.value = false;
    } else {
      // Mostrar el primer error de validación
      showError("Error de validación", validation.errors[0]);
    }
  }
};

const cancelAddEmail = () => {
  showAddEmail.value = false;
  newEmail.value = "";
};

// Funciones para los modales
const openEditPhoneDialog = async () => {
  console.log("=== DEBUG: Abriendo diálogo de edición de teléfono ===");
  console.log("Teléfono actual:", props.contactData.phone);

  try {
    // Obtener los datos completos del usuario
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      console.error("Error: No se encontró el email del usuario autenticado");
      showError("Error", "No se encontró el email del usuario autenticado");
      return;
    }

    console.log("Obteniendo datos completos del usuario...");
    const userData = await searchUserByEmail(userEmail);

    if (
      userData &&
      editPhoneDialogRef.value &&
      typeof editPhoneDialogRef.value.openWithData === "function"
    ) {
      // Extraer los datos del usuario de la respuesta de la API
      const userResponse = (userData as any).response || userData;
      console.log("Datos completos del usuario:", userResponse);

      editPhoneDialogRef.value.openWithData(props.contactData.phone, userResponse);
    } else {
      console.error(
        "El diálogo de edición de teléfono no está disponible o no se obtuvieron datos del usuario"
      );
      showError("Error", "No se pudieron cargar los datos del usuario");
    }
  } catch (error) {
    console.error("Error al abrir diálogo de edición de teléfono:", error);
    showError("Error", "Error al abrir el diálogo de edición");
  }
};

const updatePhone = (phone: string) => {
  console.log("=== DEBUG: updatePhone ejecutado ===");
  console.log("Nuevo teléfono:", phone);

  emit("update-phone", phone);
};

const addPrimaryEmail = (email: string) => {
  console.log("Nuevo correo principal agregado:", email);

  // Emitir el evento para el componente padre
  emit("add-primary-email", email);

  // Cerrar el selector de correos si está abierto
  showEmailSelector.value = false;
};

/**
 * Función que maneja el evento 'add-backup-email' emitido por el modal AddBackupEmailDialog
 * @param email - El correo electrónico de respaldo que se va a agregar
 *
 * Flujo completo para guardar un correo de respaldo:
 * 1. El usuario abre el modal AddBackupEmailDialog
 * 2. El usuario ingresa un correo válido y envía el formulario
 * 3. El modal valida el correo (formato, duplicados, límite de 3 correos)
 * 4. El modal emite el evento 'add-backup-email' con el correo
 * 5. Esta función recibe el evento y lo re-emite al componente padre
 * 6. El componente padre debe escuchar este evento y llamar al servicio addAlternativeEmail
 *
 * Para completar el guardado, el componente padre debe:
 * - Escuchar el evento 'add-backup-email'
 * - Llamar a userService.addAlternativeEmail({ userId, email })
 * - Actualizar la UI con el nuevo correo
 * - Mostrar mensaje de éxito/error
 */
const addBackupEmailFromModal = async (email: string) => {
  try {
    console.log("Agregando correo de respaldo:", email);

    // Usar el composable para agregar el email
    await addBackupEmailComposable(email);

    // Recargar los correos alternativos para actualizar la lista
    const userId = authStore.user?.id;
    if (userId) {
      await loadAlternativeEmails(userId);
    }

    // Emitir evento para actualizar la UI del componente padre
    emit("update-backup-emails", backupEmails.value);
  } catch (err: any) {
    console.error("Error al agregar correo de respaldo:", err);
    showError("Error", err?.message || "No se pudo agregar el correo de respaldo");
  }
};
</script>
