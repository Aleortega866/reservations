<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <ProfileHeader
        :current-screen="'contact-security'"
        :title="'Contacto y Seguridad'"
        :show-back-button="true"
        @go-back="goBack"
      />

      <!-- Contenido -->
      <div class="max-full lg:max-w-2xl lg:mx-auto p-4 pt-12 space-y-4 flex-1">
        <p class="text-sm text-muted-foreground font-medium mb-2">
          Asegúrate de mantener al día esta información.
        </p>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium">Teléfono</Label>
            <EditPhoneDialog ref="editPhoneDialogRef" @update-phone="updatePhone">
              <template #trigger>
                <div
                  class="py-3 px-4 bg-secondary/40 rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
                  @click="openEditPhoneDialog"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-card-foreground font-semibold">{{
                      contactData.phone
                    }}</span>
                    <Icon icon="ri:edit-line" class="w-4 h-4" />
                  </div>
                </div>
              </template>
            </EditPhoneDialog>
          </div>

          <div class="space-y-2">
            <ClientOnly>
              <Label class="text-sm font-medium">Correo electrónico</Label>
              <div
                class="py-3 px-4 bg-secondary/40 rounded-full cursor-pointer hover:bg-secondary/80 transition-colors mb-0"
                :class="[
                  showEmailSelector
                    ? 'rounded-t-lg rounded-b-none border-b-0'
                    : 'rounded-full',
                  showEmailSelector ? 'bg-input-filled' : 'bg-input-empty',
                ]"
                @click="toggleEmailSelector"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-card-foreground">{{
                    primaryEmail
                  }}</span>
                  <Icon v-if="showEmailSelector" icon="mdi:chevron-down-up" />
                  <Icon v-else icon="mdi:chevron-up-down" />
                </div>
              </div>
              <!-- Botón para agregar nuevo correo principal -->
              <div
                v-if="showEmailSelector"
                class="p-3 mb-0 bg-background overflow-hidden border-0 cursor-pointer hover:bg-muted/50 transition-colors rounded-none"
              >
                <AddPrimaryEmailDialog @add-primary-email="addPrimaryEmail">
                  <template #trigger>
                    <div
                      class="bg-primary/10 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors -mx-4 -my-3 px-4 py-3 rounded-md"
                    >
                      <span class="text-sm text-primary">
                        Agregar nuevo correo electrónico principal
                      </span>
                      <Icon icon="gridicons:add" class="w-6 h-6 text-primary" />
                    </div>
                  </template>
                </AddPrimaryEmailDialog>
              </div>

              <!-- Selector de correo principal -->
              <div ref="emailSelector" class="mt-0 space-y-0">
                <template v-if="showEmailSelector">
                  <div
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
                        <div
                          v-if="isEmailVerified(email)"
                          class="flex items-center space-x-1"
                        >
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
                </template>
              </div>
            </ClientOnly>
            <div class="flex items-start mt-1 space-x-2">
              <InfoAlert
                message="Puedes agregar hasta tres correos de respaldo"
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
                <span class="text-sm font-normal text-card-foreground">
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

            <!-- Botón para agregar correo de respaldo -->
            <div
              v-if="showBackupSelector"
              class="p-3 mb-0 bg-background border-0 overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors rounded-none"
            >
              <AddBackupEmailDialog @add-backup-email="addBackupEmail">
                <template #trigger>
                  <div
                    class="bg-primary/10 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors -mx-4 -my-3 px-4 py-3 rounded-md"
                  >
                    <span class="text-sm text-primary">
                      Agregar correo electrónico de respaldo
                    </span>
                    <Icon icon="gridicons:add" class="w-6 h-6 text-primary" />
                  </div>
                </template>
              </AddBackupEmailDialog>
            </div>

            <!-- Lista de correos de respaldo -->
            <div ref="backupSelector" class="mt-0 space-y-0">
              <template v-if="showBackupSelector">
                <div
                  v-for="(email, index) in backupEmails"
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
                      <div
                        v-if="isEmailVerified(email)"
                        class="flex items-center space-x-1"
                      >
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
              </template>
            </div>

            <InfoAlert
              message="Recuerda que puedes agregar un máximo de 3 correos electrónicos de respaldo"
              class="mb-0"
            />
          </div>

          <div class="space-y-2">
            <Label class="text-sm font-medium">Actualizar contraseña</Label>
            <ChangePasswordDialog>
              <template #trigger>
                <div
                  class="py-3 px-4 bg-secondary/15 rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-card-foreground"
                      >clic aquí para cambiar tu contraseña</span
                    >
                    <Icon icon="ri:edit-line" class="w-4 h-4" />
                  </div>
                </div>
              </template>
            </ChangePasswordDialog>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <BottomNavigation :showReservationButton="true" @open-chat="handleOpenChat" />

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import type { ContactData, GetUserApiResponse } from '@/types/user'
import { Icon } from "@iconify/vue";
import autoAnimate from "@formkit/auto-animate";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog.vue";
import EditPhoneDialog from "@/components/profile/EditPhoneDialog.vue";
import AddPrimaryEmailDialog from "@/components/profile/AddPrimaryEmailDialog.vue";
import AddBackupEmailDialog from "@/components/profile/AddBackupEmailDialog.vue";
import { useUsers } from "@/composables/auth/useUsers";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/ui/useToast";
import { userService } from "@/lib/api/services/users/user.service";
import { useBackupEmails } from "@/composables/utils/useBackupEmails";
import { useConfirmDialog } from "@/composables/ui/useConfirmDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import InfoAlert from "@/components/common/InfoAlert.vue";
import ProfileHeader from "@/components/profile/ProfileHeader.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// Router
const router = useRouter();

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

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Estado reactivo
const contactData = ref({
  phone: "",
  primaryEmail: "",
  backupEmails: [],
});

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

