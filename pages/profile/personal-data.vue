<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <ProfileHeader
        :current-screen="'personal-data'"
        :title="'Detalles de perfil'"
        :show-back-button="true"
        @go-back="goBack"
      />

      <!-- Contenido -->
      <div class="max-full lg:max-w-2xl p-4 pt-12 mb-12 space-y-4 mx-auto flex-1">
        <!-- Loading state -->
        <div v-if="loading" class="flex flex-col items-center justify-center">
          <img
            src="/assets/logo-header.svg"
            alt="Actualizando"
            class="w-12 h-12 animate-pulse"
          />
          <span class="ml-2 text-xs text-muted-foreground"
            >Cargando datos personales...</span
          >
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p class="text-sm text-destructive">
            Error al cargar los datos:
            {{
              typeof error === "object" && error.message
                ? error.message
                : "Error desconocido"
            }}
          </p>
          <Button @click="loadUserData" variant="outline" size="sm" class="mt-2">
            Reintentar
          </Button>
        </div>

        <!-- Content -->
        <div v-else-if="personalData" class="space-y-4">
          <!-- Indicador de recarga -->
          <div v-if="isRefreshing" class="flex items-center justify-center py-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
            ></div>
            <span class="ml-2 text-sm text-muted-foreground">Actualizando datos...</span>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Nombre de Usuario</Label>
              <div
                class="h-10 bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full cursor-pointer transition-colors"
                @click="openEditDialog"
              >
                <span class="text-sm font-semibold text-card-foreground"
                  >{{
                    personalData.userName || personalData.username || "No disponible"
                  }}
                  <span class="text-sm text-muted-foreground font-medium"
                    >- clic aquí para editar</span
                  ></span
                >

                <Button variant="ghost" size="icon">
                  <Icon icon="ri:edit-line" class="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">Nombres (s)</Label>
              <div
                class="h-10 bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
              >
                <span class="text-sm font-semibold text-card-foreground">{{
                  personalData.name || personalData.firstName || "No disponible"
                }}</span>
                <Button variant="ghost" size="icon">
                  <Icon icon="uis:lock" class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">Apellido(s)</Label>
              <div
                class="h-10 bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
              >
                <span class="text-sm font-semibold text-card-foreground"
                  >{{ personalData.paternalLastName }}
                  {{ personalData.maternalLastName }}</span
                >
                <Button variant="ghost" size="icon">
                  <Icon icon="uis:lock" class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">Fecha de nacimiento</Label>
              <div
                class="h-10 bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
              >
                <span class="text-sm font-semibold text-card-foreground">{{
                  formatDate(personalData.dateBirth ?? "")
                }}</span>
                <Button variant="ghost" size="icon">
                  <Icon icon="uis:lock" class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium">Género</Label>
              <div
                class="h-10 bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
              >
                <span class="text-sm font-semibold text-card-foreground">{{
                  personalData.gender
                }}</span>
                <Button variant="ghost" size="icon">
                  <Icon icon="uis:lock" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div class="space-y-2 mt-0">
            <Label class="text-lg text-card-foreground font-semibold"
              >Boletines y avisos</Label
            >
            <div class="flex items-start space-x-2 p-2 pb-0 rounded-md">
              <Checkbox
                variant="secondary"
                class="mt-1"
                :model-value="personalData.enableMarketing ?? false"
                @update:model-value="handleNewsletterChange"
              />
              <span class="text-sm">
                Novedades sobre futuros eventos educativos organizados por el MIDE.
              </span>
            </div>
            <div class="flex items-start space-x-2 p-2 rounded-md">
              <Checkbox
                variant="secondary"
                class="mt-1"
                :model-value="personalData.enableUsePersonalData ?? false"
                @update:model-value="handleDataUsageChange"
                :disabled="true"
              />
              <span class="text-sm pt-1"> Información con fines comerciales. </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <BottomNavigation
        :showReservationButton="true"
        @open-chat="handleOpenChat"
        :showFooter="true"
      />

      <!-- Diálogos -->
      <EditPersonalDataDialog
        ref="editDialogRef"
        @update-personal-data="handleUpdatePersonalData"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUsers } from "@/composables/auth/useUsers";
import { useToast } from "@/composables/ui/useToast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/vue";
import ProfileHeader from "@/components/profile/ProfileHeader.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import EditPersonalDataDialog from "@/components/profile/EditPersonalDataDialog.vue";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// Router
const router = useRouter();

// Store y composables
const authStore = useAuthStore();
const { searchUserByEmail } = useUsers();
const { showError, showSuccess } = useToast();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Estado reactivo
const loading = ref(true);
const isRefreshing = ref(false);
const error = ref(null);
const personalData = ref(null);
const editDialogRef = ref();

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
      loading.value = true;
    }
    error.value = null;

    const userEmail = authStore.user?.email;

    if (!userEmail) {
      throw new Error("No se encontró el email del usuario autenticado");
    }

    const response = await searchUserByEmail(userEmail);

    if (response && typeof response === "object" && "isValid" in response) {
      const apiResponse = response;
      if (apiResponse.isValid && apiResponse.response) {
        personalData.value = apiResponse.response;
        if (!isRefresh) {
          console.log("=== DEBUG: Datos cargados de la API ===");
          console.log("Respuesta completa:", apiResponse);
          console.log("Datos del usuario:", personalData.value);
        } else {
          console.log("=== DEBUG: Datos recargados de la API ===");
        }
      } else {
        throw new Error(
          apiResponse.comments || "No se pudieron cargar los datos del usuario"
        );
      }
    } else {
      // Fallback para estructura directa
      const userData = response;
      if (userData && userData.email) {
        personalData.value = userData;
        if (!isRefresh) {
          console.log("=== DEBUG: Datos cargados (fallback) ===");
          console.log("Datos del usuario:", personalData.value);
        }
      } else {
        throw new Error("No se pudieron cargar los datos del usuario");
      }
    }
  } catch (err) {
    console.error("Error al cargar datos del usuario:", err);
    error.value = err;
    // Solo mostrar error si no es una recarga
    if (!isRefresh) {
      showError("Error", "No se pudieron cargar los datos del usuario");
    }
  } finally {
    loading.value = false;
  }
};