// Función para regresar
const goBack = () => {
  router.push("/profile");
};

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};

// Función para cargar los datos del usuario
const loadUserData = async (isRefresh = false) => {
  try {
    // Solo mostrar loading si no es una recarga
    if (!isRefresh) {
      // Aquí podrías agregar un estado de loading si es necesario
    }

    const userEmail = authStore.user?.email;

    if (!userEmail) {
      showError("Error", "No se encontró el email del usuario autenticado");
      return;
    }

    const response = await searchUserByEmail(userEmail);

    if (response && typeof response === "object" && "isValid" in response) {
      const apiResponse = response;
      if (apiResponse.isValid && apiResponse.response) {
        const userData = apiResponse.response;

        // Actualizar los datos de contacto con la información real del usuario
        contactData.value = {
          phone: userData.phoneNumber || "",
          primaryEmail: userData.email || "",
          backupEmails: userData.alternativeEmails || [],
        };

        if (!isRefresh) {
          console.log("=== DEBUG: Datos de contacto cargados ===");
          console.log("Datos del usuario:", userData);
          console.log("Datos de contacto actualizados:", contactData.value);
        } else {
          console.log("=== DEBUG: Datos de contacto recargados ===");
        }
      } else {
        showError(
          "Error",
          apiResponse.comments || "No se pudieron cargar los datos del usuario"
        );
      }
    } else {
      // Fallback para estructura directa
      const userData = response;
      if (userData && userData.email) {
        contactData.value = {
          phone: userData.phoneNumber || "",
          primaryEmail: userData.email || "",
          backupEmails: userData.alternativeEmails || [],
        };

        if (!isRefresh) {
          console.log("=== DEBUG: Datos de contacto cargados (fallback) ===");
          console.log("Datos del usuario:", userData);
        }
      } else {
        showError("Error", "No se pudieron cargar los datos del usuario");
      }
    }
  } catch (error) {
    console.error("Error al cargar datos del usuario:", error);
    // Solo mostrar error si no es una recarga
    if (!isRefresh) {
      showError("Error", "No se pudieron cargar los datos del usuario");
    }
  }
};

// Inicializar el composable de emails de respaldo
const initializeBackupEmailsData = async () => {
  try {
    await initializeBackupEmails(authStore.user?.id);
  } catch (error) {
    console.error("Error al inicializar emails de respaldo:", error);
  }
};