// Función de debug para ver los datos
const debugData = () => {
  console.log("=== DEBUG: Datos actuales ===");
  console.log("personalData.value:", personalData.value);
  console.log("authStore.user:", authStore.user);
  console.log("editDialogRef.value:", editDialogRef.value);

  // Verificar campos específicos
  if (personalData.value) {
    console.log("=== DEBUG: Campos específicos ===");
    console.log("userName:", personalData.value.userName);
    console.log("name:", personalData.value.name);
    console.log("paternalLastName:", personalData.value.paternalLastName);
    console.log("maternalLastName:", personalData.value.maternalLastName);
    console.log("enableMarketing:", personalData.value.enableMarketing);
    console.log("enableUsePersonalData:", personalData.value.enableUsePersonalData);
    console.log("gender:", personalData.value.gender);
    console.log("dateBirth:", personalData.value.dateBirth);
  }
};

// Función para abrir el diálogo de edición
const openEditDialog = () => {
  console.log("=== DEBUG: openEditDialog ejecutado ===");
  console.log("editDialogRef.value:", editDialogRef.value);
  console.log("personalData.value:", personalData.value);

  if (editDialogRef.value && personalData.value) {
    // Transformar los datos para que coincidan con lo que espera el diálogo
    const dialogData = {
      username: personalData.value.userName || personalData.value.username || "",
      receiveNewsletters: personalData.value.enableMarketing || false,
      acceptDataUsage: personalData.value.enableUsePersonalData || false,
      email: personalData.value.email || "",
    };

    console.log("Datos transformados para el diálogo:", dialogData);
    console.log("Datos completos del usuario:", personalData.value);
    editDialogRef.value.openWithData(dialogData, personalData.value);
  } else {
    console.error("No se puede abrir el diálogo:", {
      hasDialogRef: !!editDialogRef.value,
      hasPersonalData: !!personalData.value,
    });
  }
};

// Función para manejar actualización de datos personales
const handleUpdatePersonalData = async (updatedData) => {
  try {
    isRefreshing.value = true;

    console.log("Actualizando datos personales:", updatedData);

    // Actualizar los datos locales con los datos actualizados
    if (personalData.value) {
      personalData.value = {
        ...personalData.value,
        userName: updatedData.username || personalData.value.userName,
        enableMarketing:
          updatedData.receiveNewsletters !== undefined
            ? updatedData.receiveNewsletters
            : personalData.value.enableMarketing,
      };
    }

    showSuccess("Éxito", "Datos personales actualizados correctamente");

    // Recargar los datos del servidor para sincronizar
    await loadUserData(true);
  } catch (err) {
    console.error("Error al actualizar datos personales:", err);
    showError("Error", "No se pudieron actualizar los datos personales");
  } finally {
    isRefreshing.value = false;
  }
};

// Función para manejar cambio de newsletter
const handleNewsletterChange = async (value) => {
  try {
    console.log("Cambio de newsletter:", value);

    if (!personalData.value) {
      console.error("Error: No hay datos del usuario disponibles");
      showError("Error", "No se pudieron cargar los datos del usuario");
      return;
    }

    // Obtener el email del usuario
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      console.error("Error: No se encontró el email del usuario");
      showError("Error", "No se encontró el email del usuario");
      return;
    }

    // Usar la función del composable
    const { updateUserNewsletterPreference } = useUsers();
    const result = await updateUserNewsletterPreference(userEmail, Boolean(value));

    if (result) {
      // Actualizar el estado local
      if (personalData.value) {
        personalData.value.enableMarketing = Boolean(value);
      }
      console.log("Uso de datos actualizado exitosamente");
    }

    // Aquí puedes implementar la llamada a la API para guardar el cambio
    // Por ahora, solo actualizamos el estado local
    console.log("Newsletter actualizado localmente a:", value);
    showSuccess("Éxito", "Preferencia de newsletter actualizada");

    // Recargar los datos del servidor para sincronizar
    await loadUserData(true);
  } catch (error) {
    console.error("Error al actualizar newsletter:", error);
    showError("Error", "No se pudo actualizar la preferencia de newsletter");
  }
};

// Función para manejar cambio de uso de datos
const handleDataUsageChange = async (value) => {
  try {
    console.log("Cambio de uso de datos:", value);

    if (!personalData.value) {
      console.error("Error: No hay datos del usuario disponibles");
      showError("Error", "No se pudieron cargar los datos del usuario");
      return;
    }

    // Obtener el email del usuario
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      console.error("Error: No se encontró el email del usuario");
      showError("Error", "No se encontró el email del usuario");
      return;
    }

    // Actualizar el estado local primero
    personalData.value.enableUsePersonalData = Boolean(value);

    // Aquí puedes implementar la llamada a la API para guardar el cambio
    // Por ahora, solo actualizamos el estado local
    console.log("Uso de datos actualizado localmente a:", value);
    showSuccess("Éxito", "Preferencia de uso de datos actualizada");

    // Recargar los datos del servidor para sincronizar
    await loadUserData(true);
  } catch (error) {
    console.error("Error al actualizar uso de datos:", error);
    showError("Error", "No se pudo actualizar la preferencia de uso de datos");
  }
};

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "No especificada";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Cargar datos cuando se monta el componente
onMounted(() => {
  loadUserData();
});
</script>