// Watcher para actualizar el correo principal cuando cambie en el store
watch(
  () => authStore.user?.email,
  (newEmail) => {
    if (newEmail && newEmail !== contactData.value.primaryEmail) {
      console.log("Correo principal actualizado en el store:", newEmail);
      contactData.value.primaryEmail = newEmail;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // Inicializar autoAnimate solo si los elementos existen
  if (emailSelector.value) {
    autoAnimate(emailSelector.value);
  }
  if (backupSelector.value) {
    autoAnimate(backupSelector.value);
  }

  await loadUserData();
  await initializeBackupEmailsData();
});

// Funciones para manejar la interfaz
const toggleEmailSelector = () => {
  showEmailSelector.value = !showEmailSelector.value;
  if (showBackupSelector.value) {
    showBackupSelector.value = false;
  }
};

const toggleBackupSelector = () => {
  showBackupSelector.value = !showBackupSelector.value;
  if (showEmailSelector.value) {
    showEmailSelector.value = false;
  }
};

const openEditPhoneDialog = () => {
  console.log("=== DEBUG: openEditPhoneDialog ejecutado ===");
  console.log("editPhoneDialogRef.value:", editPhoneDialogRef.value);
  console.log("contactData.value:", contactData.value);

  if (editPhoneDialogRef.value && contactData.value) {
    // Obtener los datos completos del usuario para pasarlos al diálogo
    const userEmail = authStore.user?.email;
    if (userEmail) {
      // Cargar los datos completos del usuario
      searchUserByEmail(userEmail)
        .then((response) => {
          if (response && typeof response === "object" && "isValid" in response) {
            const apiResponse = response;
            if (apiResponse.isValid && apiResponse.response) {
              const fullUserData = apiResponse.response;
              console.log("Datos completos del usuario:", fullUserData);

              // Abrir el diálogo con el teléfono actual y los datos completos
              editPhoneDialogRef.value.openWithData(
                contactData.value.phone,
                fullUserData
              );
            } else {
              // Fallback: abrir solo con el teléfono
              editPhoneDialogRef.value.openWithData(contactData.value.phone);
            }
          } else {
            // Fallback: abrir solo con el teléfono
            editPhoneDialogRef.value.openWithData(contactData.value.phone);
          }
        })
        .catch((error) => {
          console.error("Error al cargar datos del usuario:", error);
          // Fallback: abrir solo con el teléfono
          editPhoneDialogRef.value.openWithData(contactData.value.phone);
        });
    } else {
      // Fallback: abrir solo con el teléfono
      editPhoneDialogRef.value.openWithData(contactData.value.phone);
    }
  } else {
    console.error("No se puede abrir el diálogo:", {
      hasDialogRef: !!editPhoneDialogRef.value,
      hasContactData: !!contactData.value,
    });
  }
};

// Funciones para manejar emails
const getOptionKey = (email) => {
  return `email-${email}-${Date.now()}`;
};

const selectPrimaryEmail = async (email) => {
  // Verificar que no sea el mismo correo que ya está activo
  if (email === primaryEmail.value) {
    showError("Error", "Este correo ya es tu correo principal");
    showEmailSelector.value = false;
    return;
  }

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
            router.push("/auth/login");
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

        // Actualizar el estado local
        contactData.value.primaryEmail = email;

        // Cerrar el selector
        showEmailSelector.value = false;

        // Mostrar mensaje de éxito
        showSuccess("Email actualizado", `Correo principal cambiado a: ${email}`);

        // Actualizar el email en el authStore para futuras consultas
        if (authStore.user) {
          authStore.user.email = email;
        }

        // Recargar los datos del usuario
        await loadUserData(true);
      }
    } catch (error) {
      console.error("Error al cambiar email principal:", error);

      // Manejar error específico de correo ya existente
      const errorMessage = error?.comments || error?.message || "Error desconocido";
      if (
        error?.code === 400 &&
        (errorMessage.includes("ya existe en la cuenta del usuario") ||
          errorMessage.includes("ya existe"))
      ) {
        showError("Error", "El correo ya existe en tu cuenta");
      } else {
        showError("Error", errorMessage || "No se pudo cambiar el correo principal");
      }
    } finally {
      // Desactivar loading
      confirmDialog.setLoading(false);
    }
  } else {
    showEmailSelector.value = false;
  }
};

const addPrimaryEmail = async (email) => {
  // Verificar que no sea el mismo correo que ya está activo
  if (email === primaryEmail.value) {
    showError("Error", "Este correo ya es tu correo principal");
    return;
  }

  try {
    console.log("Agregando correo principal:", email);

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

      // Actualizar el estado local
      contactData.value.primaryEmail = email;

      // Cerrar el selector
      showEmailSelector.value = false;

      // Mostrar mensaje de éxito
      showSuccess("Email actualizado", `Correo principal cambiado a: ${email}`);

      // Actualizar el email en el authStore para futuras consultas
      if (authStore.user) {
        authStore.user.email = email;
      }

      // Recargar los datos del usuario
      await loadUserData(true);
    }
  } catch (error) {
    console.error("Error al agregar correo principal:", error);

    // Manejar error específico de correo ya existente
    const errorMessage = error?.comments || error?.message || "Error desconocido";
    if (
      error?.code === 400 &&
      (errorMessage.includes("ya existe en la cuenta del usuario") ||
        errorMessage.includes("ya existe"))
    ) {
      showError("Error", "El correo ya existe en tu cuenta");
    } else {
      showError("Error", errorMessage || "No se pudo agregar el correo principal");
    }
  } finally {
    // Desactivar loading
    confirmDialog.setLoading(false);
  }
};

const addBackupEmail = async (email) => {
  // Usar el composable para agregar el email
  const success = await addBackupEmailComposable(email, authStore.user?.id);
};

const removeBackupEmail = async (email) => {
  try {
    console.log("Eliminando correo de respaldo:", email);

    // Usar el composable para eliminar el email
    const success = await removeBackupEmailComposable(email, authStore.user?.id);

    if (success) {
      showSuccess("Éxito", "Correo de respaldo eliminado");
    }
  } catch (error) {
    console.error("Error al eliminar correo de respaldo:", error);
    showError("Error", "No se pudo eliminar el correo de respaldo");
  }
};

const updatePhone = (newPhone) => {
  console.log("=== DEBUG: updatePhone ejecutado ===");
  console.log("Nuevo teléfono:", newPhone);
  console.log("Teléfono anterior:", contactData.value.phone);

  contactData.value.phone = newPhone;
  console.log("Teléfono actualizado en contactData:", contactData.value.phone);

  showSuccess("Éxito", "Teléfono actualizado");

  // Recargar los datos del servidor para sincronizar
  loadUserData(true);
};
</script>
